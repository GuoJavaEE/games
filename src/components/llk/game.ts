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
  blocks: Block[] = []
  selectedBlock: Block | undefined

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
      this.blocks = result
      this.drawUI()
      this.addListeners()
    })
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
            return { dw, img, dx: dw * col, dy: dw * row }
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

  getCurBlock (event: MouseEvent) {
    const ex = (event.offsetX || event.pageX) * this.pixRatio
    const ey = (event.offsetY || event.pageY) * this.pixRatio
    const { blockSize, blockSpace } = this
    return this.blocks.filter(_ => !_.removed).find(_ => {
      const x = (_.col - 1) * blockSpace + (_.col + 1) * blockSize
      const y = (_.row - 1) * blockSpace + (_.row + 1) * blockSize
      return Math.pow(ex - x, 2) + Math.pow(ey - y, 2) < Math.pow(blockSize / 2, 2)
    })
  }

  isSameBlock (b1: Block, b2: Block) {
    return Math.round(b1.dx) === Math.round(b2.dx) && Math.round(b1.dy) === Math.round(b2.dy)
  }

  getBlockCenter (block: Block) {
    const { blockSize, blockSpace } = this
    return {
      x: (block.col + 1) * blockSize + (block.col - 1) * blockSpace,
      y: (block.row + 1) * blockSize + (block.row - 1) * blockSpace
    }
  }

  findWay (b1: Block, b2: Block) {
    return this.lineDirect(b1, b2) || this.oneCorner(b1, b2) || this.twoCorner(b1, b2)
  }

  lineDirect (b1: Block, b2: Block) {
    const results = [b1, b2].map(this.getBlockCenter.bind(this))
    if (b1.row === b2.row) {
      const arr = this.blocks.filter(_ => _.row === b1.row)
      if (b1.col < b2.col) {
        if (arr.filter(_ => _.col > b1.col && _.col < b2.col).every(_ => _.removed)) {
          return results
        }
      } else {
        if (arr.filter(_ => _.col > b2.col && _.col < b1.col).every(_ => _.removed)) {
          return results
        }
      }
    } else if (b1.col === b2.col) {
      const arr = this.blocks.filter(_ => _.col === b1.col)
      if (b1.row < b2.row) {
        if (arr.filter(_ => _.row > b1.row && _.row < b2.row).every(_ => _.removed)) {
          return results
        }
      } else {
        if (arr.filter(_ => _.row > b2.row && _.row < b1.row).every(_ => _.removed)) {
          return results
        }
      }
    }
  }

  oneCorner (b1: Block, b2: Block) {

  }

  twoCorner (b1: Block, b2: Block) {

  }

  drawUI () {
    const { blockSize, blockSpace } = this
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)
    this.blocks.forEach(_ => {
      if (!_.removed) {
        this.ctx.drawImage(
          _.img,
          _.dx,
          _.dy,
          _.dw,
          _.dw,
          blockSize / 2 + _.col * blockSize + (_.col - 1) * blockSpace,
          blockSize / 2 + _.row * blockSize + (_.row - 1) * blockSpace,
          blockSize,
          blockSize
        )
      }
    })
    this.selectedBlock && this.drawArc(this.selectedBlock)
  }

  drawArc (block: Block, alpha = .6) {
    const { x, y } = this.getBlockCenter(block)
    const { ctx } = this
    ctx.save()
    ctx.fillStyle = `rgba(0,0,0,${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, this.blockSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
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
      const { selectedBlock } = this
      if (selectedBlock) {
        if (block === selectedBlock) return
        if (this.isSameBlock(selectedBlock, block)) {
          const coords = this.findWay(selectedBlock, block)
          if (coords) {
            selectedBlock.removed = block.removed = true
            this.selectedBlock = undefined
            return this.drawUI()
          }
        }
      }
      this.selectedBlock = block
      this.drawUI()
    }
  }

  onResize () {
    this.updateSize()
    this.drawUI()
  }
}

export default Game
