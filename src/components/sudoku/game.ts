import { delayCall, genArr, getPixRatio, getRandInt } from "../../utils"
import styleModule from './style.module.less'

interface GameCallbacks {
  onDone?: () => void
}

class Block {
  constructor (public row: number, public col: number, public isInput: boolean, public num = 0) {}

  draw (ctx: CanvasRenderingContext2D, bSize: number, bSpace: number) {
    const x = (bSize + bSpace) * this.col + bSpace
    const y = (bSize + bSpace) * this.row + bSpace
    ctx.save()
    if (this.isInput) {
      ctx.fillStyle = '#fff'
      ctx.fillRect(x, y, bSize, bSize)
    }
    if (this.num) {
      const text = this.num + ''
      ctx.fillStyle = '#424242'
      ctx.font = `bold ${bSize / 2}px serif`
      ctx.textBaseline = 'hanging'
      ctx.textAlign = 'left'
      const fontWidth = ctx.measureText(text).width
      ctx.fillText(text, x + (bSize - fontWidth) / 2, y + (bSize - fontWidth) / 2)
    }
    ctx.restore()
  }
}

class Game {
  emptyCount = 20
  private readonly rows = 9
  private readonly cols = 9
  private readonly colors = ['#ccc','#def1e6']
  private blocks: Block[] = []
  private bakEmptyBlocks: Block[] = []
  private ctx: CanvasRenderingContext2D
  private pixRatio: number
  private bSpace: number
  private bSize = 0
  private focusBlock: Block | undefined
  private keyboard: HTMLUListElement

