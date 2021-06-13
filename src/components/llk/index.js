class Game {
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
}
