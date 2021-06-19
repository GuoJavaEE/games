import { createNumAnimation, delayCall, genArr, getPixRatio, imgLoader } from "../../utils"

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
  x: number,
  y: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  _row: number,
  _col: number,
  hide?: boolean
}

enum MoveDirection { UP, RIGHT, DOWN, LEFT }

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
  createNumAnimation = createNumAnimation()

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
    this.updateSize()

    let { img } = options
    if (img) {
      this.img = await imgLoader(img)
    } else if (!this.img) {
      throw Error('Missing option: img')
    }

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
    const { ctx, cvs, bWidth, bHeight } = this
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    this.blocks.filter(_ => !_.hide).forEach(_ => {
      ctx.drawImage(
        this.img as HTMLImageElement,
        _.dx,
        _.dy,
        _.dw,
        _.dh,
        _.x,
        _.y,
        bWidth,
        bHeight
      )
    })
  }

  genBlocks () {
    const { img, rows, cols, bSpace } = this
    const imgWidth = img?.naturalWidth as number
    const imgHeight = img?.naturalHeight as number
    const dw = imgWidth / cols
    const dh = imgHeight / rows
    const blocks = genArr(rows).reduce((t: Block[], a, row) => {
      return t.concat(
        genArr(cols).map((b, col) => {
          return {
            dw,
            dh,
            row,
            col,
            _row: row,
            _col: col,
            dx: dw * col,
            dy: dh * row,
            x: (this.bWidth + bSpace) * col,
            y: (this.bHeight + bSpace) * row
          }
        })
      )
    }, [])

    const lastBlock = blocks.pop()
    if (lastBlock) {
      lastBlock.hide = true
    }

    const grids = blocks.map(_ => {
      return { row: _.row, col: _.col, x: _.x, y: _.y }
    }).sort(() => Math.random() - .5)

    return blocks.map((_, i) => {
      const gridItem = grids[i]
      return {
        ..._,
        x: gridItem.x,
        y: gridItem.y,
        row: gridItem.row,
        col: gridItem.col
      }
    }).concat(lastBlock as Block)
  }

  updateBlockCoords () {
    const { bSpace } = this
    this.blocks.forEach(_ => {
      _.x = (this.bWidth + bSpace) * _.col,
      _.y = (this.bHeight + bSpace) * _.row
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

  getSwapInfo (block: Block) {
    const { blocks } = this
    const upBlock = blocks.find(_ => _.row === block.row - 1 && _.col === block.col)
    const rightBlock = blocks.find(_ => _.row === block.row && _.col === block.col + 1)
    const downBlock = blocks.find(_ => _.row === block.row + 1 && _.col === block.col)
    const leftBlock = blocks.find(_ => _.row === block.row && _.col === block.col - 1)
    if (upBlock && upBlock.hide) {
      return { block: upBlock, dir: MoveDirection.UP }
    } else if (rightBlock && rightBlock.hide) {
      return { block: rightBlock, dir: MoveDirection.RIGHT }
    } else if (downBlock && downBlock.hide) {
      return { block: downBlock, dir: MoveDirection.DOWN }
    } else if (leftBlock && leftBlock.hide) {
      return { block: leftBlock, dir: MoveDirection.LEFT }
    }
  }

  moveBlock (curBlock: Block, { block, dir }: { block: Block, dir: MoveDirection }) {
    const drawAndCheckDone = () => {
      this.drawUI()
      this.isDone() && delayCall(this.callbacks.onDone)
    }
    if ([MoveDirection.UP, MoveDirection.DOWN].includes(dir)) {
      const curY = curBlock.y
      const curRow = curBlock.row
      this.createNumAnimation(curBlock.y, block.y, {
        onChange: v => {
          curBlock.y = v
          this.drawUI()
        },
        onEnd: () => {
          curBlock.y = block.y
          block.y = curY
          curBlock.row = block.row
          block.row = curRow
          drawAndCheckDone()
        }
      })
    } else {
      const curX = curBlock.x
      const curCol = curBlock.col
      this.createNumAnimation(curBlock.x, block.x, {
        onChange: v => {
          curBlock.x = v
          this.drawUI()
        },
        onEnd: () => {
          curBlock.x = block.x
          block.x = curX
          curBlock.col = block.col
          block.col = curCol
          drawAndCheckDone()
        }
      })
    }
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
      const swapInfo = this.getSwapInfo(block)
      if (swapInfo) {
        this.moveBlock(block, swapInfo)
      }
    }
  }

  onResize () {
    this.updateSize()
    this.updateBlockCoords()
    this.drawUI()
  }
}

export default Game
