import { delayCall, genArr, getPixRatio } from "../../utils"

interface GameCallbacks {
  onDone?: Function,
  onOver?: Function,
  onDraw?: Function
}

type ChessType = 'black' | 'white'

class Chess {
  constructor (public row: number, public col: number, public type: ChessType) {}

  draw (ctx: CanvasRenderingContext2D, bSize: number, chessSize: number, bSpace: number) {
    const space = bSize + bSpace
    ctx.save()
    ctx.fillStyle = this.type === 'black' ? '#000' : '#fff'
    ctx.beginPath()
    ctx.arc(
      this.col * space + space / 2,
      this.row * space + space / 2,
      chessSize / 2,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.restore()
  }
}

interface Cell {
  row: number,
  col: number
}

class AIPlayer {
  constructor (public game: Game) {}

  getCurrent (chessList: Chess[]) {
    const { cell } = this.game.getGrid().filter(a => {
      return !chessList.some(b => b.row === a.row && b.col === a.col)
    }).reduce((t: { score: number, cell?: Cell }, _) => {
      const score = this.judge(_)
      return score > t.score ? { score, cell: _ } : t
    }, { score: 0 })
    return cell && new Chess(cell.row, cell.col, 'white')
  }

  judge (cell: Cell) {
    const w: ChessType = 'white'
    const b: ChessType = 'black'
    const num1 = this.LR(cell, w) + this.TB(cell, w) + this.RB(cell, w) + this.RT(cell, w) + 100
    const num2 = this.LR(cell, b) + this.TB(cell, b) + this.RB(cell, b) + this.RT(cell, b)
    return num1 + num2
  }

  LR (cell: Cell, type: ChessType) {
    return 0
  }

  TB (cell: Cell, type: ChessType) {
    return 0
  }

  RB (cell: Cell, type: ChessType) {
    return 0
  }

  RT (cell: Cell, type: ChessType) {
    return 0
  }

  model (count: number, death: number) {
    var LEVEL_ONE = 0 // 单子
    var LEVEL_TWO = 1 // 眠2，眠1
    var LEVEL_THREE = 1500 // 眠3，活2
    var LEVEL_FOER = 4000 // 冲4，活3
    var LEVEL_FIVE = 10000 // 活4
    var LEVEL_SIX = 100000 // 成5
    if (count === 1 && death == 1) {
      return LEVEL_TWO // 眠1
    } else if (count === 2) {
      if (death === 0) {
        return LEVEL_THREE // 活2
      } else if (death === 1) {
        return LEVEL_TWO // 眠2
      } else {
        return LEVEL_ONE // 死棋
      }
    } else if (count === 3) {
      if (death == 0) {
        return LEVEL_FOER // 活3
      } else if (death === 1) {
        return LEVEL_THREE // 眠3
      } else {
        return LEVEL_ONE // 死棋
      }
    } else if (count === 4) {
      if (death === 0) {
        return LEVEL_FIVE // 活4
      } else if (death === 1) {
        return LEVEL_FOER // 冲4
      } else {
        return LEVEL_ONE // 死棋
      }
    } else if (count === 5) {
      return LEVEL_SIX // 成5
    }
    return LEVEL_ONE
  }
}

class Game {
  private ctx
  private pixRatio = 1
  private bSize = 0
  private chessSize = 0
  private bSpace
  readonly rows = 15
  readonly cols = 15
  private isGameover = false
  private aiPlayer
  private chessList: Chess[] = []

  constructor (private cvs: HTMLCanvasElement, private callbacks: GameCallbacks) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.bSpace = this.pixRatio
    this.aiPlayer = new AIPlayer(this)
    this.addListeners()
  }

  start () {
    this.isGameover = false
    this.updateSize()
    this.drawUI()
  }

