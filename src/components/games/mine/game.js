export default class {
  constructor (el, options = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    this.rows = options.rows || 9
    this.cols = options.cols || 9
    this.mineCount = options.mineCount || 10
    this.blocks = []
  }

  start (options = {}) {
    
  }

  drawUI () {

  }

  genMineMap (block) {
    
  }

  genBlocks () {
    return new Array(this.rows)
      .fill(0)
      .reduce((t, a, row) => {
        return t.concat(
          new Array(this.cols)
            .fill(0)
            .map((b, col) => ({ row, col }))
        )
      }, [])
  }

  getBlock (event) {

  }
}
