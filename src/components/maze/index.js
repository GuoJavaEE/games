class Game {
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