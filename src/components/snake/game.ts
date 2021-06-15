import { delayCall, genArr, getPixRatio, getRandInt } from "../../utils"

interface GameCallbacks {
  onOver?: (foodCount: number) => void
}

interface MoveHandler {
  onBefore: (dir: MoveDirectionEnum, row: number, col: number) => boolean,
  onAfter: (coords: Block[]) => void
}

enum MoveDirectionEnum { UP, RIGHT, DOWN, LEFT }

enum GameStatusEnum { READY, PLAYING, PAUSE, END }

class Block {
  constructor (public row: number, public col: number) {}

  draw (ctx: CanvasRenderingContext2D, blockSize: number, lineWidth: number) {
    ctx.fillRect(
      (blockSize + lineWidth) * this.col + lineWidth,
      (blockSize + lineWidth) * this.row + lineWidth,
      blockSize,
      blockSize
    )
  }
}

class Snake {
  dir: MoveDirectionEnum = MoveDirectionEnum.UP
  speed: number = 1
  tid: any

  constructor (public coords: Block[]) {}

  draw (ctx: CanvasRenderingContext2D, blockSize: number, lineWidth: number) {
    ctx.save()
    ctx.fillStyle = '#000'
    this.coords.forEach(_ => {
      _.draw(ctx, blockSize, lineWidth)
    })
    ctx.restore()
  }

  moveFunc (handle: MoveHandler) {
    const { coords } = this
    const { row, col } = coords[0]
    if (handle.onBefore(this.dir, row, col)) {
      this.stop()
    } else {
      const c = {
        [MoveDirectionEnum.UP]: [row - 1, col],
        [MoveDirectionEnum.RIGHT]: [row, col + 1],
        [MoveDirectionEnum.DOWN]: [row + 1, col],
        [MoveDirectionEnum.LEFT]: [row, col - 1]
      }[this.dir] as [number, number]
      coords.unshift(new Block(...c))
      this.coords.pop()
      handle.onAfter(coords)
    }
  }

  move (handle: MoveHandler) {
    this.tid = setTimeout(() => {
      const { coords } = this
      const { row, col } = coords[0]
      if (handle.onBefore(this.dir, row, col)) {
        this.stop()
      } else {
        const c = {
          [MoveDirectionEnum.UP]: [row - 1, col],
          [MoveDirectionEnum.RIGHT]: [row, col + 1],
          [MoveDirectionEnum.DOWN]: [row + 1, col],
          [MoveDirectionEnum.LEFT]: [row, col - 1]
        }[this.dir] as [number, number]
        coords.unshift(new Block(...c))
        this.coords.pop()
        handle.onAfter(coords)
        this.move(handle)
      }
    }, Math.ceil(300 / this.speed))
  }

  stop () {
    clearTimeout(this.tid)
    this.tid = null
  }

  eat (food: Block, cb?: () => void) {
    const { row: foodRow, col: foodCol } = food
    const { row, col } = this.coords[0]
    let canEat: boolean
    if (this.dir === MoveDirectionEnum.UP) {
      canEat = row === foodRow + 1 && col === foodCol
    } else if (this.dir === MoveDirectionEnum.RIGHT) {
      canEat = row === foodRow && col === foodCol - 1
    } else if (this.dir === MoveDirectionEnum.DOWN) {
      canEat = row === foodRow - 1 && col === foodCol
    } else {
      canEat = row === foodRow && col === foodCol + 1
    }
    if (canEat) {
      this.coords.unshift(new Block(foodRow, foodCol))
      if (this.coords.length % 10 === 0) {
        this.speed += .2
      }
      cb && cb()
    }
  }
}

class Food extends Block {
  draw (ctx: CanvasRenderingContext2D, blockSize: number, lineWidth: number) {
    ctx.save()
    ctx.fillStyle = '#00f'
    super.draw(ctx, blockSize, lineWidth)
    ctx.restore()
  }
}

class Game {
  gridCvs: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  pixRatio: number
  rows: number = 20
  cols: number = 20
  lineWidth: number = 1
  blockSize: number = 0
  snake: Snake | undefined
  food: Food | undefined
  status: GameStatusEnum = GameStatusEnum.READY

  constructor (public cvs: HTMLCanvasElement, public callbacks: GameCallbacks) {
    this.ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    this.pixRatio = getPixRatio(this.ctx)
    this.lineWidth = this.pixRatio
    this.addListeners()

    this.gridCvs = this.createGridCvs(cvs)
  }

