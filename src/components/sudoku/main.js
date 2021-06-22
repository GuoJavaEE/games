class Board {
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
    this.keyboard.style.lineHeight = this.blockSize / this.pixRatio + 'px'
  }
}
