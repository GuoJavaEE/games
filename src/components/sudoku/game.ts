import { genArr, getPixRatio, getRandInt } from "../../utils"

interface GameCallbacks {
  onDone?: () => void
}

class Block {
  constructor (public row: number, public col: number, public isInput: boolean, public num = 0) {}

  draw (ctx: CanvasRenderingContext2D, bSize: number, bSpace: number) {

  }
}

class Game {
  emptyCount = 20
  readonly rows = 9
  readonly cols = 9
  blocks: Block[] = []
  bakEmptyBlocks: Block[] = []
  ctx: CanvasRenderingContext2D
  pixRatio: number
  bSpace: number
  bSize = 0

  constructor (public cvs: HTMLCanvasElement, public callbacks: GameCallbacks) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.bSpace = this.pixRatio
  }

  start (emptyCount?: number) {
    if (emptyCount) {
      this.emptyCount = emptyCount
    }

    this.updateSize()
    const { blocks, bakEmptyBlocks } = this.genBlocks()
    this.blocks = blocks
    this.bakEmptyBlocks = bakEmptyBlocks
    this.drawUI()
  }

  updateSize () {

  }

  drawUI () {

  }

  genBlocks () {
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
    this.updateSize()
    this.drawUI()
  }
}

export default Game
