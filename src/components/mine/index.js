/**
 * 扫雷游戏
 * author: liliang
 */

import fs from 'fs'

!function() {
  let styleStr = fs.readFileSync(__dirname + '/assets/css/style.css', 'utf8')
  const styleEl = document.getElementById('gameStylesheet')
  if (styleEl) return
  const newStyleEl = document.createElement('style')
  newStyleEl.type = 'text/css'
  newStyleEl.id = 'gameStylesheet'
  newStyleEl.innerHTML = styleStr
  document.head.appendChild(newStyleEl)
}()

const source = { icons: {}, isIconsLoaded: false }

source.templates = {
  dashboard: fs.readFileSync(__dirname + '/assets/html/dashboard.html', 'utf8')
}

source.base64Strs = (() => {
  const bufIcons = {
    blockEnd: fs.readFileSync(__dirname + '/assets/img/back.png'),
    blockFront: fs.readFileSync(__dirname + '/assets/img/front.png'),
    bomb: fs.readFileSync(__dirname + '/assets/img/bomb.png'),
    flag: fs.readFileSync(__dirname + '/assets/img/flag-color.png')
  }, rtnObj = {}
  Object.keys(bufIcons).forEach(_ => 
    rtnObj[_] = `data:image/png;base64,${bufIcons[_].toString('base64')}`
  )
  return rtnObj
})()

source.loadSingleIcon = function (key) {
  return new Promise(resolve => {
    const image = new Image()
    image.onload = () => {
      image.onload = null
      resolve({ [key]: image })
    }
    image.src = this.base64Strs[key]
  })
}

source.loadIcons = function () {
  if (this.isIconsLoaded) return Promise.resolve()
  return Promise.all(Object.keys(this.base64Strs).map(_ => 
    this.loadSingleIcon(_)
  )).then(values => {
    this.isIconsLoaded = true
    values.forEach(item => this.icons = { ...this.icons, ...item })
  })
}

class Block {
  constructor({ row, col, num = 0 }) {
    this.row = row
    this.col = col
    this.num = num
    this.isFlag = false
    this.isOpened = false
  }

  drawText({ context, size, space }) {
    let fontSize = size / 2 + 'px'
    let color = ({ 1: '#ff0', 2: '#0f0' })[this.num] || '#f00'
    let fw = context.measureText(this.num).width
    let tx = this.col * size + (size - space - fw) / 2
    let ty = this.row * size + (size - space - fw) / 2
    context.save()
    context.font = `bold ${fontSize} serif`
    context.textBaseline = 'hanging'
    context.fillStyle = color
    context.fillText(this.num, tx, ty)
    context.restore()
  }

  drawIcon({ context, size, space, icon }) {
    let dw, dh
    if (icon.width > icon.height) {
      dw = size * .5
      dh = dw * (icon.height / icon.width)
    } else {
      dh = size * .5
      dw = dh * (icon.width / icon.height)
    }
    let dx = this.col * size + space + (size - space - dw) / 2
    let dy = this.row * size + space + (size - space - dh) / 2
    context.drawImage(icon, dx, dy, dw, dh)
  }

  drawBG({ context, size, space, icon }) {
    context.drawImage(
      icon, 0, 0, icon.width, icon.height,
      this.col * size + space, this.row * size + space, size - space, size - space
    )
  }

  draw({ context, size, space = 6 }) {
    let params = { context, size, space }
    let { blockEnd, bomb, blockFront, flag } = source.icons
    if (this.isOpened) {
      this.drawBG({ ...params, icon: blockEnd })
      if (this.num > 0 && this.num < 9) {
        this.drawText(params)
      } else if (this.num === 9) {
        this.drawIcon({ ...params, icon: bomb })
      }
    } else {
      this.drawBG({ ...params, icon: blockFront })
      if (this.isFlag) {
        this.drawIcon({ ...params, icon: flag })
      }
    }
  }
}

const utils = {
  createWrapper(mountEl) {
    mountEl = mountEl || document.body
    const wrapper = document.createElement('div')
    wrapper.className = 'game-wrapper'
    mountEl.appendChild(wrapper)
    return wrapper
  },

  createCanvas(wrapper) {
    const canvas = document.createElement('canvas')
    canvas.className = 'game-ui'
    wrapper.appendChild(canvas)
    return canvas
  },

  getPixRatio(context) {
    var backingStore = context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio || 1
    return (window.devicePixelRatio || 1) / backingStore
  },

  genBlocks(rows, cols) {
    const blocks = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        blocks.push(new Block({ row, col }))
      }
    }
    return blocks
  },

  isFunc(func) {
    return typeof func === 'function'
  }
}

