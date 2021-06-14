class Board {
  constructor(mountEl, callbacks = {}) {
    this.callbacks = callbacks
    let { wrapper, canvas } = utils.createCanvas(mountEl)
    this.wrapper = wrapper
    this.canvas = canvas
    this.context = this.canvas.getContext('2d')
    this.pixRatio = utils.getPixRatio(this.context)
    this.interval = 300
    this.addListener()
  }

  initUI({ rows, cols }) {
    this.rows = rows || cols
    this.cols = cols
    this.score = 0
    this.blockSize = 0
    this.lineWidth = 1
    this.width = 0
    this.height = 0
    this.speed = 1
    this.arrow = 1
    this.mainTid = null
    this.snake = this.initSnake()
    this.food = this.initFood()
    this.updateSize()
    this.drawObjects()
    this.timer()
  }

  eatFood() {
    if (!this.canEat()) return
    let { onScoreUpdated } = this.callbacks
    let { row, col } = this.food
    this.snake.unshift(new Block({ row, col, isSnake: true }))
    this.food = this.initFood()
    this.drawObjects()
    this.score++
    utils.isFunc(onScoreUpdated) && onScoreUpdated(this.score)
    if (this.snake.length % 10 === 0) {
      this.speed += .2
      this.timer()
    }
  }

  canEat() {
    let { arrow, food } = this
    let { row, col } = this.snake[0]
    return (arrow === 1 && col === food.col && row === food.row + 1)
      || (arrow === 2 && col === food.col - 1 && row === food.row)
      || (arrow === 3 && col === food.col && row === food.row - 1)
      || (arrow === 4 && col === food.col + 1 && row === food.row)
  }

  timer() {
    let { onEnded } = this.callbacks
    clearInterval(this.mainTid)
    let duration = Math.floor(this.interval / this.speed)
    this.mainTid = setInterval(() => {
      if (this.isEnd()) {
        clearInterval(this.mainTid)
        utils.isFunc(onEnded) && onEnded(this.score)
      } else {
        this.moveSnake()
      }
      this.eatFood()
    }, duration)
  }

  moveSnake() {
    let action = ['moveUp', 'moveRight', 'moveDown', 'moveLeft'][this.arrow - 1]
    this[action]()
    this.drawObjects()
  }

  moveUp() {
    let { row, col } = this.snake[0]
    this.snake.unshift(new Block({
      row: row - 1, col, isSnake: true
    }))
    this.snake.pop()
  }

  moveRight() {
    let { row, col } = this.snake[0]
    this.snake.unshift(new Block({
      row, col: col + 1, isSnake: true
    }))
    this.snake.pop()
  }

  moveDown() {
    let { row, col } = this.snake[0]
    this.snake.unshift(new Block({
      row: row + 1, col, isSnake: true
    }))
    this.snake.pop()
  }

  moveLeft() {
    let { row, col } = this.snake[0]
    this.snake.unshift(new Block({
      row, col: col - 1, isSnake: true
    }))
    this.snake.pop()
  }

  isEnd() {
    let { arrow, rows, cols } = this, { row, col } = this.snake[0]
    return (arrow === 1 && row === 0)
      || (arrow === 2 && col === cols - 1)
      || (arrow === 3 && row === rows - 1)
      || (arrow === 4 && col === 0)
  }

  onClick(event) {
    let ex = (event.offsetX || event.pageX) * this.pixRatio
    let ey = (event.offsetY || event.pageY) * this.pixRatio
    let { row, col } = this.snake[0]
    let { blockSize, lineWidth, arrow } = this
    let snakeX = col * blockSize + (col + 1) * lineWidth
    let snakeY = row * blockSize + (row + 1) * lineWidth
    if (arrow === 1 || arrow === 3) {
      if (ex > snakeX + blockSize) {
        this.arrow = 2
      } else if (ex < snakeX) {
        this.arrow = 4
      }
    } else if (arrow === 2 || arrow === 4) {
      if (ey > snakeY + blockSize) {
        this.arrow = 3
      } else if (ey < snakeY) {
        this.arrow = 1
      }
    }
    this.eatFood()
  }
}
