class Board {
  onTouchstart(event) {
    event.preventDefault()
    let touch=event.targetTouches[0]
    this.startX = touch.pageX
    this.startY = touch.pageY
  }

  onTouchmove(event) {
    event.preventDefault()
    let touch = event.targetTouches[0]
    this.endX = touch.pageX
    this.endY = touch.pageY
  }

  onTouchend() {
    if (!this.endX || this.isEnd) return
    let offX = Math.abs(this.endX - this.startX) / this.pixRatio
    let offY = Math.abs(this.endY - this.startY) / this.pixRatio
    if (offX > 6 || offY > 6) {
      if (offX > offY) {
        this[this.endX > this.startX ? 'moveRight' : 'moveLeft']()
      } else {
        this[this.endY > this.startY ? 'moveDown' : 'moveUp']()
      }
      this.rndBlock()
      this.drawUI()
      this.checkDone()
    }
    this.startX = this.startY = this.endX = this.endY = 0
  }

  checkDone() {
    let { onWinning, onGameover } = this.callbacks
    for (let i = 0, len = this.blocks.length; i < len; i++) {
      let _ = this.blocks[i]
      if (_.num === 2048) {
        setTimeout(() => utils.isFunc(onWinning) && onWinning(this.score), 100)
        this.isEnd = true
        return true
      }
      if (!_.num) return false
    }
    if (this.checkCells('rows') && this.checkCells('cols')) {
      setTimeout(() => utils.isFunc(onGameover) && onGameover(this.score), 100)
      return true
    }
  }

  checkCells(type = 'rows') {
    for (let i = 0; i < this[type]; i++) {
      let data = type === 'rows' ?
        this.getRowData(i).sort((a, b) => b.x - a.x) :
        this.getColData(i).sort((a, b) => b.y - a.y)
      let nums = data.map(_ => _.num)
      for (let j = 0; j < nums.length; j++) {
        let num = nums[j], nextNum = nums[j + 1]
        if (num === nextNum) return false
      }
    }
    return true
  }
}
