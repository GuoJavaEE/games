class AIPlayer {
  play() {
    let pos = null, score = 0
    this.game.chessData.forEach(_ => {
      if (_.num) return
      let curScore = this.judge(_)
      if (curScore > score) {
        score = curScore
        pos = _
      }
    })
    return pos
  }

  judge(pos) {
    let a = this.LR(pos, 1) + this.TB(pos, 1) + this.RB(pos, 1) + this.RT(pos, 1) + 100
    let b = this.LR(pos, 2) + this.TB(pos, 2) + this.RB(pos, 2) + this.RT(pos, 2)
    return a + b
  }

  getCoords(pos, num) {
    let { row, col } = pos
    return this.game.chessData.map(_ => {
      return { row: _.row, col: _.col, num: _.row === row && _.col === col ? num : _.num }
    })
  }

  LR(pos, num) {
    let death = 0, count = 0, { row, col } = pos, { rows } = this.game
    let coords = this.getCoords(pos, num)
    for (var i = row; i >= 0; i--) {
      let _ = coords.find(_ => _.row === i && _.col === col)
      if (_.num === num) {
        count++
      } else {
        if (_.num) death += 1
        break
      }
    }
    for (var i = row; i < rows; i++) {
      let _ = coords.find(_ => _.row === i && _.col === col)
      if (_.num === num) {
        count++
      } else {
        if (_.num) death += 1
        break
      }
    }
    count -= 1
    return this.model(count, death)
  }

  TB(pos, num) {
    let death = 0, count = 0, { row, col } = pos, { cols } = this.game
    let coords = this.getCoords(pos, num)
    for (var i = col; i >= 0; i--) {
      let _ = coords.find(_ => _.col === i && _.row === row)
      if (_.num === num) {
        count++
      } else {
        if (_.num) death += 1
        break
      }
    }
    for (var i = col; i < cols; i++) {
      let _ = coords.find(_ => _.col === i && _.row === row)
      if (_.num === num) {
        count++
      } else {
        if (_.num) death += 1
        break
      }
    }
    count -= 1
    return this.model(count, death)
  }

  RB(pos, num) {
    let death = 0, count = 0, { row, col } = pos, { rows, cols } = this.game
    let coords = this.getCoords(pos, num)
    for (let i = row, j = col; i >= 0 && j >= 0;) {
      let _ = coords.find(_ => _.row === i && _.col === j)
      if (_.num === num) {
        count++
      } else {
        if (_.num) death += 1
        break
      }
      i--
      j--
    }
    for (let i = row, j = col; i < rows && j < cols;) {
      let _ = coords.find(_ => _.row === i && _.col === j)
      if (_.num === num) {
        count++
      } else {
        if (_.num) death += 1
        break
      }
      i++
      j++
    }
    count -= 1
    return this.model(count, death)
  }

  RT(pos, num) {
    let death = 0, count = 0, { row, col } = pos, { rows, cols } = this.game
    let coords = this.getCoords(pos, num)
    for (let i = row, j = col; i >= 0 && j < cols;) {
      let _ = coords.find(_ => _.row === i && _.col === j)
      if (_.num === num) {
        count++
      } else {
        if (_.num) death += 1
        break
      }
      i--
      j++
    }
    for (let i = row, j = col; i < rows && j >= 0;) {
      let _ = coords.find(_ => _.row === i && _.col === j)
      if (_.num === num) {
        count++
      } else {
        if (_.num) death += 1
        break
      }
      i++
      j--
    }
    count -= 1
    return this.model(count, death)
  }

  model(count, death) {
    var LEVEL_ONE = 0 //单子
    var LEVEL_TWO = 1 //眠2，眠1
    var LEVEL_THREE = 1500 //眠3，活2
    var LEVEL_FOER = 4000 //冲4，活3
    var LEVEL_FIVE = 10000 //活4
    var LEVEL_SIX = 100000 //成5
    if (count === 1 && death == 1) {
      return LEVEL_TWO //眠1
    } else if (count === 2) {
      if (death === 0) {
        return LEVEL_THREE //活2
      } else if (death === 1) {
        return LEVEL_TWO //眠2
      } else {
        return LEVEL_ONE //死棋
      }
    } else if (count === 3) {
      if (death == 0) {
        return LEVEL_FOER //活3
      } else if (death === 1) {
        return LEVEL_THREE //眠3
      } else {
        return LEVEL_ONE //死棋
      }
    } else if (count === 4) {
      if (death === 0) {
        return LEVEL_FIVE //活4
      } else if (death === 1) {
        return LEVEL_FOER //冲4
      } else {
        return LEVEL_ONE //死棋
      }
    } else if (count === 5) {
      return LEVEL_SIX //成5
    }
    return LEVEL_ONE
  }
}

