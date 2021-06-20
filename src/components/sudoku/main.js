class Block {
  draw({ context, size, space }) {
    let x = (size + space) * this.col + space
    let y = (size + space) * this.row + space
    context.save()
    if (this.isInput) {
      context.fillStyle = '#fff'
      context.fillRect(x, y, size, size)
      if (this.isFocus) {
        context.save()
        context.strokeStyle = context.shadowColor = '#00f'
        context.shadowBlur = space * 8
        context.strokeRect(x, y, size, size)
        context.restore()
      }
    }
    if (this.num) {
      context.fillStyle = '#424242'
      context.font = `bold ${size / 2}px serif`
      context.textBaseline = 'hanging'
      let fw = context.measureText(this.num).width
      context.fillText(this.num, x + (size - fw) / 2, y + (size - fw) / 2)
    }
    context.restore()
  }
}

class Board {
  constructor(mountEl, callbacks = {}) {
    this.rows = this.cols = 9
    this.callbacks = callbacks
    this.canvas = utils.createCanvas(mountEl).canvas
    this.context = this.canvas.getContext('2d')
    this.pixRatio = utils.getPixRatio(this.context)
    this.blockSpace = this.pixRatio
    this.keyboard = this.createNumKeys()
    this.canvas.addEventListener('click', this.onClick.bind(this))
    this.keyboard.addEventListener('click', this.onKeyboardClick.bind(this))
  }

  onClick(event) {
    let curBlock = this.getCurBlock(event)
    if (curBlock === this.focusBlock) return
    this.focusBlock && (this.focusBlock.isFocus = false)
    if (curBlock && curBlock.isInput) {
      this.focusBlock = curBlock
      this.focusBlock.isFocus = true
    } else {
      this.focusBlock = null
    }
    this.drawUI()
    this.updateNumkeysPos()
  }

  onKeyboardClick(event) {
    let { target } = event, { onDone } = this.callbacks
    if (target.tagName.toLowerCase() === 'li') {
      this.focusBlock.num = +target.textContent
      this.focusBlock.isFocus = false
      this.focusBlock = null
    }
    this.drawUI()
    this.keyboard.classList.remove('show')
    if (this.checkDone()) {
      setTimeout(() => utils.isFunc(onDone) && onDone(), 300)
    }
  }

  getCurBlock(event) {
    let space = this.blockSize + this.blockSpace
    let ex = (event.offsetX || event.pageX) * this.pixRatio
    let ey = (event.offsetY || event.pageY) * this.pixRatio
    let curCol = Math.floor((ex - this.blockSpace) / space)
    let curRow = Math.floor((ey - this.blockSpace) / space)
    for (let i = 0, len = this.blocks.length; i < len; i++) {
      let _ = this.blocks[i]
      if (_.row === curRow && _.col === curCol) return _
    }
  }

  createNumKeys() {
    let ul = document.createElement('ul')
    ul.className = 'keyboard'
    ul.innerHTML = Array(9).fill(null).map((_, i) => `<li>${i + 1}</li>`).join('')
    this.canvas.parentNode.appendChild(ul)
    return ul
  }

  updateNumkeysPos() {
    let { blockSize, blockSpace, pixRatio, keyboard } = this
    if (this.focusBlock) {
      let { row } = this.focusBlock
      keyboard.style.top = ((row + 1) * (blockSize + blockSpace) + blockSpace) / pixRatio + 'px'
      keyboard.classList.add('show')
    } else {
      keyboard.classList.remove('show')
    }
  }

  checkDone() {
    return this.bakEmptyBlocks.every((_, i) =>  _.num === this.blocks[i].num)
  }

  initUI(emptyCount = 20, colors = ['#ccc','#def1e6']) {
    this.emptyCount = Math.min(emptyCount, 72)
    this.colors = colors
    this.focusBlock = null
    this.updateSize()
    this.keyboard.style.lineHeight = this.blockSize / this.pixRatio + 'px'
    let { bakEmptyBlocks, blocks } = this.genBlocks()
    this.bakEmptyBlocks = bakEmptyBlocks
    this.blocks = blocks
    this.drawUI()
  }

  updateSize() {
    let width = this.canvas.offsetWidth
    this.width = this.canvas.width = this.canvas.height = width * this.pixRatio
    this.blockSize = (this.width - (this.rows + 1) * this.blockSpace) / this.rows
  }

  drawAreaBG() {
    let { context, colors } = this
    let width = this.width / 3, count = 0
    context.save()
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        context.fillStyle = colors[count % 2]
        context.fillRect(col * width, row * width, width, width)
        count++
      }
    }
    context.restore()
  }

  drawLines() {
    let { context, blockSize, blockSpace, rows, width } = this
    let space = blockSize + blockSpace
    context.save()
    context.lineWidth = blockSpace
    context.strokeStyle = '#424242'
    context.beginPath()
    for (let i = 0; i < rows + 1; i++) {
      context.moveTo(0, i * space + blockSpace / 2)
      context.lineTo(width, i * space + blockSpace / 2)
      context.moveTo(i * space + blockSpace / 2, 0)
      context.lineTo(i * space + blockSpace / 2, width)
    }
    context.stroke()
    context.restore()
  }

  drawUI() {
    let { context, width, blockSize: size, blockSpace: space } = this
    context.clearRect(0, 0, width, width)
    this.drawAreaBG()
    this.drawLines()
    this.blocks.forEach(_ => _.draw({ context, size, space  }))
  }
}
