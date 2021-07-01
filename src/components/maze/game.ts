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
  private rows = 0
  private cols = 0
  private realRows = 0
  private realCols = 0
  private wallWidth = 0
  private cellWidth = 0
  private grid: Block[][] = []
  private startPoint: Point | undefined
  private endPoint: Point | undefined
  private ball: Ball | undefined
  private moveSpeed = 0
  private tid: number | undefined = undefined
  private aniFrame: number | undefined = undefined
  private gameHandle: HTMLDivElement

  constructor (private cvs: HTMLCanvasElement, private callbacks: GameCallbacks) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.gameHandle = this.createController()
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

  updateSize (options: UiOptions) {
    this.cols = options.cols || this.cols || 20
    const width = this.cvs.offsetWidth * this.pixRatio
    const maxWallWidth = width / (this.cols * 2 + 1)
    const wallWidth = Math.min(maxWallWidth, options.wallWidth || this.pixRatio)
    const cellWidth = (width - (this.cols + 1) * wallWidth) / this.cols
    const maxHeight = (this.cvs.parentElement?.offsetHeight as number) * this.pixRatio
    const maxRows = Math.floor((maxHeight - wallWidth) / (cellWidth + wallWidth))
    this.rows = Math.min(maxRows, options.rows || this.cols)
    this.realRows = this.rows * 2 - 1
    this.realCols = this.cols * 2 - 1
    this.cellWidth = cellWidth
    this.wallWidth = wallWidth
    this.cvs.width = width
    this.cvs.height = this.rows * (cellWidth + wallWidth) + wallWidth
  }

  getStartPoint () {
    let col = getRandInt(0, this.grid[0].length - 1)
    if (col % 2) col -= 1
    const space = this.cellWidth + this.wallWidth
    return {
      x: col / 2 * space + space / 2,
      y: space - this.cellWidth / 2
    }
  }

  getEndPoint () {
    const row = this.grid.length - 1
    let col = getRandInt(0, this.grid[row].length - 1)
    if (col % 2) col -= 1
    const space = this.cellWidth + this.wallWidth
    return {
      x: col / 2 * space + this.wallWidth / 2,
      y: this.cvs.height - this.wallWidth
    }
  }

  drawStartPosition () {
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

  drawEndPosition () {
    const { ctx, cellWidth, wallWidth } = this
    const { x, y } = this.endPoint as Point
    ctx.clearRect(x, y - 1, cellWidth, wallWidth + 1)
    ctx.save()
    ctx.strokeStyle = '#0f0'
    ctx.beginPath()
    ctx.moveTo(x + cellWidth / 5, y - cellWidth * 2 / 5)
    ctx.lineTo(x + cellWidth / 2, y)
    ctx.lineTo(x + cellWidth * 4 / 5, y - cellWidth * 2 / 5)
    ctx.lineTo(x + cellWidth / 2, y)
    ctx.lineTo(x + cellWidth / 2, y - cellWidth * 4 / 5)
    ctx.stroke()
    ctx.restore()
  }

  drawBall () {
    const { ctx } = this
    const { x, y, r } = this.ball as Ball
    ctx.save()
    ctx.fillStyle = '#4298f2'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fill()
    ctx.restore()
  }

  drawUI () {
    const { cvs, ctx, wallWidth } = this
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    this.drawStartPosition()
    ctx.save()
    ctx.strokeStyle = '#555'
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

  getWallCoord (wall: Block) {
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

  genGrid () {
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

  getBlock (cell: Block, dir: Direction, type = BlockType.CELL) {
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

  genMap () {
    const startTime = Date.now()
    const waitCheckCells = [this.grid[0][0]]
    const { TOP, RIGHT, BOTTOM, LEFT } = Direction
    let count = 0
    while (waitCheckCells.length && ++count < 10000) {
      const cell = waitCheckCells.pop() as Block
      if (cell.flag) continue
      cell.flag = true
      const tCell = this.getBlock(cell, TOP)
      const rCell = this.getBlock(cell, RIGHT)
      const bCell = this.getBlock(cell, BOTTOM)
      const lCell = this.getBlock(cell, LEFT)
      let cells = [tCell, rCell, bCell, lCell].filter(_ => _ && !_.flag)
      if (cells.length) {
        const current = cells[getRandInt(0, cells.length - 1)]
        waitCheckCells.push(...cells)
        const wall = this.getBlock(
          cell,
          current === tCell ? TOP : current === rCell ? RIGHT : current === bCell ? BOTTOM : LEFT,
          BlockType.WALL
        )
        if (wall) {
          wall.type = BlockType.CELL
        }
      }
    }
    console.log(Date.now() - startTime, count)
  }

  createController () {
    const div = document.createElement('div')
    div.className = styleModule.gameHandle
    div.innerHTML = genArr(4).map(_ => '<a></a>').join('')
    this.cvs.parentElement?.appendChild(div)
    return div
  }

  stopTimer () {
    clearTimeout(this.tid)
    cancelAnimationFrame(this.aniFrame as number)
    this.tid = this.aniFrame = undefined
  }

  move (dir: Direction) {

  }

  onHandleTouchstart (event: TouchEvent) {

  }

  onResize () {

  }

  onKeyup (event: KeyboardEvent) {
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
  }

  addListeners () {
    window.addEventListener('resize', this.onResize.bind(this))
    document.addEventListener('keyup', this.onKeyup.bind(this))
    this.gameHandle.addEventListener('touchstart', this.onHandleTouchstart.bind(this))
  }

  removeListeners () {
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('keyup', this.onKeyup)
    this.gameHandle.removeEventListener('touchstart', this.onHandleTouchstart)
  }
}

export default Game
