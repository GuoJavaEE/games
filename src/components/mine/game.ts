import { getPixRatio, getRandInt, delayCall, imgLoader, genArr } from '../../utils'

import iconBlockEnd from './img/back.png'
import iconBlockFront from './img/front.png'
import iconBomb from './img/bomb.png'
import iconFlag from './img/flag-color.png'

interface Block {
  row: number,
  col: number,
  num: number,
  open?: boolean,
  flag?: boolean
}

interface GameCallbacks {
  onWinning?: Function,
  onOver?: Function,
  onUpdate?: (data: any) => void
}

const icons: { [key: string]: string } = { iconBlockEnd, iconBlockFront, iconBomb, iconFlag }

const getBlock = (blocks: Block[], row: number, col: number) => {
  return blocks.find(_ => _.row === row && _.col === col)
}

const updateBlocksNum = (blocks: Block[]) => {
  const get = (row: number, col: number) => getBlock(blocks, row, col)
  blocks.forEach(_ => {
    if (_.num !== 9) {
      _.num = [
        get(_.row- 1, _.col - 1),
        get(_.row - 1, _.col),
        get(_.row - 1, _.col + 1),
        get(_.row, _.col + 1),
        get(_.row + 1, _.col + 1),
        get(_.row + 1, _.col),
        get(_.row + 1, _.col -1),
        get(_.row, _.col - 1)
      ].filter(_ => _ && _.num === 9).length
    }
  })
}

const genMineMap = (rows: number, cols: number, mineCount: number): Block[] => {
  const blocks: Block[] = genArr(rows, 0).reduce((t, a, row) => {
    return t.concat(
      genArr(cols, 0).map((b, col) => ({ row, col, num: 0 }))
    )
  }, [])

  const nums: number[] = genArr(mineCount, 9).concat(
    genArr(blocks.length - mineCount, 0)
  )
  nums.sort(() => Math.random() - .5)

  blocks.forEach((_, i) => {
    _.num = nums[i]
  })

  updateBlocksNum(blocks)

  return blocks
}

class Game {
  pixRatio: number
  ctx: CanvasRenderingContext2D
  blockSize: number = 0
  rows: number = 9
  cols: number = 9
  mineCount: number = 10
  blockSpace: number = 6
  isGameover: boolean = false
  isFirstClick: boolean = true
  isSourceLoaded: boolean = false
  blocks: Block[] = []
  icons: { [key: string]: HTMLImageElement } = {}

