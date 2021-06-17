class Game {
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
}
