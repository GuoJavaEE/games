import { delayCall, genArr, getPixRatio, getRandInt } from "../../utils"

interface GameCallbacks {
  onDone?: (score: number) => void,
  onError?: (e: Error) => void
}

interface UIOptions {
  rows?: number,
  cols?: number,
  colors?: string[]
}

class Block {
  constructor (public row: number, public col: number, public color: string) {}

  draw (ctx: CanvasRenderingContext2D, bWidth: number, bHeight: number, bSpace: number) {
    const x = (bWidth + bSpace) * this.col
    const y = (bHeight + bSpace) * this.row
    ctx.save()
    ctx.fillStyle = this.color
    ctx.fillRect(x, y, bWidth, bHeight)
    ctx.restore()
  }
}

class Game {
  rows = 10
  cols = 10
  pixRatio: number
  ctx: CanvasRenderingContext2D
  blocks: Block[] = []
  colors = ['#22a6ea','#f44e4e','#b3cc25','#f1a30c','#b854e6']
  bSpace: number
  bWidth = 0
  bHeight = 0
  score = 0

  constructor (public cvs: HTMLCanvasElement, public callbacks: GameCallbacks = {}) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.bSpace = this.pixRatio
    this.addListeners()
  }

  start (options: UIOptions = {}) {
    if (options.rows) {
      this.rows = options.rows
    }
    this.cols = options.cols || options.rows || this.cols
    if (options.colors) {
      if (options.colors.length < 3) {
        return delayCall(this.callbacks.onError, new Error('请至少提供3种色值！'), 0)
      }
      this.colors = options.colors
    }
    this.score = 0

    this.updateSize()
    this.blocks = this.genBlocks()
    this.drawUI()
  }

  updateSize () {
    const width = this.cvs.offsetWidth * this.pixRatio
    this.bWidth = (width - (this.cols - 1) * this.bSpace) / this.cols
    const maxHeight = (this.cvs.parentElement?.offsetHeight as number) * this.pixRatio
    this.bHeight = this.bWidth * this.rows + (this.rows - 1) * this.bSpace < maxHeight
      ? this.bWidth
      : (maxHeight - (this.rows - 1) * this.bSpace) / this.rows
    this.cvs.width = width
    this.cvs.height = this.bHeight * this.rows + (this.rows - 1) * this.bSpace
  }

  drawUI () {
    const { ctx, cvs } = this
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    this.blocks.forEach(_ => {
      _.draw(ctx, this.bWidth, this.bHeight, this.bSpace)
    })
  }

  genBlocks () {
    const { colors } = this
    const len = this.rows * this.cols
    const randColors = [
      ...colors,
      ...colors,
      ...genArr(len - colors.length * 2)
        .map(() => colors[getRandInt(0, colors.length - 1)])
    ].sort(() => Math.random() - .5)

    const blocks = genArr(this.rows).reduce((t: Block[], a, row) => {
      return [
        ...t,
        ...genArr(this.cols).map((b, col) => new Block(row, col, '#000'))
      ]
    }, [])

    blocks.forEach((_, i) => {
      _.color = randColors[i]
    })

    return blocks
  }

  getCurBlock (event: MouseEvent) {
    const { bWidth, bHeight, bSpace } = this
    const ex = (event.offsetX || event.pageX) * this.pixRatio
    const ey = (event.offsetY || event.pageY) * this.pixRatio
    return this.blocks.find(_ => {
      const x = (bWidth + bSpace) * _.col
      const y = (bHeight + bSpace) * _.row
      return ex > x && ex < x + bWidth && ey > y && ey < y + bHeight
    })
  }

  getSameBlocks (block: Block) {
    const get = (row: number, col: number) => this.blocks.find(_ => _.row === row && _.col === col)
    const waitChecked = [block]
    const rtnBlocks: Block[] = []
    while (waitChecked.length) {
      const current = waitChecked.pop() as Block
      rtnBlocks.push(current)
      ;[
        get(current.row - 1, current.col),
        get(current.row, current.col + 1),
        get(current.row + 1, current.col),
        get(current.row, current.col - 1)
      ]
        .filter(_ => _ && _.color === block.color)
        .forEach(_ => {
          !rtnBlocks.includes(_ as Block) && !waitChecked.includes(_ as Block) && waitChecked.push(_ as Block)
        })
    }
    return rtnBlocks
  }

  removeBlocks (blocks: Block[]) {
    blocks.forEach(_ => {
      this.blocks.splice(this.blocks.indexOf(_), 1)
    })
  }

  drawScores (blocks: Block[]) {
    const text = `+${blocks.length}`
    const { bWidth, bHeight, bSpace, ctx } = this
    const fontSize = Math.min(bWidth * .4, bHeight * .4) + 'px'
    const fontWidth = ctx.measureText(text).width
    ctx.save()
    ctx.font = `bold ${fontSize} serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#555'
    blocks.forEach(_ => {
      const x = (bWidth + bSpace) * _.col + (bWidth - fontWidth) / 2 + this.pixRatio
      const y = (bHeight + bSpace) * _.row + (bHeight - fontWidth) / 2 + this.pixRatio * 4
      ctx.fillText(text, x, y)
    })
    ctx.restore()
    return new Promise(resolve => setTimeout(resolve, 300))
  }

  moveBlocks (blocks: Block[]) {
    this.blocks.forEach(_ => {
      _.row += blocks.filter(a => a.col === _.col && a.row > _.row).length
    })
    const emptyCols = genArr(this.cols).map((_, i) => i).filter(col => {
      return !this.blocks.filter(_ => _.col === col).length
    })
    this.blocks.forEach(_ => {
      _.col -= emptyCols.filter(a => a < _.col).length
    })
  }

  isDone () {
    return this.blocks.every(_ => this.getSameBlocks(_).length < 2)
  }

  onClick (event: MouseEvent) {
    const block = this.getCurBlock(event)
    if (block) {
      const sameBlocks = this.getSameBlocks(block)
      const len = sameBlocks.length
      if (len > 1) {
        this.score += len * len
        this.removeBlocks(sameBlocks)
        this.drawUI()
        this.moveBlocks(sameBlocks)
        this.drawScores(sameBlocks).then(() => {
          this.drawUI()
          this.isDone() && delayCall(this.callbacks.onDone, this.score)
        })
      }
    }
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
