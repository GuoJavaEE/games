import { getPixRatio, imgLoader } from "../../utils"

interface UIOptions {
  rows?: number,
  cols?: number,
  img?: string | HTMLImageElement
}

interface Block {
  row: number,
  col: number,
  dx: number,
  dy: number
}

class Game {
  ctx: CanvasRenderingContext2D
  pixRatio: number
  blockSpace: number
  blockWidth: number = 0
  blockHeight: number = 0
  rows: number = 3
  cols: number = 3
  img: HTMLImageElement | undefined

  constructor (public cvs: HTMLCanvasElement) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.blockSpace = this.pixRatio * 3
  }

  async start (options: UIOptions = {}) {
    if (options.rows) {
      this.rows = options.rows
    }
    this.cols = options.cols || options.rows || this.cols
    let { img } = options
    if (img) {
      if (typeof img === 'string') {
        img = await imgLoader(img)
      }
      this.img = img
    } else if (!this.img) {
      throw Error('Missing option: img')
    }

    this.updateSize()
    this.drawUI()
  }

  updateSize () {
    const width = this.cvs.offsetWidth * this.pixRatio
  }

  drawUI () {

  }

  addListeners () {
    this.cvs.addEventListener('click', this.onClick.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))
  }

  onClick (event: MouseEvent) {

  }

  onResize () {

  }
}

export default Game
