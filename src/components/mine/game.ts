import { getPixRatio, getRandInt } from '../../utils'

import iconBlockEnd from './img/back.png'
import iconBlockFront from './img/front.png'
import iconBomb from './img/bomb.png'
import iconFlag from './img/flag-color.png'

const imgLoader = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

const icons: { [key: string]: string } = { iconBlockEnd, iconBlockFront, iconBomb, iconFlag }

interface Block {
  row: number,
  col: number,
  num: number,
  open?: boolean,
  flag?: boolean
}

const genArr = (len: number, val: any) => Array(len).fill(val)

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

  constructor (public cvs: HTMLCanvasElement) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    cvs.addEventListener('click', this.onClick.bind(this))
    cvs.addEventListener('contextmenu', this.onContextmenu.bind(this))
  }

  start (rows: number = 9, mineCount: number = 10, blockSpace: number = 6) {
    this.rows = rows
    this.mineCount = mineCount
    this.blockSpace = blockSpace
    this.isGameover = false
    this.isFirstClick = true
    this.blocks = genMineMap(rows, this.cols, mineCount)
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
      }).catch((e: Error) => {
        alert(e.message)
      })
    }
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
    const x = block.col * (blockSize + blockSpace) + blockSpace + (blockSize - fontWidth) / 2
    const y = block.row * (blockSize + blockSpace) + blockSpace + (blockSize - fontWidth) / 2 - 4
    ctx.save()
    ctx.font = `bold ${fontSize} serif`
    ctx.textBaseline = 'hanging'
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
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
  }

  openZeroBlocks (block: Block) {

  }

  checkResult () {
    
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
    } else if (block.num === 0) {
      this.openZeroBlocks(block)
    }
    this.drawUI()
    this.checkResult()
  }

  onContextmenu (event: MouseEvent) {

  }
}

export default Game
