import { imgLoader, getCenterAppr, getPixRatio } from '../../utils'

import iconSprite from './img/sprite.png'

interface GameCallbacks {
  onDone?: Function,
  onFailed?: Function
}

interface Block {
  row: number,
  col: number,
  dx: number,
  dy: number,
  dw: number,
  x: number,
  y: number,
  w: number,
  h: number,
  removed?: boolean
}

interface SpriteItem {
  dx: number,
  dy: number,
  dw: number
}

interface SpriteOptions {
  src: string,
  rows: number,
  cols: number
}

class Game {
  rows: number = 0
  cols: number = 0
  repeatCount: number = 4
  imgOptions: SpriteOptions = {
    src: iconSprite,
    rows: 4,
    cols: 4
  }
  ctx: CanvasRenderingContext2D
  pixRatio: number = 1
  blockSize: number = 0
  blockSpace: number = 0

  constructor (public cvs: HTMLCanvasElement, public callbacks: GameCallbacks = {}) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.blockSpace = 3 * this.pixRatio
  }

  start (imgOptions?: SpriteOptions, repeatCount?: number) {
    if (imgOptions) {
      this.imgOptions = imgOptions
    }
    if (repeatCount) {
      this.repeatCount = repeatCount
    }

    this.updateSize()
    this.drawUI()
  }

  updateSize () {
    const opt = this.imgOptions
    const [small, large] = getCenterAppr(opt.rows * opt.cols * this.repeatCount) as number[]
    const cvsWidth = this.cvs.offsetWidth * this.pixRatio
    const maxHeight = (this.cvs.parentElement?.offsetHeight as number) * this.pixRatio
    this.rows = maxHeight > cvsWidth ? large : small
    this.cols = cvsWidth > maxHeight ? large : small
    const rowBlockSize = (maxHeight - (this.blockSpace * (this.rows - 1))) / (this.rows + 1)
    const colBlockSize = (cvsWidth - (this.blockSpace * (this.cols - 1))) / (this.cols + 1)
    this.blockSize = Math.min(rowBlockSize, colBlockSize)
    this.cvs.width = cvsWidth
    this.cvs.height = (this.rows + 1) * this.blockSize + (this.rows - 1) * this.blockSpace
  }

  drawUI () {

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

  }
}

export default Game
