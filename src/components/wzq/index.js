class AIPlayer {
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
}

class Game {
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
}

export default Game