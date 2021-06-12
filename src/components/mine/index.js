class Game {
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