  constructor (private cvs: HTMLCanvasElement, private callbacks: GameCallbacks) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.bSpace = this.pixRatio
    this.keyboard = this.createKeyboard()
    this.addListeners()
  }

  start (emptyCount?: number) {
    if (emptyCount) {
      this.emptyCount = Math.min(emptyCount, 60)
    }
    this.updateSize()
    const { blocks, bakEmptyBlocks } = this.genBlocks()
    this.blocks = blocks
    this.bakEmptyBlocks = bakEmptyBlocks
    this.drawUI()
  }

  private updateSize () {
    const width = this.cvs.offsetWidth * this.pixRatio
    this.bSize = (width - (this.cols + 1) * this.bSpace) / this.cols
    this.cvs.width = this.cvs.height = width
  }

  private drawUI () {
    const { ctx, cvs } = this
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    this.drawBG()
    this.drawGrid()
    this.blocks.forEach(_ => {
      _.draw(ctx, this.bSize, this.bSpace)
    })
    const { focusBlock } = this
    if (focusBlock) {
      const x = (this.bSize + this.bSpace) * focusBlock.col + this.bSpace
      const y = (this.bSize + this.bSpace) * focusBlock.row + this.bSpace
      ctx.save()
      ctx.strokeStyle = ctx.shadowColor = '#00f'
      ctx.shadowBlur = this.bSpace * 8
      ctx.strokeRect(x, y, this.bSize, this.bSize)
      ctx.restore()
    }
  }

  private drawBG () {
    const { ctx } = this
    const width = this.cvs.width / 3
    let count = 0
    ctx.save()
    genArr(3).forEach((_, row) => {
      genArr(3).forEach((_, col) => {
        ctx.fillStyle = this.colors[(count++) % 2]
        ctx.fillRect(col * width, row * width, width, width)
      })
    })
    ctx.restore()
  }

  private drawGrid () {
    const { ctx, bSpace } = this
    const { width } = this.cvs
    ctx.save()
    ctx.lineWidth = bSpace
    ctx.strokeStyle = '#424242'
    ctx.beginPath()
    genArr(this.rows + 1).forEach((_, i) => {
      const val = i * (this.bSize + bSpace) + bSpace / 2
      ctx.moveTo(0, val)
      ctx.lineTo(width, val)
      ctx.moveTo(val, 0)
      ctx.lineTo(val, width)
    })
    ctx.stroke()
    ctx.restore()
  }

  private genBlocks () {
    const nums = [
      [8, 7, 1, 9, 3, 2, 6, 4, 5],
      [4, 9, 5, 8, 6, 1, 2, 3, 7],
      [6, 3, 2, 7, 5, 4, 8, 1, 9],
      [5, 2, 8, 4, 7, 3, 1, 9, 6],
      [9, 1, 3, 6, 2, 5, 7, 8, 4],
      [7, 6, 4, 1, 9, 8, 3, 5, 2],
      [2, 8, 7, 3, 4, 9, 5, 6, 1],
      [1, 4, 6, 5, 8, 7, 9, 2, 3],
      [3, 5, 9, 2, 1, 6, 4, 7, 8]
    ]
    genArr(50).forEach(_ => {
      const aNum = getRandInt(1, this.cols)
      const bNum = getRandInt(1, this.cols)
      if (aNum === bNum) return
      nums.forEach((cols, row) => {
        cols.forEach((num, col) => {
          if (num === aNum) {
            nums[row][col] = bNum
          } else if (num === bNum) {
            nums[row][col] = aNum
          }
        })
      })
    })
    const blocks = nums.reduce((t: Block[], cols, row) => {
      return [
        ...t,
        ...cols.map((num, col) => {
          return new Block(row, col, false, num)
        })
      ]
    }, []).sort(() => Math.random() - .5)
    const emptyBlocks = blocks.slice(0, this.emptyCount)
    const bakEmptyBlocks = JSON.parse(JSON.stringify(emptyBlocks))
    emptyBlocks.forEach(_ => {
      _.num = 0
      _.isInput = true
    })
    return { bakEmptyBlocks, blocks }
  }

  private getCurBlock (event: MouseEvent) {
    const { bSize, bSpace, pixRatio } = this
    const ex = (event.offsetX || event.pageX) * pixRatio
    const ey = (event.offsetY || event.pageY) * pixRatio
    return this.blocks.find(_ => {
      const x = (bSize + bSpace) * _.col + bSpace
      const y = (bSize + bSpace) * _.row + bSpace
      return ex > x && ex < x + bSize && ey > y && ey < y + bSize
    })
  }

  private createKeyboard () {
    const ul = document.createElement('ul')
    ul.className = styleModule.keyboard
    ul.innerHTML = genArr(9).map((_, i) => `<li>${i + 1}</li>`).join('')
    this.cvs.parentElement?.appendChild(ul)
    return ul
  }

  private updateKeyboardPosition () {
    const { bSize, bSpace, keyboard, focusBlock } = this
    if (focusBlock) {
      const { row } = focusBlock
      keyboard.style.top = ((row + 1) * (bSize + bSpace) + bSpace) / this.pixRatio + 'px'
      keyboard.classList.add(styleModule.visible)
    } else {
      keyboard.classList.remove(styleModule.visible)
    }
  }

  private isDone () {
    return this.bakEmptyBlocks.every((_, i) => _.num === this.blocks[i].num)
  }

  private addListeners () {
    this.cvs.addEventListener('click', this.onClick.bind(this))
    this.keyboard.addEventListener('click', this.onKeyboardClick.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))
  }

  removeListeners () {
    this.cvs.removeEventListener('click', this.onClick)
    this.keyboard.removeEventListener('click', this.onKeyboardClick)
    window.removeEventListener('resize', this.onResize)
  }

  private onClick (event: MouseEvent) {
    const block = this.getCurBlock(event)
    this.focusBlock = block && block.isInput ? block : undefined
    this.drawUI()
    this.updateKeyboardPosition()
  }

  private onKeyboardClick (event: MouseEvent) {
    const { target } = event
    const { focusBlock } = this
    if (target && (target as HTMLElement).tagName.toLowerCase() === 'li') {
      if (focusBlock) {
        focusBlock.num = +(target as any).textContent
        this.focusBlock = undefined
        this.drawUI()
        if (this.isDone()) {
          delayCall(this.callbacks.onDone)
        }
      }
      this.keyboard.classList.remove(styleModule.visible)
    }
  }

  private onResize () {
    this.updateSize()
    this.drawUI()
    this.updateKeyboardPosition()
  }
}

export default Game