class Game {
  onClick(event) {
    let { onGameover = () => {} } = this.callbacks
    let curChess = this.getCurrent(event)
    if (!curChess) return
    curChess.num = 2
    this.drawUI()
    if (this.checkResult(curChess)) return setTimeout(onGameover, 100, curChess.num)
    let aiCurChess = this.aiplayer.play()
    aiCurChess.num = 1
    this.drawUI()
    this.drawActiveAIChess(aiCurChess)
    if (this.checkResult(aiCurChess)) setTimeout(onGameover, 100, aiCurChess.num)
  }

  checkResult(chess) {
    return this.checkTB(chess) || this.checkLR(chess) || this.checkZXie(chess) || this.checkFXie(chess)
  }

  checkTB(chess) {
    let count = 0
    let arr = this.chessData.filter(_ => _.col === chess.col)
    let checks = arr.filter(_ => _.row < chess.row)
    for (let i = checks.length - 1; i >= 0; i--) {
      if (checks[i].num !== chess.num) break
      count++
    }
    checks = arr.filter(_ => _.row > chess.row)
    for (let i = 0; i < checks.length; i++) {
      if (checks[i].num !== chess.num) break
      count++
    }
    return count >= 4 ? chess.num : 0
  }

  checkLR(chess) {
    let count = 0
    let arr = this.chessData.filter(_ => _.row === chess.row)
    let checks = arr.filter(_ => _.col < chess.col)
    for (let i = checks.length - 1; i >= 0; i--) {
      if (checks[i].num !== chess.num) break
      count++
    }
    checks = arr.filter(_ => _.col > chess.col)
    for (let i = 0; i < checks.length; i++) {
      if (checks[i].num !== chess.num) break
      count++
    }
    return count >= 4 ? chess.num : 0
  }

  checkZXie(chess) {
    let count = 0
    for (let i = 1; i < 5; i++) {
      let item = this.chessData.find(_ => _.row === chess.row - i && _.col === chess.col + i)
      if (!item || item.num !== chess.num) break
      count++
    }
    for (let i = 1; i < 5; i++) {
      let item = this.chessData.find(_ => _.row === chess.row + i && _.col === chess.col - i)
      if (!item || item.num !== chess.num) break
      count++
    }
    return count >= 4 ? chess.num : 0
  }

  checkFXie(chess) {
    let count = 0
    for (let i = 1; i < 5; i++) {
      let item = this.chessData.find(_ => _.row === chess.row - i && _.col === chess.col - i)
      if (!item || item.num !== chess.num) break
      count++
    }
    for (let i = 1; i < 5; i++) {
      let item = this.chessData.find(_ => _.row === chess.row + i && _.col === chess.col + i)
      if (!item || item.num !== chess.num) break
      count++
    }
    return count >= 4 ? chess.num : 0
  }

  drawActiveAIChess(chess) {
    let { x, y } = chess, { chessRadius: r, context } = this
    context.save()
    context.fillStyle = '#ccc'
    context.beginPath()
    context.arc(x, y, r * .7, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
}

export default Game