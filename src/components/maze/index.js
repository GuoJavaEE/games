import Color from 'color'
class Game {
  isImpact(pixData) {
    for (let i = 0, len = pixData.length; i < len; i += 4) {
      let color = new Color([pixData[i], pixData[i + 1], pixData[i + 2]]).toString()
      if (color === new Color(this.wallColor).toString()) return true
    }
  }
  isDone() {
    let { x: x1, y: y1 } = this.ball
    let { x, y } = this.endCoord
    let x2 = x + this.cellW * .5
    let y2 = y - this.cellW * .5
    return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) < Math.pow(this.cellW * .5, 2)
  }
  moveUp() {
    const getPixData = () => {
      let { x, y, r } = this.ball
      return this.context.getImageData(x - r, y - r - this.moveSpeed, r * 2, this.moveSpeed).data
    }
    if (this.isImpact(getPixData())) return
    this.ball.y -= this.moveSpeed
    if (this.isImpact(getPixData())) this.ball.y += 1
  }
  moveRight() {
    const getPixData = () => {
      let { x, y, r } = this.ball
      return this.context.getImageData(x + r, y - r, this.moveSpeed, r * 2).data
    }
    if (this.isImpact(getPixData())) return
    this.ball.x += this.moveSpeed
    if (this.isImpact(getPixData())) this.ball.x -= 1
  }
  moveDown() {
    const getPixData = () => {
      let { x, y, r } = this.ball
      return this.context.getImageData(x - r, y + r, r * 2, this.moveSpeed).data
    }
    if (this.isImpact(getPixData())) return
    this.ball.y += this.moveSpeed
    if (this.isImpact(getPixData())) this.ball.y -= 1
  }
  moveLeft() {
    const getPixData = () => {
      let { x, y, r } = this.ball
      return this.context.getImageData(x - r - this.moveSpeed, y - r, this.moveSpeed, r * 2).data
    }
    if (this.isImpact(getPixData())) return
    this.ball.x -= this.moveSpeed
    if (this.isImpact(getPixData())) this.ball.x += 1
  }
  move(arrow) {
    if (this.tid || this.aniFrame) return
    let { onDone = () => { } } = this.callbacks
    let action = ({ T: 'moveUp', R: 'moveRight', B: 'moveDown', L: 'moveLeft' })[arrow]
    let moveFunc = () => {
      this[action]()
      this.drawBall()
    }
    let animate = () => {
      if (this.isDone()) return onDone()
      moveFunc()
      this.aniFrame = requestAnimationFrame(animate)
    }
    moveFunc()
    this.tid = setTimeout(animate, 60)
  }
  onCtrlTouchstart(event) {
    event.preventDefault()
    let { className } = event.target
    let arrow = ({ up: 'T', right: 'R', down: 'B', left: 'L' })[className]
    this.move(arrow)
  }
  onCtrlTouchmove(event) {
    event.preventDefault()
    let target = event.target
    let touch = event.targetTouches[0]
    let ex = touch.pageX
    let ey = touch.pageY
    let offWidth = target.offsetWidth
    let offLeft = target.offsetLeft
    let offTop = target.offsetTop
    while (target.offsetParent) {
      offLeft += target.offsetParent.offsetLeft
      offTop += target.offsetParent.offsetTop
      target = target.offsetParent
    }
    if (ex < offLeft || ex > offLeft + offWidth || ey < offTop || ey > offTop + offWidth) this.onDocKeyup()
  }
}