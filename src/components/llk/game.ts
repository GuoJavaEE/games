import { imgLoader, getCenterAppr, getPixRatio, genArr } from '../../utils'

import iconSprite from './img/sprite.png'

interface GameCallbacks {
  onDone?: Function,
  onFailed?: Function
}

interface SpriteItem {
  dx: number,
  dy: number,
  dw: number,
  img: HTMLImageElement
}

interface Block extends SpriteItem {
  row: number,
  col: number,
  removed?: boolean
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
    this.genBlocks().then(result => {
      console.log(result)
    })
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

  genSpriteItems (): Promise<SpriteItem[]> {
    const opt = this.imgOptions
    return imgLoader(opt.src).then(img => {
      const dw = img.width / opt.cols
      const arr = genArr(opt.rows).reduce((t, a, row) => {
        return t.concat(
          genArr(opt.cols).map((b, col) => {
            return { dw, img, dx: dw * col, dy: dw * col }
          })
        )
      }, [])
      return genArr(this.repeatCount).reduce(t => {
        return t.concat(arr)
      }, []).sort(() => Math.random() - .5)
    })
  }

  genBlocks (): Promise<Block[]> {
    return this.genSpriteItems().then(result => {
      return genArr(this.rows).reduce((t, a, row) => {
        return t.concat(
          genArr(this.cols).map((b, col) => {
            return { row, col }
          })
        )
      }, []).map((_: any, i: number) => ({ ..._, ...result[i] }))
    })
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
