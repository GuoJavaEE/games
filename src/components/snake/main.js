class Board {
  isEnd() {
    let { arrow, rows, cols } = this, { row, col } = this.snake[0]
    return (arrow === 1 && row === 0)
      || (arrow === 2 && col === cols - 1)
      || (arrow === 3 && row === rows - 1)
      || (arrow === 4 && col === 0)
  }
}
