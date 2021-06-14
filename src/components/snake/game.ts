import { genArr, getPixRatio, getRandInt } from "../../utils"

interface GameCallbacks {
  onDone?: Function,
  onFailed?: Function
}

enum MoveDirection { UP, RIGHT, DOWN, LEFT }

class Block {
  constructor (public row: number, public col: number) {}

  draw (ctx: CanvasRenderingContext2D, blockSize: number, lineWidth: number) {
    ctx.fillRect(
      (blockSize + lineWidth) * this.col + lineWidth,
      (blockSize + lineWidth) * this.row + lineWidth,
      blockSize,
      blockSize
    )
  }
}

class Snake {
  constructor (public coords: Block[]) {}

  draw (ctx: CanvasRenderingContext2D, blockSize: number, lineWidth: number) {
    ctx.save()
    ctx.fillStyle = '#000'
    this.coords.forEach(_ => {
      _.draw(ctx, blockSize, lineWidth)
    })
    ctx.restore()
  }

  move (dir: MoveDirection) {

  }

  eat () {

  }
}

class Food extends Block {
  draw (ctx: CanvasRenderingContext2D, blockSize: number, lineWidth: number) {
    ctx.save()
    ctx.fillStyle = '#00f'
    super.draw(ctx, blockSize, lineWidth)
    ctx.restore()
  }
}

class Game {
  ctx: CanvasRenderingContext2D
  pixRatio: number
  rows: number = 20
  cols: number = 20
  lineWidth: number = 1
  blockSize: number = 0
  snake: Snake | undefined
  food: Food | undefined

  constructor (public cvs: HTMLCanvasElement, public callbacks: GameCallbacks) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.lineWidth = this.pixRatio
  }

  addListeners () {
    this.cvs.addEventListener('click', this.onClick.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))
  }

  removeListeners () {
    this.cvs.removeEventListener('click', this.onClick)
    window.removeEventListener('resize', this.onResize)
  }

  onClick (event: MouseEvent) {

  }

  onResize () {
    this.updateSize()
    this.drawGrid()
  }

  start (rows?: number, cols?: number) {
    this.updateSize(rows, cols)
    this.snake = this.createSnake()
    this.food = this.createFood()
    this.drawUI()
  }

  pause () {

  }

  updateSize (rows?: number, cols?: number) {
    const { lineWidth } = this
    this.cols = cols || rows || this.cols
    const cvsWidth = this.cvs.offsetWidth * this.pixRatio
    this.blockSize = (cvsWidth - lineWidth * (this.cols + 1)) / this.cols
    const maxHeight = (this.cvs.parentElement?.offsetHeight as number) * this.pixRatio
    const maxRow = Math.floor((maxHeight - lineWidth) / (this.blockSize + lineWidth))
    this.rows = Math.min(maxRow, rows || this.rows)
    this.cvs.width = cvsWidth
    this.cvs.height = (lineWidth + this.blockSize) * this.rows + lineWidth
  }

  createSnake () {
    const row = Math.floor(this.rows / 2)
    const col = Math.floor(this.cols / 2)
    return new Snake([
      new Block(row - 1, col),
      new Block(row, col),
      new Block(row + 1, col)
    ])
  }

  createFood () {
    const snakeCoords = this.snake?.coords.map(_ => `${_.row}:${_.col}`) || []
    const blocks: [number, number][] = genArr(this.rows).reduce((t, _, row) => {
      return t.concat(
        genArr(this.cols).map((_, col) => {
          return [row, col]
        })
      )
    }, []).filter((_: any) => {
      return snakeCoords.indexOf(`${_[0]}:${_[1]}`) < 0
    })
    return new Food(...blocks[getRandInt(0, blocks.length - 1)])
  }

  drawUI () {
    const { cvs, ctx, blockSize, lineWidth } = this
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    this.drawGrid()
    this.snake?.draw(ctx, blockSize, lineWidth)
    this.food?.draw(ctx, blockSize, lineWidth)
  }

  drawGrid () {
    const { width, height } = this.cvs
    const { ctx, lineWidth, blockSize } = this
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = '#888'
    genArr(this.rows + 1).forEach((_, row) => {
      const y = (lineWidth + blockSize) * row + lineWidth / 2
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    })
    genArr(this.cols + 1).forEach((_, col) => {
      const x = (lineWidth + blockSize) * col + lineWidth / 2
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    })
    ctx.stroke()
  }
}

export default Game