class Game {
  constructor(wrapper, callbacks = {}) {
    this.callbacks = callbacks
    this.canvas = utils.createCanvas(wrapper)
    this.context = this.canvas.getContext('2d')
    this.pixRatio = utils.getPixRatio(this.context)
    this.addListener()
  }

  initUI({ rows, cols, mineCount, blockSpace = 6 }) {
    this.rows = rows
    this.cols = cols
    this.mineCount = mineCount
    this.blockSpace = blockSpace
    this.blockSize = 0
    this.isEnd = false
    this.isFirstClick = true
    this.updateSize()
    this.blocks = utils.genBlocks(this.rows, this.cols)
    this.drawBlocks()
  }

  updateSize() {
    let width = this.canvas.offsetWidth
    let canvasHeight, canvasWidth = this.pixRatio * width
    let blockSize = (canvasWidth - this.blockSpace) / this.cols
    let maxHeight = this.pixRatio * (window.innerHeight - 100)
    if (this.rows) {
      if (this.rows * blockSize > maxHeight) {
        this.rows = Math.floor(maxHeight / blockSize)
      }
      canvasHeight = this.rows * blockSize + this.blockSpace
    } else {
      this.rows = this.cols
      canvasHeight = canvasWidth
    }
    this.blockSize = blockSize
    this.canvas.width = canvasWidth
    this.canvas.height = canvasHeight
  }

  drawBlocks() {
    let { width, height } = this.canvas
    this.context.clearRect(0, 0, +width, +height)
    this.blocks.forEach(block => {
      block.draw({
        context: this.context,
        size: this.blockSize,
        space: this.blockSpace
      })
    })
  }

  getCurBlock(event) {
    let ex = (event.offsetX || event.pageX) * this.pixRatio
    let ey = (event.offsetY || event.pageY) * this.pixRatio
    let curCol = Math.floor(ex / this.blockSize)
    let curRow = Math.floor(ey / this.blockSize)
    for (let i = 0, len = this.blocks.length; i < len; i++) {
      let _ = this.blocks[i]
      if (_.row === curRow && _.col === curCol) return _
    }
  }

  addListener() {
    this.canvas.addEventListener('click', this.onClick.bind(this), false)
    this.canvas.addEventListener('contextmenu', this.onContextmenu.bind(this), false)
  }

  onClick(event) {
    if (this.isEnd) return
    let curBlock = this.getCurBlock(event)
    if (!curBlock || curBlock.isOpened || curBlock.isFlag) return
    let { onWinning, onOver, onUpdate } = this.callbacks
    if (this.isFirstClick) {
      this.isFirstClick = false
      this.updateMineMap(curBlock)
    }
    curBlock.isOpened = true
    if (curBlock.num === 9) {
      this.bombAndOver()
      return setTimeout(() => utils.isFunc(onOver) && onOver(), 100)
    }
    if (!curBlock.num) this.openZeroBlocks(curBlock)
    this.drawBlocks()
    utils.isFunc(onUpdate) && onUpdate()
    if (this.checkDone()) {
      setTimeout(() => utils.isFunc(onWinning) && onWinning(), 100)
    }
  }

  onContextmenu(event) {
    event.preventDefault()
    if (this.isEnd) return
    let curBlock = this.getCurBlock(event)
    if (!curBlock || curBlock.isOpened) return
    curBlock.isFlag = !curBlock.isFlag
    this.drawBlocks()
    utils.isFunc(this.callbacks.onUpdate) && this.callbacks.onUpdate()
  }

  updateMineMap(block) {
    let numArray = [
      ...Array(this.mineCount).fill(9), 
      ...Array(this.blocks.length - this.mineCount).fill(0)
    ]
    numArray.sort(() => Math.random() - .5)
    let curIndex = this.blocks.indexOf(block)
    if (numArray[curIndex] === 9) {
      for (let i = 0, len = numArray.length; i < len; i++) {
        if (!numArray[i]) {
          numArray[curIndex] = 0
          numArray[i] = 9
          break
        }
      }
    }
    numArray.forEach((num, index) => this.blocks[index].num = num)
    this.updateBlocksNum()
  }

