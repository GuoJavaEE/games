import { delayCall, genArr, getPixRatio, roundReact } from "../../utils"

interface ColorMap {
  [key: string]: {
    color: string,
    bgcolor: string
  }
}

enum MoveDirection { UP = 1, RIGHT, DOWN, LEFT }

const colors: ColorMap = {
  2: {
    color: '#333',
    bgcolor: '#eee4da'
  },
  4: {
    color: '#333',
    bgcolor: '#ece0ca'
  },
  8: {
    color: '#f7f7f5',
    bgcolor: '#f2b179'
  },
  16: {
    color: '#f7f7f5',
    bgcolor: '#f59563'
  },
  32: {
    color: '#f7f7f5',
    bgcolor: '#f57c5f'
  },
  64: {
    color: '#f7f7f5',
    bgcolor: '#ff5734'
  },
  128: {
    color: '#f7f7f5',
    bgcolor: '#f4cc6d'
  },
  256: {
    color: '#f7f7f5',
    bgcolor: '#d65211'
  },
  512: {
    color: '#f7f7f5',
    bgcolor: '#e29441'
  },
  1024: {
    color: '#f7f7f5',
    bgcolor: '#9e790a'
  },
  2048: {
    color: '#fefdf9',
    bgcolor: '#e0ba01'
  }
}

interface GameCallbacks {
  onDone?: Function,
  onOver?: Function
}

interface Block {
  row: number,
  col: number,
  num: number
}

class Game {
  private readonly rows = 4
  private readonly cols = 4
  private ctx: CanvasRenderingContext2D
  private pixRatio: number = 1
  private bSpace: number
  private bSize = 0
  private isGameover = false
  private blocks: Block[] = []