  constructor (public cvs: HTMLCanvasElement, public callbacks: GameCallbacks = {}) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
  }

  addListeners () {
    this.cvs.addEventListener('click', this.onClick.bind(this))
    this.cvs.addEventListener('contextmenu', this.onContextmenu.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))
  }

  removeListeners () {
    this.cvs.removeEventListener('click', this.onClick)
    this.cvs.removeEventListener('contextmenu', this.onContextmenu)
    window.removeEventListener('resize', this.onResize)
  }

  onResize () {
    this.updateSize()
    this.drawUI()
  }

  start (rows?: number, mineCount?: number, blockSpace?: number) {
    if (rows) {
      this.rows = rows
    }
    if (mineCount) {
      this.mineCount = mineCount
    }
    if (blockSpace) {
      this.blockSpace = blockSpace
    }
    this.isGameover = false
    this.isFirstClick = true
    this.blocks = genMineMap(this.rows, this.cols, this.mineCount)
    this.updateSize()

    if (this.isSourceLoaded) {
      this.drawUI()
    } else {
      Promise.all(
        Object.keys(icons).map(k => {
          return imgLoader(icons[k]).then(_ => {
            this.icons[k] = _
          })
        })
      ).then(() => {
        this.isSourceLoaded = true
        this.drawUI()
        this.addListeners()
      }).catch((e: Error) => {
        alert(e.message)
      })
    }

    delayCall(this.callbacks.onUpdate, this.getStateData(), 0)
  }

  updateSize () {
    const { blockSpace } = this
    const width = this.cvs.offsetWidth
    const cvsWidth = width * this.pixRatio
    const blockSize = (cvsWidth - blockSpace) / this.cols - blockSpace
    const maxHeight = (this.cvs.parentElement?.offsetHeight as number) * this.pixRatio
    if (this.rows * (blockSize + blockSpace) + blockSpace > maxHeight) {
      this.rows = Math.floor(maxHeight / (blockSize + blockSpace))
    }
    this.blockSize = blockSize
    this.cvs.width = cvsWidth
    this.cvs.height = this.rows * (blockSize + blockSpace) + blockSpace
  }

  drawBlockBackground (block: Block, icon: HTMLImageElement) {
    const { blockSize, blockSpace } = this
    this.ctx.drawImage(
      icon,
      0,
      0,
      icon.width,
      icon.height,
      block.col * blockSize + (block.col + 1) * blockSpace,
      block.row * blockSize + (block.row + 1) * blockSpace,
      blockSize,
      blockSize
    )
  }

  drawBlockText (block: Block) {
    const text = block.num + ''
    const { blockSize, blockSpace, ctx } = this
    const fontSize = blockSize / 2 + 'px'
    const color = ({ 1: '#ff0', 2: '#0f0' })[text] || '#f00'
    const fontWidth = ctx.measureText(text).width
    const x = block.col * (blockSize + blockSpace) + blockSpace + (blockSize - fontWidth) / 2 + this.pixRatio
    const y = block.row * (blockSize + blockSpace) + blockSpace + (blockSize - fontWidth) / 2
    ctx.save()
    ctx.font = `bold ${fontSize} serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
    ctx.restore()
  }

  drawBlockIcon (block: Block, icon: HTMLImageElement) {
    const { blockSize, blockSpace } = this
    let dw
    let dh
    if (icon.width > icon.height) {
      dw = blockSize / 2
      dh = dw * (icon.height / icon.width)
    } else {
      dh = blockSize / 2
      dw = dh * (icon.width / icon.height)
    }
    this.ctx.drawImage(
      icon,
      block.col * (blockSize + blockSpace) + blockSpace + (blockSize - dw) / 2,
      block.row * (blockSize + blockSpace) + blockSpace + (blockSize - dh) / 2,
      dw,
      dh
    )
  }

  drawUI () {
    const { width, height } = this.cvs
    this.ctx.clearRect(0, 0, width, height)
    this.blocks.forEach(_ => {
      if (_.open) {
        this.drawBlockBackground(_, this.icons['iconBlockEnd'])
        if (_.num > 0) {
          if (_.num < 9) {
            this.drawBlockText(_)
          } else {
            this.drawBlockIcon(_, this.icons['iconBomb'])
          }
        }
      } else {
        this.drawBlockBackground(_, this.icons['iconBlockFront'])
        if (_.flag) {
          this.drawBlockIcon(_, this.icons['iconFlag'])
        }
      }
    })
  }

  getCurBlock (event: MouseEvent): Block | undefined {
    const ex = (event.offsetX || event.pageX) * this.pixRatio
    const ey = (event.offsetY || event.pageY) * this.pixRatio
    const col = Math.floor(ex / (this.blockSize + this.blockSpace))
    const row = Math.floor(ey / (this.blockSize + this.blockSpace))
    return this.blocks.find(_ => _.row === row && _.col === col)
  }

  swapBlockNum (block: Block) {
    const blocks = this.blocks.filter(_ => _.num < 9)
    const index = getRandInt(0, blocks.length - 1)
    const item = blocks[index]
    const { num } = item
    item.num = block.num
    block.num = num
  }

  bombAndOver () {
    this.blocks.forEach(_ => {
      if (_.num === 9) {
        _.open = true
      }
    })
    this.isGameover = true
  }

  openZeroBlocks (block: Block) {
    const get = (row: number, col: number) => getBlock(this.blocks, row, col)
    ;[
      get(block.row - 1, block.col),
      get(block.row, block.col + 1),
      get(block.row + 1, block.col),
      get(block.row, block.col - 1)
    ].filter(_ => _).forEach(_ => {
      if (!_?.open && !_?.flag && _?.num === 0) {
        _.open = true
        this.openZeroBlocks(_)
      }
    })
  }

  isDone () {
    return this.blocks.filter(_ => _.num < 9).every(_ => _.open)
  }

  getStateData () {
    return this.blocks.reduce((t, _) => {
      return {
        opens: t.opens + (_.open ? 1 : 0),
        flags: t.flags + (_.flag ? 1 : 0)
      }
    }, { opens: 0, flags: 0 })
  }

  onClick (event: MouseEvent) {
    if (this.isGameover) return
    const block = this.getCurBlock(event)
    if (!block || block.open || block.flag) return
    if (this.isFirstClick) {
      this.isFirstClick = false
      if (block.num === 9) {
        this.swapBlockNum(block)
      }
    }
    block.open = true
    if (block.num === 9) {
      this.bombAndOver()
      delayCall(this.callbacks.onOver)
    } else if (block.num === 0) {
      this.openZeroBlocks(block)
    }
    delayCall(this.callbacks.onUpdate, this.getStateData(), 0)
    this.drawUI()
    if (this.isDone()) {
      this.isGameover = true
      delayCall(this.callbacks.onWinning)
    }
  }

  onContextmenu (event: MouseEvent) {
    event.preventDefault()
    if (this.isGameover) return
    const block = this.getCurBlock(event)
    if (!block || block.open) return
    block.flag = !block.flag
    this.drawUI()
    delayCall(this.callbacks.onUpdate, this.getStateData(), 0)
  }
}

export default Game
