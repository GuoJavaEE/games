import { genArr, getPixRatio } from "../../utils"

const colors = {
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
  onDone?: Function
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
  private pixRatio: number
  private bSpace: number
  private bSize = 0
  private isGameover = false
  private blocks: Block[] = []

  constructor (private cvs: HTMLCanvasElement, private callbacks: GameCallbacks) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.bSpace = this.pixRatio * 8
    this.addListeners()
  }

  start () {
    this.isGameover = false
    this.updateSize()
    this.blocks = this.genBlocks()
    this.drawUI()
  }

  updateSize () {
    const width = this.cvs.offsetWidth * this.pixRatio
    this.bSize = (width - (this.cols + 1) * this.bSpace) / this.cols
    this.cvs.width = this.cvs.height = width
  }

  genBlocks () {
    const blocks = genArr(this.rows)
      .reduce((t: Block[], _, row) => {
        return t.concat(
          genArr(this.cols).map((_, col) => ({ row, col, num: 0 }))
        )
      }, [])
      .sort(() => Math.random() - .5)
    blocks.slice(0, 2).forEach(_ => {
      _.num = 2
    })
    return blocks
  }

  drawUI () {
    const { cvs, ctx, bSize, bSpace } = this
    ctx.clearRect(0, 0, cvs.width, cvs.height)
  }

  onResize () {

  }

  onKeyup (event: KeyboardEvent) {

  }

  onTouchstart (event: TouchEvent) {

  }

  onTouchmove (event: TouchEvent) {

  }

  onTouchend (event: TouchEvent) {

  }

  private addListeners () {
    const { cvs } = this
    cvs.addEventListener('touchstart', this.onTouchstart.bind(this))
    cvs.addEventListener('touchmove', this.onTouchmove.bind(this))
    cvs.addEventListener('touchend', this.onTouchend.bind(this))
    document.addEventListener('keyup', this.onKeyup.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))
  }

  removeListeners () {
    const { cvs } = this
    cvs.removeEventListener('touchstart',this.onTouchstart)
    cvs.removeEventListener('touchmove', this.onTouchmove)
    cvs.removeEventListener('touchend', this.onTouchend)
    document.removeEventListener('keyup', this.onKeyup)
    window.removeEventListener('resize', this.onResize)
  }
}

export default Game
