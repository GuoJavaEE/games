import { getPixRatio } from "../../utils"

interface GameCallbacks {
  onDone?: (score: number) => void
}

class Block {
  constructor (public row: number, public col: number, public color: string) {}

  draw (ctx: CanvasRenderingContext2D, bSize: number, bSpace: number) {
    const x = (bSize + bSpace) * this.col
    const y = (bSize + bSpace) * this.row
    ctx.save()
    ctx.fillStyle = this.color
    ctx.fillRect(x, y, x + bSize, y + bSize)
    ctx.restore()
  }
}

class Game {
  rows = 10
  cols = 10
  pixRatio: number
  ctx: CanvasRenderingContext2D
  constructor (public cvs: HTMLCanvasElement, public callbacks: GameCallbacks = {}) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.addListeners()
  }

  updateSize () {

  }

  drawUI () {

  }

  onClick () {

  }

  onResize () {
    this.updateSize()
    this.drawUI()
  }

  addListeners () {
    this.cvs.addEventListener('click', this.onClick.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))
  }

  removeListeners () {
    this.cvs.removeEventListener('click', this.onClick)
    window.removeEventListener('resize', this.onResize)
  }
}

export default Game
