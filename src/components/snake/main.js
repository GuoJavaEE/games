class Board {
  canEat() {
    let { arrow, food } = this
    let { row, col } = this.snake[0]
    return (arrow === 1 && col === food.col && row === food.row + 1)
      || (arrow === 2 && col === food.col - 1 && row === food.row)
      || (arrow === 3 && col === food.col && row === food.row - 1)
      || (arrow === 4 && col === food.col + 1 && row === food.row)
  }

  isEnd() {
    let { arrow, rows, cols } = this, { row, col } = this.snake[0]
    return (arrow === 1 && row === 0)
      || (arrow === 2 && col === cols - 1)
      || (arrow === 3 && row === rows - 1)
      || (arrow === 4 && col === 0)
  }
}