  addListeners () {
    this.cvs.addEventListener('click', this.onClick.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))
  }

  removeListeners () {
    this.cvs.removeEventListener('click', this.onClick)
    window.removeEventListener('resize', this.onResize)
  }

  createGridCvs (cvs: HTMLCanvasElement) {
    const canvas = document.createElement('canvas')
    const parentEl = cvs.parentElement as HTMLElement
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.pointerEvents = 'none'
    const parentStyle = window.getComputedStyle(parentEl)
    if (parentStyle.position === 'static') {
      parentEl.style.position = 'relative'
    }
    parentEl.appendChild(canvas)
    return canvas
  }

  onClick (event: MouseEvent) {
    const ex = (event.offsetX || event.pageX) * this.pixRatio
    const ey = (event.offsetY || event.pageY) * this.pixRatio
    const snake = this.snake as Snake
    const { row, col } = snake.coords[0]
    const { blockSize, lineWidth } = this
    const snakeX = (blockSize + lineWidth) * col + lineWidth
    const snakeY = (blockSize + lineWidth) * row + lineWidth
    if ([MoveDirectionEnum.UP, MoveDirectionEnum.DOWN].includes(snake.dir)) {
      if (ex > snakeX + blockSize) {
        snake.dir = MoveDirectionEnum.RIGHT
      } else if (ex < snakeX) {
        snake.dir = MoveDirectionEnum.LEFT
      }
    } else if ([MoveDirectionEnum.RIGHT, MoveDirectionEnum.LEFT].includes(snake.dir)) {
      if (ey > snakeY + blockSize) {
        snake.dir = MoveDirectionEnum.DOWN
      } else if (ey < snakeY) {
        snake.dir = MoveDirectionEnum.UP
      }
    }
    this.eatFood()
  }

  onResize () {
    this.updateSize()
    this.drawUI()
    this.drawGrid()
  }

  init (rows?: number, cols?: number) {
    this.status = GameStatusEnum.READY
    this.updateSize(rows, cols)
    this.snake = this.createSnake()
    this.food = this.createFood()
    this.drawUI()
    this.drawGrid()
  }

  start (rows?: number, cols?: number) {
    if (this.snake) {
      this.snake.stop()
    }
    if (this.status !== GameStatusEnum.READY) {
      this.init(rows, cols)
    }
    this.status = GameStatusEnum.PLAYING
    this.snake?.move(this.snakeMoveHandler())
  }

  unpause () {
    if (this.status === GameStatusEnum.PAUSE) {
      this.status = GameStatusEnum.PLAYING
      this.snake?.move(this.snakeMoveHandler())
    }
  }

  pause () {
    if (this.status === GameStatusEnum.PLAYING) {
      this.status = GameStatusEnum.PAUSE
      this.snake?.stop()
    }
  }

  updateSize (rows?: number, cols?: number) {
    const { lineWidth } = this
    this.cols = cols || rows || this.cols
    const cvsWidth = this.cvs.offsetWidth * this.pixRatio
    this.blockSize = (cvsWidth - lineWidth * (this.cols + 1)) / this.cols
    const maxHeight = (this.cvs.parentElement?.offsetHeight as number) * this.pixRatio
    const maxRow = Math.floor((maxHeight - lineWidth) / (this.blockSize + lineWidth))
    this.rows = Math.min(maxRow, rows || this.rows)
    this.cvs.width = this.gridCvs.width = cvsWidth
    this.cvs.height = this.gridCvs.height = (lineWidth + this.blockSize) * this.rows + lineWidth
  }

  createSnake () {
    const row = Math.floor(this.rows / 2)
    const col = Math.floor(this.cols / 2)
    return new Snake([
      new Block(row - 1, col),
      new Block(row, col),
      new Block(row + 1, col)
    ])
  }

  snakeMoveHandler (): MoveHandler {
    return {
      onBefore: (dir, row, col) => {
        const result = dir === MoveDirectionEnum.UP && row === 0 ||
          dir === MoveDirectionEnum.RIGHT && col === this.cols - 1 ||
          dir === MoveDirectionEnum.DOWN && row === this.rows - 1 ||
          dir === MoveDirectionEnum.LEFT && col === 0
        if (result) {
          this.status = GameStatusEnum.END
          delayCall(this.callbacks.onOver, this.snake?.coords.length as number - 3)
        }
        return result
      },
      onAfter: () => {
        this.drawUI()
        this.eatFood()
      }
    }
  }

  createFood () {
    const snakeCoords = this.snake?.coords.map(_ => `${_.row}:${_.col}`) || []
    const blocks: [number, number][] = genArr(this.rows).reduce((t, _, row) => {
      return t.concat(
        genArr(this.cols).map((_, col) => {
          return [row, col]
        })
      )
    }, []).filter((_: any) => {
      return snakeCoords.indexOf(`${_[0]}:${_[1]}`) < 0
    })
    return new Food(...blocks[getRandInt(0, blocks.length - 1)])
  }

  eatFood () {
    this.snake?.eat(this.food as Food, () => {
      this.food = this.createFood()
      this.drawUI()
    })
  }

  drawUI () {
    const { cvs, ctx, blockSize, lineWidth } = this
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    this.snake?.draw(ctx, blockSize, lineWidth)
    this.food?.draw(ctx, blockSize, lineWidth)
  }

  drawGrid () {
    const { width, height } = this.gridCvs
    const { lineWidth, blockSize } = this
    const ctx = this.gridCvs.getContext('2d') as CanvasRenderingContext2D
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = '#888'
    genArr(this.rows + 1).forEach((_, row) => {
      const y = (lineWidth + blockSize) * row + lineWidth / 2
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    })
    genArr(this.cols + 1).forEach((_, col) => {
      const x = (lineWidth + blockSize) * col + lineWidth / 2
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    })
    ctx.stroke()
  }
}

export default Game
