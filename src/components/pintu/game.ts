import { genArr, getPixRatio, imgLoader } from "../../utils"

interface UIOptions {
  rows?: number,
  cols?: number,
  img?: string | HTMLImageElement
}

interface GameCallbacks {
  onDone?: Function
}

interface Block {
  row: number,
  col: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  _row: number,
  _col: number
}

class Game {
  ctx: CanvasRenderingContext2D
  pixRatio: number
  bSpace: number
  bWidth: number = 0
  bHeight: number = 0
  rows: number = 3
  cols: number = 3
  img: HTMLImageElement | undefined
  blocks: Block[] = []

  constructor (public cvs: HTMLCanvasElement, public callbacks: GameCallbacks = {}) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.bSpace = this.pixRatio * 2
    this.addListeners()
  }

  async start (options: UIOptions = {}) {
    if (options.rows) {
      this.rows = options.rows
    }
    this.cols = options.cols || options.rows || this.cols
    let { img } = options
    if (img) {
      this.img = await imgLoader(img)
    } else if (!this.img) {
      throw Error('Missing option: img')
    }

    this.updateSize()
    this.blocks = this.genBlocks()
    this.drawUI()
  }

  updateSize () {
    const width = this.cvs.offsetWidth * this.pixRatio
    const maxHeight = this.cvs.parentElement?.offsetHeight as number * this.pixRatio
    this.bWidth = (width - (this.cols - 1) * this.bSpace) / this.cols
    this.bHeight = width * (this.rows / this.cols) < maxHeight
      ? this.bWidth
      : (maxHeight - (this.rows - 1) * this.bSpace) / this.rows
    this.cvs.width = width
    this.cvs.height = this.bHeight * this.rows + (this.rows - 1) * this.bSpace
  }

  drawUI () {
    const { ctx, cvs, bWidth, bHeight, bSpace } = this
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    this.blocks.forEach(_ => {
      ctx.drawImage(
        this.img as HTMLImageElement,
        _.dx,
        _.dy,
        _.dw,
        _.dh,
        (bWidth + bSpace) * _.col,
        (bHeight + bSpace) * _.row,
        bWidth,
        bHeight
      )
    })
  }

  genBlocks () {
    const { img, rows, cols } = this
    const imgWidth = img?.naturalWidth as number
    const imgHeight = img?.naturalHeight as number
    const dw = imgWidth / cols
    const dh = imgHeight / rows
    const blocks = genArr(rows).reduce((t: Block[], a, row) => {
      return t.concat(
        genArr(cols).map((b, col) => {
          return { row, col, _row: row, _col: col, dw, dh, dx: dw * col, dy: dh * row }
        })
      )
    }, [])
    blocks.pop()
    const grids = blocks.map(_ => ({ row: _.row, col: _.col })).sort(() => Math.random() - .5)
    return blocks.map((_, i) => {
      const gridItem = grids[i]
      return { ..._, row: gridItem.row, col: gridItem.col }
    })
  }

  getCurBlock (event: MouseEvent) {
    const ex = (event.offsetX || event.pageX) * this.pixRatio
    const ey = (event.offsetY || event.pageY) * this.pixRatio
    const { bWidth, bHeight, bSpace } = this
    return this.blocks.find(_ => {
      const x = (bWidth + bSpace) * _.col
      const y = (bHeight + bSpace) * _.row
      return ex > x && ex < x + bWidth && ey > y && ey < y + bHeight
    })
  }

  isDone () {
    return this.blocks.every(_ => _.row === _._row && _.col === _._col)
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
    const block = this.getCurBlock(event)
    if (block) {

    }
  }

  onResize () {

  }
}

export default Game
