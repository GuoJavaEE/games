import { imgLoader, getCenterAppr, getPixRatio, genArr, delayCall } from '../../utils'

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
    const { blockSize } = this
    return this.genSpriteItems().then(result => {
      const arr: any[] = genArr(this.rows).reduce((t, a, row) => {
        return t.concat(
          genArr(this.cols).map((b, col) => {
            return { row: row + 1, col: col + 1 }
          })
        )
      }, []).map((_: any, i: number) => ({ ..._, ...result[i] }))
      return [
        ...arr,
        ...genArr(this.rows + 2).map((_, row) => ({ row, col: 0, removed: true })),
        ...genArr(this.rows + 2).map((_, row) => ({ row, col: this.cols + 1, removed: true })),
        ...genArr(this.cols + 2).map((_, col) => ({ col, row: 0, removed: true })),
        ...genArr(this.cols + 2).map((_, col) => ({ col, row: this.rows + 1, removed: true }))
      ].sort((a, b) => (a.row - b.row )|| (a.col - b.col))
    })
  }

  getCurBlock (event: MouseEvent) {
    const ex = (event.offsetX || event.pageX) * this.pixRatio
    const ey = (event.offsetY || event.pageY) * this.pixRatio
    const { blockSize, blockSpace } = this
    return this.blocks.filter(_ => !_.removed).find(_ => {
      const x = (_.col - 1) * blockSpace + (_.col) * blockSize
      const y = (_.row - 1) * blockSpace + (_.row) * blockSize
      return Math.pow(ex - x, 2) + Math.pow(ey - y, 2) < Math.pow(blockSize / 2, 2)
    })
  }

  isSameBlock (b1: Block, b2: Block) {
    return Math.round(b1.dx) === Math.round(b2.dx) && Math.round(b1.dy) === Math.round(b2.dy)
  }

  getBlockCenter (block: Block): [number, number] {
    const { blockSize, blockSpace } = this
    return block.col === 0
      ? [
        blockSize / 4,
        block.row * blockSize + (block.row - 1) * blockSpace
      ]
      : block.row === 0
        ? [
          block.col * blockSize + (block.col - 1) * blockSpace,
          blockSize / 4
        ]
        : block.col === this.cols + 1
          ? [
            block.col * blockSize + (block.col - 1) * blockSpace - blockSize / 4,
            block.row * blockSize + (block.row - 1) * blockSpace
          ]
          : block.row === this.rows + 1
            ? [
              block.col * blockSize + (block.col - 1) * blockSpace,
              block.row * blockSize + (block.row - 1) * blockSpace - blockSize / 4
            ]
            : [
              block.col * blockSize + (block.col - 1) * blockSpace,
              block.row * blockSize + (block.row - 1) * blockSpace
            ]
  }

  rinse () {
    this.selectedBlock = undefined
    const blocks = this.blocks.filter(_ => !_.removed)
    const coords = blocks.map(_ => ({ dx: _.dx, dy: _.dy }))
    coords.sort(_ => Math.random() - .5)
    blocks.forEach((_, i) => {
      const c = coords[i]
      _.dx = c.dx
      _.dy = c.dy
    })
    this.drawUI()
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

  oneCorner (b1: Block, b3: Block) {
    const getResults = (b: Block) => [b1, b, b3].map(this.getBlockCenter.bind(this))
    let b2 = this.blocks.find(_ => _.row === b1.row && _.col === b3.col)
    if (b2?.removed && this.lineDirect(b1, b2) && this.lineDirect(b2, b3)) {
      return getResults(b2)
    }
    b2 = this.blocks.find(_ => _.row === b3.row && _.col === b1.col)
    if (b2?.removed && this.lineDirect(b1, b2) && this.lineDirect(b2, b3)) {
      return getResults(b2)
    }
  }

  twoCorner (b1: Block, b2: Block) {
    const sameRows = this.blocks.filter(_ => _.row === b1.row)
    const sameCols = this.blocks.filter(_ => _.col === b1.col)
    const topBlocks = sameCols.filter(_ => _.row < b1.row)
    const rightBlocks = sameRows.filter(_ => _.col > b1.col)
    const bottomBlocks = sameCols.filter(_ => _.row > b1.row)
    const leftBlocks = sameRows.filter(_ => _.col < b1.col)
    const getResults = (block: Block) => {
      const coords = this.oneCorner(block, b2)
      if (coords) {
        return [b1, block].map(this.getBlockCenter.bind(this)).concat(coords.slice(1))
      }
    }
    for (let i = topBlocks.length - 1; i >= 0; i--) {
      const block = topBlocks[i]
      if (!block.removed) break
      const results = getResults(block)
      if (results) {
        return results
      }
    }
    for (let i = 0; i < rightBlocks.length; i++) {
      const block = rightBlocks[i]
      if (!block.removed) break
      const results = getResults(block)
      if (results) {
        return results
      }
    }
    for (let i = 0; i < bottomBlocks.length; i++) {
      const block = bottomBlocks[i]
      if (!block.removed) break
      const results = getResults(block)
      if (results) {
        return results
      }
    }
    for (let i = leftBlocks.length - 1; i >= 0; i--) {
      const block = leftBlocks[i]
      if (!block.removed) break
      const results = getResults(block)
      if (results) {
        return results
      }
    }
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
          blockSize / 2 + (_.col - 1) * blockSize + (_.col - 1) * blockSpace,
          blockSize / 2 + (_.row - 1) * blockSize + (_.row - 1) * blockSpace,
          blockSize,
          blockSize
        )
      }
    })
    this.selectedBlock && this.drawArc(this.selectedBlock)
  }

  drawArc (block: Block, alpha = .6) {
    const { ctx } = this
    ctx.save()
    ctx.fillStyle = `rgba(0,0,0,${alpha})`
    ctx.beginPath()
    ctx.arc(...this.getBlockCenter(block), this.blockSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  drawJoinLine (coords: [number, number][]) {
    if (coords.length === 2) {
      const [a, b] = coords
      const space = this.blockSize + this.blockSpace
      if (
        !Math.round(Math.abs(a[0] - b[0]) - space) ||
        !Math.round(Math.abs(a[1] - b[1]) - space)
      ) return
    }
    const { ctx } = this
    ctx.save()
    ctx.strokeStyle = '#555'
    ctx.lineWidth = this.pixRatio
    ctx.beginPath()
    ctx.moveTo(...coords[0])
    coords.slice(1).forEach(_ => {
      ctx.lineTo(..._)
    })
    ctx.stroke()
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
            this.drawArc(block)
            selectedBlock.removed = block.removed = true
            this.selectedBlock = undefined
            this.drawJoinLine(coords)
            return setTimeout(() => {
              this.drawUI()
              this.blocks.every(_ => _.removed) && delayCall(this.callbacks.onDone)
            }, 200)
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