  private drawGrid () {
    const { ctx, cvs, bSize, bSpace, rows, cols } = this
    const space = bSize + bSpace
    ctx.save()
    ctx.lineWidth = bSpace
    ctx.strokeStyle = '#333'
    ctx.translate(space / 2, space / 2)
    ctx.beginPath()
    genArr(rows).forEach((_, i) => {
      ctx.moveTo(-bSpace / 2, space * i)
      ctx.lineTo(cvs.width - bSize - bSpace / 2, space * i)
      ctx.moveTo(space * i, -bSpace / 2)
      ctx.lineTo(space * i, cvs.width - bSize - bSpace / 2)
    })
    ctx.stroke()
    ctx.fillStyle = '#000'
    ;[
      { row: 3, col: 3 },
      { row: 3, col: cols - 4 },
      { row: rows - 4, col: 3 },
      { row: rows - 4, col: cols - 4 }
    ].forEach(_ => {
      ctx.beginPath()
      ctx.arc(space * _.col, space * _.row, bSize * .1, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.restore()
  }

  drawLastAiChess (chess: Chess) {
    const { bSize, bSpace, ctx } = this
    const space = bSize + bSpace
    ctx.save()
    ctx.fillStyle = '#ccc'
    ctx.beginPath()
    ctx.arc(
      chess.col * space + space / 2,
      chess.row * space + space / 2,
      this.chessSize * .35,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.restore()
  }

  private drawUI () {
    const { ctx, cvs } = this
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    this.drawGrid()
    this.chessList.forEach(_ => {
      _.draw(ctx, this.bSize, this.chessSize, this.bSpace)
    })
  }

  private updateSize () {
    this.pixRatio = getPixRatio(this.ctx)
    const width = this.cvs.offsetWidth * this.pixRatio
    this.bSize = (width - this.cols * this.bSpace) / this.cols
    this.chessSize = this.bSize * .6
    this.cvs.width = this.cvs.height = width
  }

  getGrid () {
    return genArr(this.rows).reduce((t: Cell[], _, row) => {
      return [
        ...t,
        ...genArr(this.cols).map((_, col) => {
          return { row, col }
        })
      ]
    }, [])
  }

  private getCurrent (event: MouseEvent) {
    const ex = (event.offsetX || event.pageX) * this.pixRatio
    const ey = (event.offsetY || event.pageY) * this.pixRatio
    const { bSize, bSpace } = this
    const space = bSize + bSpace
    const row = Math.round((ey - space / 2) / space)
    const col = Math.round((ex - space / 2) / space)
    if (this.chessList.some(_ => _.row === row && _.col === col)) return
    const cx = col * space + space / 2
    const cy = row * space + space / 2
    if (Math.pow(ex - cx, 2) + Math.pow(ey - cy, 2) < Math.pow(this.chessSize / 2, 2)) {
      return new Chess(row, col, 'black')
    }
  }

  checkResult (chess: Chess) {
    return false
  }

  private onClick (event: MouseEvent) {
    if (this.isGameover) return
    const chess = this.getCurrent(event)
    if (chess) {
      this.chessList.push(chess)
      this.drawUI()
      if (this.checkResult(chess)) {
        this.isGameover = true
        return delayCall(this.callbacks.onDone)
      }
      const aiChess = this.aiPlayer.getCurrent(this.chessList)
      if (aiChess) {
        this.chessList.push(aiChess)
        this.drawUI()
        this.drawLastAiChess(aiChess)
        if (this.checkResult(aiChess)) {
          this.isGameover = true
          delayCall(this.callbacks.onOver)
        }
      } else {
        this.isGameover = true
        delayCall(this.callbacks.onDraw)
      }
    }
  }

  private onResize () {
    this.updateSize()
    this.drawUI()
  }

  private addListeners () {
    this.cvs.addEventListener('click', this.onClick.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))
  }

  removeListeners () {
    this.cvs.removeEventListener('click', this.onClick)
    window.removeEventListener('resize', this.onResize)
  }
}

export default Game
