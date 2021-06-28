import { getPixRatio } from "../../utils"

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

class Game {
  private ctx
  private pixRatio
  private rows = 0
  private cols = 0
  private wallWidth = 0
  private cellWidth = 0
  private grid: Block[][] = []

  constructor (private cvs: HTMLCanvasElement, private callbacks: GameCallbacks) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
  }

  start (options: UiOptions = {}) {
    this.updateSize(options)
    this.grid = this.genGrid()
    this.drawUI()
  }

  updateSize (options: UiOptions) {
    this.cols = options.cols || this.cols || 15
    const width = this.cvs.offsetWidth * this.pixRatio
    const maxWallWidth = width / (this.cols * 2 + 1)
    const wallWidth = Math.min(maxWallWidth, options.wallWidth || this.pixRatio)
    const cellWidth = (width - (this.cols + 1) * wallWidth) / this.cols
    const maxHeight = (this.cvs.parentElement?.offsetHeight as number) * this.pixRatio
    const maxRows = Math.floor((maxHeight - wallWidth) / (cellWidth + wallWidth))
    this.rows = Math.min(maxRows, options.rows || this.cols)
    this.cellWidth = cellWidth
    this.wallWidth = wallWidth
    this.cvs.width = width
    this.cvs.height = this.rows * (cellWidth + wallWidth) + wallWidth
  }

  drawStartPosition () {

  }

  drawEndPosition () {

  }

  drawBall () {

  }

  drawUI () {
    const { cvs, ctx, wallWidth } = this
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    this.drawStartPosition()
    ctx.save()
    ctx.strokeStyle = '#000'
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
    const rows = this.rows * 2 - 1
    const cols = this.cols * 2 - 1
    for (let row = 0; row < rows; row++) {
      grid[row] = []
      for (let col = 0; col < cols; col++) {
        grid[row][col] = {
          row,
          col,
          type: row % 2 || col % 2 ? BlockType.WALL : BlockType.CELL
        }
      }
    }
    return grid
  }

  onResize () {

  }

  onKeyup () {

  }

  addListeners () {
    window.addEventListener('resize', this.onResize.bind(this))
    document.addEventListener('keyup', this.onKeyup.bind(this))
  }

  removeListeners () {
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('keyup', this.onKeyup)
  }
}

export default Game
