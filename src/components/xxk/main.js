class Board {
  initUI({ rows, cols, colors = [] }) {
    if (colors.length < 3) throw new Error('请至少提供3种颜色.')
    this.rows = rows || cols
    this.cols = cols
    if ((this.rows * this.cols) % 2) throw new Error('行和列的积必须是2的倍数.')
    this.colors = colors
    this.score = 0
    this.blockSize = 0
    this.blockSpace = this.pixRatio * 2
    this.updateSize()
    this.blocks = this.genBlocks()
    this.drawBlocks()
  }

  updateSize() {
    let cvsWidth, width = this.canvas.offsetWidth
    this.canvas.width = cvsWidth = this.pixRatio * width
    this.blockSize = (cvsWidth - this.blockSpace) / this.cols
    this.canvas.height = this.rows * this.blockSize + this.blockSpace
  }

  genBlocks() {
    let total = this.rows * this.cols
    let colorCount = this.colors.length
    let colors = [], blocks = [], index = 0
    for (let i = 0; i < total / 2; i++) {
      colors.push(this.colors[utils.getRndInt(0, colorCount - 1)])
    }
    colors = colors.concat(colors).sort(() => Math.random() - .5)
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        blocks.push(new Block({ row, col, color: colors[index] }))
        index++
      }
    }
    return blocks
  }

  drawBlocks() {
    let { width, height } = this.canvas
    let { context, blockSize: size, blockSpace: space } = this
    this.context.clearRect(0, 0, +width, +height)
    this.blocks.forEach(_ => _ && _.draw({ context, size, space }))
  }

  getCurBlock(event) {
    let ex = (event.offsetX || event.pageX) * this.pixRatio
    let ey = (event.offsetY || event.pageY) * this.pixRatio
    let curCol = Math.floor(ex / this.blockSize)
    let curRow = Math.floor(ey / this.blockSize)
    for (let i = 0, len = this.blocks.length; i < len; i++) {
      let _ = this.blocks[i]
      if (_ && _.row === curRow && _.col === curCol) return _
    }
  }

  getTRBLBlocks(block) {
    let i = this.blocks.indexOf(block), { row, col } = block
    let T = this.blocks.find(_ => _ && _.col === col && _.row === row - 1)
    let R = this.blocks.find(_ => _ && _.row === row && _.col === col + 1)
    let B = this.blocks.find(_ => _ && _.col === col && _.row === row + 1)
    let L = this.blocks.find(_ => _ && _.row === row && _.col === col - 1)
    let blocks = [T, R, B, L]
    if (i % this.cols === 0) {
      blocks = [T, R, B]
    } else if ((i + 1) % this.cols === 0) {
      blocks = [T, B, L]
    }
    return blocks.filter(_ => _)
  }

  getIdentColorBlocks(block) {
    let checkedBlocks = [], noCheckBlocks = [block]
    while (noCheckBlocks.length) {
      let b = noCheckBlocks.pop()
      checkedBlocks.indexOf(b) === -1 && checkedBlocks.push(b)
      this.getTRBLBlocks(b).forEach(_ => {
        if (_.color === b.color && checkedBlocks.indexOf(_) === -1) {
          noCheckBlocks.push(_)
        }
      })
    }
    return checkedBlocks
  }

  removeBlocks(blocks) {
    blocks.forEach(_ => {
      this.blocks.splice(this.blocks.indexOf(_), 1, null)
    })
  }

  drawScores(blocks) {
    let cvsStyle = window.getComputedStyle(this.canvas, null)
    let padX = parseInt(cvsStyle.paddingLeft)
    let padY = parseInt(cvsStyle.paddingTop)
    const div = document.createElement('div')
    div.innerHTML = blocks.map(_ => {
      let T = _.row * this.blockSize / this.pixRatio + padY + 'px'
      let L = _.col * this.blockSize / this.pixRatio + padX + 'px'
      let W = this.blockSize / this.pixRatio + 'px'
      return `<span class="scores" style="top:${T};left:${L};width:${W};height:${W};line-height:${W}">+${blocks.length}</span>`
    }).join('')
    this.wrapper.appendChild(div)
    return new Promise(resolve => {
      setTimeout(() => {
        this.wrapper.removeChild(div)
        resolve()
      }, 300)
    })
  }

  getEmptyCount(block) {
    return this.rows - block.row - this.blocks.filter(_ => _ && _.col === block.col && _.row > block.row).length - 1
  }

  getBlocksByCol(col) {
    return this.blocks.filter(_ => _ && _.col === col)
  }

  dropBlocks(blocks) {
    let cols = []
    blocks.forEach(_ => cols.indexOf(_.col) === -1 && cols.push(_.col))
    cols.forEach(col => {
      let counts = []
      let blocksByCol = this.getBlocksByCol(col)
      blocksByCol.forEach(_ => counts.push(this.getEmptyCount(_)))
      blocksByCol.forEach((_, i) => _.row += counts[i])
    })
  }

  isEmptyCol(col) {
    return !this.blocks.filter(_ => _ && _.col === col).length
  }

  getEmptyCols() {
    let cols = []
    for (let col = 0; col < this.cols - 1; col++) {
      this.isEmptyCol(col) && cols.push(col)
    }
    return cols
  }

  moveCols() {
    let emptyCols = this.getEmptyCols()
    this.blocks.forEach(_ => _ && (_.col -= emptyCols.filter(col => col < _.col).length))
  }

  doneCheck() {
    let blocks = this.blocks.filter(_ => _)
    for (let i = 0, len = blocks.length; i < len; i++) {
      let _ = blocks[i]
      if (this.getIdentColorBlocks(_).length > 1) return false
    }
    return true
  }

  onClick(event) {
    let curBlock = this.getCurBlock(event)
    if (!curBlock) return
    let identColorBlocks = this.getIdentColorBlocks(curBlock)
    let len = identColorBlocks.length
    if (len < 2) return
    let { onDone } = this.callbacks
    this.score += len * len
    this.removeBlocks(identColorBlocks)
    this.drawBlocks()
    this.drawScores(identColorBlocks).then(() => {
      this.dropBlocks(identColorBlocks)
      this.moveCols()
      this.drawBlocks()
      if (this.doneCheck()) setTimeout(() => utils.isFunc(onDone) && onDone(this.score), 100)
    })
  }
}

let testOptions = { cols: 10, colors: ['#22a6ea','#f44e4e','#b3cc25','#f1a30c','#b854e6'] }
const demo = new Board(null, {
  onDone(score) {
    alert(`没有可消除的方块了，你的得分: ${score}`)
    demo.initUI(testOptions)
  }
})
demo.initUI(testOptions)
