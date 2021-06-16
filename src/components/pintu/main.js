/**
 * 拼图游戏
 * author: liliang
 */

import utils from '../utils'

class Game {
  constructor(mountEl, callbacks = {}) {
    this.callbacks = callbacks
    let { wrapper, canvas } = utils.createCanvas(mountEl)
    this.wrapper = wrapper
    this.canvas = canvas
    this.context = this.canvas.getContext('2d')
    this.pixRatio = utils.getPixRatio(this.context)
    this.canvas.addEventListener('click', this.onClick.bind(this))
  }

  onClick(event) {
    let { onDone } = this.callbacks
    let curBlock = this.getCurBlock(event)
    if (!(curBlock && this.canMove(curBlock))) return
    this.moveBlock(curBlock).then(() => {
      if (this.checkDone()) utils.isFunc(onDone) && onDone()
    })
  }

  getCurBlock(event) {
    let ex = (event.offsetX || event.pageX) * this.pixRatio
    let ey = (event.offsetY || event.pageY) * this.pixRatio
    return this.blocks.find(_ => _.x < ex && ex < _.x + _.w && _.y < ey && ey < _.y + _.h)
  }

  canMove(block) {
    let { blockSpace } = this
    let { x, y, w, h } = this.emptyBlock
    return (block.x === x && Math.abs(block.y - y) <= h + 2 * blockSpace)
      || (block.y === y && Math.abs(block.x - x) <= w + 2 * blockSpace)
  }

  moveBlock(block) {
    let ax = block.x, ay = block.y, action = null
    let bx = this.emptyBlock.x, by = this.emptyBlock.y
    let step = Math.floor(this[ax === bx ? 'bh' : 'bw'] / 10)
    if (ax === bx) {
      action = ay > by ? 'moveUp' : 'moveDown'
    } else {
      action = ax > bx ? 'moveLeft' : 'moveRight'
    }
    return this[action](block, this.emptyBlock, step)
  }

  moveUp(a, b, s) {
    let _this = this, ay = a.y
    return new Promise(resolve => {
      !function animate() {
        _this.frameNum = window.requestAnimationFrame(animate)
        a.y -= s
        if (a.y <= b.y) {
          window.cancelAnimationFrame(_this.frameNum)
          a.y = b.y
          b.y = ay
          resolve()
        }
        _this.drawBlocks()
      }()
    })
  }

  moveRight(a, b, s) {
    let _this = this, ax = a.x
    return new Promise(resolve => {
      !function animate() {
        _this.frameNum = window.requestAnimationFrame(animate)
        a.x += s
        if (a.x >= b.x) {
          window.cancelAnimationFrame(_this.frameNum)
          a.x = b.x
          b.x = ax
          resolve()
        }
        _this.drawBlocks()
      }()
    })
  }

  moveDown(a, b, s) {
    let _this = this, ay = a.y
    return new Promise(resolve => {
      !function animate() {
        _this.frameNum = window.requestAnimationFrame(animate)
        a.y += s
        if (a.y >= b.y) {
          window.cancelAnimationFrame(_this.frameNum)
          a.y = b.y
          b.y = ay
          resolve()
        }
        _this.drawBlocks()
      }()
    })
  }

  moveLeft(a, b, s) {
    let _this = this, ax = a.x
    return new Promise(resolve => {
      !function animate() {
        _this.frameNum = window.requestAnimationFrame(animate)
        a.x -= s
        if (a.x <= b.x) {
          window.cancelAnimationFrame(_this.frameNum)
          a.x = b.x
          b.x = ax
          resolve()
        }
        _this.drawBlocks()
      }()
    })
  }

  checkDone() {
    return this.blocks.every((_, i) => {
      let _bak = this.bakBlocks[i]
      return _bak.x === _.x && _bak.y === _.y
    })
  }

  initUI({ rows, cols, src }) {
    this.rows = rows || cols
    this.cols = cols
    this.blockSpace = this.pixRatio
    this.updateSize()
    utils.imageLoad(src).then(img => {
      this.img = img
      let { blocks, bakBlocks, emptyBlock } = this.genBlocks()
      this.blocks = blocks
      this.bakBlocks = bakBlocks
      this.emptyBlock = emptyBlock
      this.drawBlocks()
    })
  }

  updateSize() {
    let width = this.canvas.offsetWidth
    this.width = this.canvas.width = this.canvas.height = width * this.pixRatio
    this.bw = (this.width - this.blockSpace * (this.cols + 1)) / this.cols
    this.bh = (this.width - this.blockSpace * (this.rows + 1)) / this.rows
  }

  genBlocks() {
    let { img, rows, cols, bw, bh, blockSpace } = this
    let bakBlocks = []
    let iw = img.naturalWidth / cols
    let ih = img.naturalHeight / rows
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let x = (bw + blockSpace) * col + blockSpace
        let y = (bh + blockSpace) * row + blockSpace
        bakBlocks.push({ ix: iw * col, iy: ih * row, iw, ih, x, y, w: bw, h: bh })
      }
    }
    let delIndex = [0, cols - 1, cols * (rows - 1), rows * (cols - 1)][utils.getRndInt(0, 3)]
    return {
      emptyBlock: bakBlocks.splice(delIndex, 1)[0],
      bakBlocks,
      blocks: this.createRndBlocks(bakBlocks)
    }
  }

  createRndBlocks(blocks) {
    let coords = blocks.map(_ => ({ x: _.x, y: _.y }))
    coords.sort(() => Math.random() - .5)
    let rtnBlocks = JSON.parse(JSON.stringify(blocks))
    rtnBlocks.forEach((_, i) => {
      _.x = coords[i].x
      _.y = coords[i].y
    })
    return rtnBlocks
  }

  drawBlocks() {
    let { context, img, width, blocks } = this
    context.clearRect(0, 0, width, width)
    blocks.forEach(_ => {
      let { ix, iy, iw, ih, x, y, w, h } = _
      context.drawImage(img, ix, iy, iw, ih, x, y, w, h )
    })
  }
}

let options = { cols: 3, src: document.getElementById('gameImage').src }
let demo = new Game(document.querySelector('.game-container'), {
  onDone() {
    if (confirm('恭喜！你完成了！要体验更高难度的吗？')) options.cols += 1
    demo.initUI(options)
  }
})
demo.initUI(options)