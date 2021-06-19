class Board {
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
    this.drawScores(identColorBlocks).then(() => {
      this.dropBlocks(identColorBlocks)
      this.moveCols()
      this.drawBlocks()
      if (this.doneCheck()) setTimeout(() => utils.isFunc(onDone) && onDone(this.score), 100)
    })
  }
}
