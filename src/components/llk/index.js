class Game {
  onClick(event) {
    let curBlock = this.getCurBlock(event)
    if (!curBlock || this.selBlock === curBlock) return
    if (this.selBlock && this.isSameBlock(this.selBlock, curBlock)) {
      let blocks = this.findWay(this.selBlock, curBlock)
      if (blocks) {
        this.drawArc(curBlock)
        this.drawJoinLines([...blocks, curBlock])
        this.selBlock.num = curBlock.num = 0
        this.selBlock = null
        return setTimeout(() => {
          this.drawUI()
          this.doneCheck()
        }, 300)
      }
    }
    this.selBlock = curBlock
    this.drawUI()
  }

  oneCorner(b1, b2) {
    let c = this.blocks.find(_ => _ && _.row === b1.row && _.col === b2.col)
    if (!c.num && this.lineDirect(b1, c) && this.lineDirect(c, b2)) return [c]
    c = this.blocks.find(_ => _ && _.row === b2.row && _.col === b1.col)
    if (!c.num && this.lineDirect(b1, c) && this.lineDirect(c, b2)) return [c]
    return false
  }

  twoCorner(b1, b2) {
    let sameRows = this.blocks.filter(_ => _ && _ !== b1 && _.row === b1.row)
    let sameCols = this.blocks.filter(_ => _ && _ !== b1 && _.col === b1.col)
    let upBlocks = sameCols.filter(_ => _.row < b1.row)
    let rightBlocks = sameRows.filter(_ => _.col > b1.col)
    let downBlocks = sameCols.filter(_ => _.row > b1.row)
    let leftBlocks = sameRows.filter(_ => _.col < b1.col)
    for (let i = upBlocks.length - 1; i >= 0; i--) {
      let _ = upBlocks[i]
      if (_.num) break
      let arr = this.oneCorner(_, b2)
      if (arr) return [_, ...arr]
    }
    for (let i = 0; i < rightBlocks.length; i++) {
      let _ = rightBlocks[i]
      if (_.num) break
      let arr = this.oneCorner(_, b2)
      if (arr) return [_, ...arr]
    }
    for (let i = 0; i < downBlocks.length; i++) {
      let _ = downBlocks[i]
      if (_.num) break
      let arr = this.oneCorner(_, b2)
      if (arr) return [_, ...arr]
    }
    for (let i = leftBlocks.length - 1; i >= 0; i--) {
      let _ = leftBlocks[i]
      if (_.num) break
      let arr = this.oneCorner(_, b2)
      if (arr) return [_, ...arr]
    }
  }

  doneCheck() {
    let { onDone = () => {} } = this.callbacks
    return this.blocks.every(_ => !(_ && _.num)) && setTimeout(onDone, 100)
  }

  rinse() {
    this.selBlock = null
    let coords = [], count = 0
    this.blocks.forEach(_ => _ && _.dw && _.num && coords.push({ dx: _.dx, dy: _.dy }))
    coords.sort(() => Math.random() - .5)
    for (let i = 0; i < this.blocks.length; i++) {
      let _ = this.blocks[i]
      if (_ && _.dw && _.num) {
        _.dx = coords[count].dx
        _.dy = coords[count].dy
        count++
      }
    }
    this.drawUI()
  }

  drawJoinLines(blocks) {
    let { context, selBlock: b1, pixRatio } = this, b2 = blocks[0]
    if (blocks.length === 1 && (Math.abs(b1.row - b2.row) === 1 || Math.abs(b1.col - b2.col) === 1)) return
    context.save()
    context.strokeStyle = '#555'
    context.lineWidth = pixRatio
    context.beginPath()
    context.moveTo(...this.getCenter(b1))
    blocks.forEach(_ => this.context.lineTo(...this.getCenter(_)))
    context.stroke()
    context.restore()
  }
}

export default Game