  constructor (private cvs: HTMLCanvasElement, private callbacks: GameCallbacks) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.bSpace = this.pixRatio * 8
    this.addListeners()
  }

  start () {
    this.isGameover = false
    this.updateSize()
    this.blocks = this.genBlocks()
    this.drawUI()
  }

  private updateSize () {
    this.pixRatio = getPixRatio(this.ctx)
    const width = this.cvs.offsetWidth * this.pixRatio
    this.bSize = (width - (this.cols + 1) * this.bSpace) / this.cols
    this.cvs.width = this.cvs.height = width
  }

  private genBlocks () {
    const blocks = genArr(this.rows)
      .reduce((t: Block[], _, row) => {
        return [...t, ...genArr(this.cols).map((_, col) => ({ row, col, num: 0 }))]
      }, [])
      .sort(() => Math.random() - .5)
    blocks.slice(0, 2).forEach(_ => {
      _.num = 2
    })
    return blocks
  }

  private drawUI () {
    const { cvs, ctx, bSize, bSpace } = this
    const getPos = (val: number) => (bSize + bSpace) * val + bSpace
    const r = 6 * this.pixRatio
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    this.blocks.forEach(_ => {
      if (_.num) {
        ctx.save()
        ctx.fillStyle = colors[_.num].bgcolor
        roundReact(ctx, getPos(_.col), getPos(_.row), bSize, bSize, r)
        ctx.fill()
        const text = _.num + ''
        const fontSize = bSize / (text.length > 2 ? 3 : 2)
        ctx.fillStyle = colors[_.num].color
        ctx.font = `bold ${fontSize}px serif`
        ctx.textBaseline = 'top'
        const fontWidth = ctx.measureText(text).width
        ctx.fillText(text, getPos(_.col) + (bSize - fontWidth) / 2, getPos(_.row) + (bSize - fontSize) / 2)
        ctx.restore()
      } else {
        ctx.save()
        ctx.fillStyle = '#eee4da'
        ctx.globalAlpha = .35
        roundReact(ctx, getPos(_.col), getPos(_.row), bSize, bSize, r)
        ctx.fill()
        ctx.restore()
      }
    })
  }

  private getColBlocks (col: number) {
    return this.blocks.filter(_ => _.col === col)
  }

  private getRowBlocks (row: number) {
    return this.blocks.filter(_ => _.row === row)
  }

  private moveBlocks (dir: MoveDirection) {
    const eachBlocks = (data: Block[]) => {
      let nums = data.map(_ => _.num).filter(_ => _)
      for (let i = 0, len = nums.length; i < len; i++) {
        let num = nums[i]
        let nextNum = nums[i + 1]
        if (nextNum === num) {
          nums[i] = num * 2
          nums[i + 1] = 0
          break
        }
      }
      nums = nums.filter(_ => _)
      data.forEach((_, i) => {
        _.num = nums[i]
      })
    }
    if ([MoveDirection.UP, MoveDirection.DOWN].includes(dir)) {
      const compareFn = dir === MoveDirection.UP
        ? (a: Block, b: Block) => a.row - b.row
        : (a: Block, b: Block) => b.row - a.row
      genArr(this.cols).forEach((_, col) => {
        eachBlocks(this.getColBlocks(col).sort(compareFn))
      })
    } else if ([MoveDirection.RIGHT, MoveDirection.LEFT].includes(dir)) {
      const compareFn = dir === MoveDirection.LEFT
        ? (a: Block, b: Block) => a.col - b.col
        : (a: Block, b: Block) => b.col - a.col
      genArr(this.rows).forEach((_, row) => {
        eachBlocks(this.getRowBlocks(row).sort(compareFn))
      })
    }
    if (dir) {
      this.genRandBlock()
      this.drawUI()
      this.checkResult()
    }
  }

  private genRandBlock () {
    const blocks = this.blocks.filter(_ => !_.num).sort(() => Math.random() - .5)
    if (blocks.length) {
      blocks[0].num = 2
    }
  }

  private checkResult () {
    if (this.blocks.some(_ => _.num === 2048)) {
      this.isGameover = true
      return delayCall(this.callbacks.onDone)
    }
    if (this.blocks.some(_ => !_.num)) return
    enum Grid { ROW, COL }
    const checkGrid = (type: Grid) => {
      const count = type === Grid.ROW ? this.rows : this.cols
      for (let i = 0; i < count; i++) {
        const nums = (
          type === Grid.ROW
            ? this.getRowBlocks(i).sort((a, b) => a.col - b.col)
            : this.getColBlocks(i).sort((a, b) => a.row - b.row)
        ).map(_ => _.num)
        for (let j = 0, len = nums.length; j < len; j++) {
          if (nums[j] === nums[j + 1]) {
            return false
          }
        }
      }
      return true
    }
    if (checkGrid(Grid.ROW) && checkGrid(Grid.COL)) {
      this.isGameover = true
      delayCall(this.callbacks.onOver)
    }
  }

  private onResize () {
    this.updateSize()
    this.drawUI()
  }

  private onKeyup (event: KeyboardEvent) {
    if (this.isGameover) return
    const dir = [
      [[87, 38], MoveDirection.UP],
      [[68, 39], MoveDirection.RIGHT],
      [[83, 40], MoveDirection.DOWN],
      [[65, 37], MoveDirection.LEFT]
    ].find(_ => (_[0] as number[]).includes(event.keyCode))
    if (dir) {
      this.moveBlocks(dir[1] as MoveDirection)
    }
  }

  private onTouchstart (event: TouchEvent) {
    if (this.isGameover) return
    event.preventDefault()
    const touch = event.targetTouches[0]
    let sx = touch.pageX
    let sy = touch.pageY
    let ex: number
    let ey: number
    const { cvs } = this
    const onTouchmove = (event: TouchEvent) => {
      event.preventDefault()
      const touch = event.targetTouches[0]
      ex = touch.pageX
      ey = touch.pageY
    }
    const onTouchend = () => {
      if (ex === undefined) return
      const x = Math.abs(ex - sx)
      const y = Math.abs(ey - sy)
      if (x > 6 || y > 6) {
        if (x > y) {
          this.moveBlocks(ex > sx ? MoveDirection.RIGHT : MoveDirection.LEFT)
        } else {
          this.moveBlocks(ey > sy ? MoveDirection.DOWN : MoveDirection.UP)
        }
      }
      cvs.removeEventListener('touchmove', onTouchmove)
      cvs.removeEventListener('touchend', onTouchend)
    }
    cvs.addEventListener('touchmove', onTouchmove)
    cvs.addEventListener('touchend', onTouchend)
  }

  private addListeners () {
    const { cvs } = this
    cvs.addEventListener('touchstart', this.onTouchstart.bind(this))
    document.addEventListener('keyup', this.onKeyup.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))
  }

  removeListeners () {
    const { cvs } = this
    cvs.removeEventListener('touchstart',this.onTouchstart)
    document.removeEventListener('keyup', this.onKeyup)
    window.removeEventListener('resize', this.onResize)
  }
}

export default Game
