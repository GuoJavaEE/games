<template>
  <div class="container">
    <div class="dashboard">
      <h2 class="title">仪表盘</h2>
    </div>
    <div class="game-ui">
      <canvas ref="ui" />
    </div>
  </div>
</template>

<script>
import Game from './game'
export default {
  data () {
    return {
      grid: { rows: 9, cols: 9, count: 10 }
    }
  },
  mounted () {
    const game = new Game(this.$refs.ui)
    console.log(game.genBlocks())
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.dashboard {
  padding: 10px;
  background-color: @title-color;
}
.game-ui {
  flex: 1;
  height: 0;
}
canvas {
  width: 100%;
  height: 100%;
}
</style>
