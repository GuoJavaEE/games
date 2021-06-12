interface Block {
  row: number,
  col: number,
  num: number,
  open?: boolean
}

const genArr = (len: number, val: any) => Array(len).fill(val)

const getBlock = (blocks: Block[], row: number, col: number) => {
  return blocks.find(_ => _.row === row && _.col === col)
}

const updateBlocksNum = (blocks: Block[]) => {
  const get = (row: number, col: number) => getBlock(blocks, row, col)
  blocks.forEach(_ => {
    if (_.num !== 9) {
      _.num = [
        get(_.row- 1, _.col - 1),
        get(_.row - 1, _.col),
        get(_.row - 1, _.col + 1),
        get(_.row, _.col + 1),
        get(_.row + 1, _.col + 1),
        get(_.row + 1, _.col),
        get(_.row + 1, _.col -1),
        get(_.row, _.col - 1)
      ].filter(_ => _ && _.num === 9).length
    }
  })
}

const genMineMap = (rows: number, cols: number, mineCount: number): Block[] => {
  const blocks: Block[] = genArr(rows, 0).reduce((t, a, row) => {
    return t.concat(
      genArr(cols, 0).map((b, col) => ({ row, col, num: 0 }))
    )
  }, [])

  const nums: number[] = genArr(mineCount, 9).concat(
    genArr(blocks.length - mineCount, 0)
  )
  nums.sort(() => Math.random() - .5)

  blocks.forEach((_, i) => {
    _.num = nums[i]
  })

  updateBlocksNum(blocks)

  return blocks
}

console.log(genMineMap(9, 9, 10).map(_ => _.num))

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
