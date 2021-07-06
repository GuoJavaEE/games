// @ts-ignore
import Color from 'color'
import { delayCall, genArr, getPixRatio, getRandInt } from "../../utils"
import styleModule from './style.module.less'

interface GameCallbacks {
  onDone?: Function
}

interface UiOptions {
  rows?: number,
  cols?: number,
  wallWidth?: number
}

enum BlockType { CELL, WALL }

interface Block {
  row: number,
  col: number,
  type: BlockType,
  flag?: boolean
}

interface Point {
  x: number,
  y: number
}

interface Ball extends Point {
  r: number
}

enum Direction { TOP, RIGHT, BOTTOM, LEFT }

class Game {
  private ctx
  private pixRatio
  rows = 0
  cols = 0
  private realRows = 0
  private realCols = 0
  wallWidth = 0
  private cellWidth = 0
  private grid: Block[][] = []
  private startPoint: Point | undefined
  private endPoint: Point | undefined
  private ball: Ball | undefined
  private moveSpeed = 0
  private tid: number | undefined = undefined
  private aniFrame: number | undefined = undefined
  private gameHandle: HTMLDivElement | undefined
  private wallColor = '#515a6e'
  private wayOutColor = '#0f0'
  private gameCvs
  private gameCtx

  constructor (private cvs: HTMLCanvasElement, private callbacks: GameCallbacks = {}) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.gameCvs = this.createGameCvs(cvs)
    this.gameCtx = this.gameCvs.getContext('2d') as CanvasRenderingContext2D
    if ('ontouchstart' in document) {
      this.gameHandle = this.createController()
    }
    this.addListeners()
  }

  start (options: UiOptions = {}) {
    this.stopTimer()
    this.updateSize(options)
    this.grid = this.genGrid()
    this.startPoint = this.getStartPoint()
    this.endPoint = this.getEndPoint()
    this.ball = { ...this.startPoint, r: this.cellWidth * .32 }
    this.moveSpeed = Math.floor(Math.min(this.pixRatio * 2, (this.cellWidth - this.ball.r * 2 - this.pixRatio) / 2)) || 1
    this.genMap()
    this.drawUI()
  }

  private createGameCvs (cvs: HTMLCanvasElement) {
    const gameCvs = document.createElement('canvas')
    gameCvs.className = styleModule.gameCvs
    const parentEl = cvs.parentElement as HTMLDivElement
    parentEl.appendChild(gameCvs)
    return gameCvs
  }

  private updateSize (options: UiOptions = {}) {
    this.cols = options.cols || this.cols || 16
    const width = this.cvs.offsetWidth * this.pixRatio
    const maxWallWidth = width / (this.cols * 2 + 1)
    const wallWidth = Math.min(maxWallWidth, options.wallWidth || this.pixRatio * 5)
    const cellWidth = (width - (this.cols + 1) * wallWidth) / this.cols
    const maxHeight = (this.cvs.parentElement?.offsetHeight as number) * this.pixRatio
    const maxRows = Math.floor((maxHeight - wallWidth) / (cellWidth + wallWidth))
    this.rows = Math.min(maxRows, options.rows || this.cols)
    this.realRows = this.rows * 2 - 1
    this.realCols = this.cols * 2 - 1
    this.cellWidth = cellWidth
    this.wallWidth = wallWidth
    this.cvs.width = this.gameCvs.width = width
    this.cvs.height = this.gameCvs.height = this.rows * (cellWidth + wallWidth) + wallWidth
  }

  private getStartPoint () {
    const col = getRandInt(0, this.cols - 1)
    const { cellWidth, wallWidth } = this
    return {
      x: (cellWidth + wallWidth) * (col + 1 / 2),
      y: wallWidth + cellWidth / 2 - this.pixRatio / 2
    }
  }

  private getEndPoint () {
    const col = getRandInt(0, this.cols - 1)
    const { cellWidth, wallWidth } = this
    return {
      x: (cellWidth + wallWidth) * col + wallWidth / 2,
      y: this.cvs.height - this.wallWidth
    }
  }
 
  private drawStartPosition () {
    const { ctx, wallWidth, cellWidth } = this
    const { x, y } = this.startPoint as Point
    ctx.save()
    ctx.fillStyle = '#e33'
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x - cellWidth / 2, wallWidth)
    ctx.lineTo(x + cellWidth / 2, wallWidth)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  private drawEndPosition () {
    const { ctx, cellWidth, wallWidth } = this
    const { x, y } = this.endPoint as Point
    ctx.clearRect(x, y - 1, cellWidth, wallWidth + 1)
    ctx.save()
    ctx.strokeStyle = this.wayOutColor
    ctx.beginPath()
    ctx.moveTo(x + cellWidth / 5, y - cellWidth * 2 / 5)
    ctx.lineTo(x + cellWidth / 2, y)
    ctx.lineTo(x + cellWidth * 4 / 5, y - cellWidth * 2 / 5)
    ctx.lineTo(x + cellWidth / 2, y)
    ctx.lineTo(x + cellWidth / 2, y - cellWidth * 4 / 5)
    ctx.stroke()
    ctx.restore()
  }

  private drawBall () {
    const ctx = this.gameCtx
    const { x, y, r } = this.ball as Ball
    ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)
    ctx.save()
    ctx.fillStyle = '#4298f2'
    ctx.beginPath()
    ctx.arc(x, y - 1, r, 0, 2 * Math.PI)
    ctx.fill()
    ctx.restore()
  }

  private drawUI () {
    const { cvs, ctx, wallWidth } = this
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    this.drawStartPosition()
    ctx.save()
    ctx.strokeStyle = this.wallColor
    ctx.lineWidth = wallWidth
    ctx.strokeRect(wallWidth / 2, wallWidth / 2, cvs.width - wallWidth, cvs.height - wallWidth)
    this.grid.forEach(rows => {
      rows.forEach(_ => {
        if (_.type === BlockType.WALL) {
          const coord = this.getWallCoord(_)
          if (coord) {
            ctx.beginPath()
            ctx.moveTo(coord.x1, coord.y1)
            ctx.lineTo(coord.x2, coord.y2)
            ctx.stroke()
          }
        }
      })
    })
    ctx.restore()
    this.drawEndPosition()
    this.drawBall()
  }

  private getWallCoord (wall: Block) {
    let x1
    let y1
    let x2
    let y2
    const { row, col } = wall
    const { wallWidth, cellWidth } = this
    const space = wallWidth + cellWidth
    if (row % 2) {
      if (col % 2) return
      x1 = col / 2 * space - wallWidth / 2
      y1 = y2 = (row + 1) / 2 * space
      x2 = x1 + space + wallWidth
    } else {
      x1 = x2 = (col + 1) / 2 * space
      y1 = row / 2 * space - wallWidth / 2
      y2 = y1 + space + wallWidth
    }
    return { x1, y1, x2, y2 }
  }

  private genGrid () {
    const grid: Block[][] = []
    const { realRows, realCols } = this
    for (let row = 0; row < realRows; row++) {
      grid[row] = []
      for (let col = 0; col < realCols; col++) {
        grid[row][col] = {
          row,
          col,
          type: row % 2 || col % 2 ? BlockType.WALL : BlockType.CELL
        }
      }
    }
    return grid
  }

  private getBlock (cell: Block, dir: Direction, type = BlockType.CELL) {
    const { grid } = this
    const get = (row: number, col: number) => grid[row] && grid[row][col]
    const { row, col } = cell
    const step = type === BlockType.WALL ? 1 : 2
    return dir === Direction.TOP
      ? get(row - step, col)
      : dir === Direction.RIGHT
        ? get(row, col + step)
        : dir === Direction.BOTTOM
          ? get(row + step, col)
          : get(row, col - step)
  }

  private genMap () {
    const startTime = Date.now()
    let curCell: Block = this.grid[0][0]
    const history: Block[] = [curCell]
    const { TOP, RIGHT, BOTTOM, LEFT } = Direction
    const getWall = (cell: Block, dir: Direction) => this.getBlock(cell, dir, BlockType.WALL)
    while (history.length) {
      curCell.flag = true
      const tCell = this.getBlock(curCell, TOP)
      const rCell = this.getBlock(curCell, RIGHT)
      const bCell = this.getBlock(curCell, BOTTOM)
      const lCell = this.getBlock(curCell, LEFT)
      const cells = [tCell, rCell, bCell, lCell].filter(_ => _ && !_.flag)
      if (cells.length) {
        history.push(curCell)
        const rndCell = cells[getRandInt(0, cells.length - 1)]
        let wall
        if (rndCell === tCell) {
          wall = getWall(curCell, TOP)
          curCell = tCell
        } else if (rndCell === rCell) {
          wall = getWall(curCell, RIGHT)
          curCell = rCell
        } else if (rndCell === bCell) {
          wall = getWall(curCell, BOTTOM)
          curCell = bCell
        } else {
          wall = getWall(curCell, LEFT)
          curCell = lCell
        }
        wall.type = BlockType.CELL
      } else {
        curCell = history.pop() as Block
      }
    }
    console.log(Date.now() - startTime)
  }

  private createController () {
    const div = document.createElement('div')
    div.className = styleModule.gameHandle
    div.innerHTML = genArr(4).map(_ => '<a></a>').join('')
    this.cvs.parentElement?.appendChild(div)
    return div
  }

  private stopTimer () {
    clearTimeout(this.tid)
    cancelAnimationFrame(this.aniFrame as number)
    this.tid = this.aniFrame = undefined
  }

  private isWall (pixData: Uint8ClampedArray) {
    for (let i = 0, len = pixData.length; i < len; i += 4) {
      const color = new Color([pixData[i], pixData[i + 1], pixData[i + 2]]).toString()
      if (color === new Color(this.wallColor).toString()) {
        return true
      }
    }
  }

  private isDone () {
    const { cellWidth } = this
    const { x: x1, y: y1 } = this.ball as Ball
    const { x, y } = this.endPoint as Point
    const x2 = x + cellWidth * .5
    const y2 = y - cellWidth * .5
    return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) < Math.pow(cellWidth * .5, 2)
  }

  private moveUp () {
    const speed = this.moveSpeed
    const getPixData = () => {
      const { x, y, r } = this.ball as Ball
      return this.ctx.getImageData(x - r, y - r - speed, r * 2, speed).data
    }
    if (this.isWall(getPixData())) return
    (this.ball as Ball).y -= speed
    if (this.isWall(getPixData())) {
      (this.ball as Ball).y += 1
    }
  }

  private moveRight () {
    const speed = this.moveSpeed
    const getPixData = () => {
      const { x, y, r } = this.ball as Ball
      return this.ctx.getImageData(x + r, y - r, speed, r * 2).data
    }
    if (this.isWall(getPixData())) return
    (this.ball as Ball).x += speed
    if (this.isWall(getPixData())) {
      (this.ball as Ball).x -= 1
    }
  }

  private moveDown () {
    const speed = this.moveSpeed
    const getPixData = () => {
      const { x, y, r } = this.ball as Ball
      return this.ctx.getImageData(x - r, y + r, r * 2, speed).data
    }
    if (this.isWall(getPixData())) return
    (this.ball as Ball).y += speed
    if (this.isWall(getPixData())) {
      (this.ball as Ball).y -= 1
    }
  }

  private moveLeft () {
    const speed = this.moveSpeed
    const getPixData = () => {
      const { x, y, r } = this.ball as Ball
      return this.ctx.getImageData(x - r - speed, y - r, speed, r * 2).data
    }
    if (this.isWall(getPixData())) return
    (this.ball as Ball).x -= speed
    if (this.isWall(getPixData())) {
      (this.ball as Ball).x += 1
    }
  }

  private move (dir: Direction) {
    if (this.tid || this.aniFrame) return
    const { TOP, RIGHT, BOTTOM, LEFT } = Direction
    const action = { [TOP]: 'moveUp', [RIGHT]: 'moveRight', [BOTTOM]: 'moveDown', [LEFT]: 'moveLeft' }[dir]
    const moveFn = () => {
      // @ts-ignore
      this[action]()
      this.drawBall()
    }
    const animate = () => {
      if (this.isDone()) {
        return delayCall(this.callbacks.onDone)
      }
      moveFn()
      this.aniFrame = requestAnimationFrame(animate)
    }
    moveFn()
    this.tid = setTimeout(animate, 60)
  }

  private onHandleTouchstart (event: TouchEvent) {
    event.preventDefault()
    const { target } = event
    const els = Array.from((this.gameHandle as HTMLDivElement).querySelectorAll('a'))
    const { TOP, RIGHT, BOTTOM, LEFT } = Direction
    const index = els.indexOf(target as any)
    if (index === 0) {
      this.move(TOP)
    } else if (index === 1) {
      this.move(RIGHT)
    } else if (index === 2) {
      this.move(BOTTOM)
    } else if (index === 3) {
      this.move(LEFT)
    }
    const onTouchend = () => {
      this.stopTimer()
      document.removeEventListener('touchend', onTouchend)
    }
    document.addEventListener('touchend', onTouchend)
  }

  private onKeydown (event: KeyboardEvent) {
    const { keyCode } = event
    const T = [87, 38]
    const R = [68, 39]
    const B = [83, 40]
    const L = [65, 37]
    const { TOP, RIGHT, BOTTOM, LEFT } = Direction
    if (T.includes(keyCode)) {
      this.move(TOP)
    } else if (R.includes(keyCode)) {
      this.move(RIGHT)
    } else if (B.includes(keyCode)) {
      this.move(BOTTOM)
    } else if (L.includes(keyCode)) {
      this.move(LEFT)
    }
    const onKeyup = () => {
      this.stopTimer()
      document.removeEventListener('keyup', onKeyup)
    }
    document.addEventListener('keyup', onKeyup)
  }

  private addListeners () {
    document.addEventListener('keydown', this.onKeydown.bind(this))
    this.gameHandle && this.gameHandle.addEventListener('touchstart', this.onHandleTouchstart.bind(this))
  }

  removeListeners () {
    document.removeEventListener('keydown', this.onKeydown)
    this.gameHandle && this.gameHandle.removeEventListener('touchstart', this.onHandleTouchstart)
  }
}

export default Game