  getRoundBlocks(i) {
    let tl = this.blocks[i - this.cols - 1]
    let tm = this.blocks[i - this.cols]
    let tr = this.blocks[i - this.cols + 1]
    let r = this.blocks[i + 1]
    let br = this.blocks[i + this.cols + 1]
    let bm = this.blocks[i + this.cols]
    let bl = this.blocks[i + this.cols - 1]
    let l = this.blocks[i - 1]
    let arr = [tl, tm, tr, r, br, bm, bl, l]
    if (i % this.cols === 0) {
      arr = [tm, tr, r, br, bm]
    } else if ((i + 1) % this.cols === 0) {
      arr = [tl, tm, bm, bl, l]
    }
    return arr.filter(_ => _)
  }

  getTRBLBlocks(i) {
    let t = this.blocks[i - this.cols]
    let r = this.blocks[i + 1]
    let b = this.blocks[i + this.cols]
    let l = this.blocks[i - 1]
    let arr = [t, r, b, l]
    if (i % this.cols === 0) {
      arr = [t, r, b]
    } else if ((i + 1) % this.cols === 0) {
      arr = [t, b, l]
    }
    return arr.filter(_ => _)
  }

  updateBlocksNum() {
    for (let i = 0, len = this.blocks.length; i < len; i++) {
      let block = this.blocks[i]
      if (block.num === 9) continue
      block.num = this.getRoundBlocks(i).filter(_ => _.num === 9).length
    }
  }

  bombAndOver() {
    let { context, blockSize: size, blockSpace: space } = this
    this.blocks.forEach(_ => {
      if (_.num === 9) {
        _.isOpened = true
        _.draw({ context, size, space })
      }
    })
    this.isEnd = true
  }

  openZeroBlocks(block) {
    let checkedBlocks = [], noCheckBlocks = [block]
    while (noCheckBlocks.length) {
      let b = noCheckBlocks.pop()
      if (checkedBlocks.indexOf(b) === -1) checkedBlocks.push(b)
      let index = this.blocks.indexOf(b)
      let roundBlocks = this.getTRBLBlocks(index)
      for (let i = 0, len = roundBlocks.length; i < len; i++) {
        let _ = roundBlocks[i]
        if (_.isFlag || checkedBlocks.indexOf(_) !== -1) continue
        if (!_.num) noCheckBlocks.push(_)
        else if (_.num < 9) checkedBlocks.push(_)
      }
    }
    checkedBlocks.forEach(_ => _.isOpened = true)
  }

  checkDone() {
    for (let i = 0, len = this.blocks.length; i < len; i++) {
      let _ = this.blocks[i]
      if (_.num !== 9 && !_.isOpened) return false
    }
    this.isEnd = true
    return true
  }
  
  getState() {
    let flags = 0, opens = 0
    for (let i = 0, len = this.blocks.length; i < len; i++) {
      let { isFlag, isOpened } = this.blocks[i]
      if (isFlag) flags += 1
      else if (isOpened) opens += 1
    }
    return { flags, opens }
  }
}

class GameController {
  constructor(mountEl, callbacks = {}) {
    this.callbacks = callbacks
    this.container = utils.createWrapper(mountEl)
    this.container.innerHTML = source.templates.dashboard
    this.game = new Game(this.container, {
      onWinning: this.onWinning.bind(this),
      onOver: this.onOver.bind(this),
      onUpdate: this.onUpdate.bind(this)
    })
  }

  start({ rows, cols, mineCount, blockSpace }) {
    this.state = { flags: 0, opens: 0 }
    source.loadIcons().then(() => {
      this.game.initUI({ rows, cols, mineCount, blockSpace })
    })
  }

  onWinning() {
    utils.isFunc(this.callbacks.onWinning) && this.callbacks.onWinning()
  }

  onOver() {
    utils.isFunc(this.callbacks.onOver) && this.callbacks.onOver()
  }

  onUpdate() {
    this.state = this.game.getState()
    utils.isFunc(this.callbacks.onUpdate) && this.callbacks.onUpdate(this.state)
  }
}

module.exports = GameController