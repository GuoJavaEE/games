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

<script lang="ts">
import Game from './game'
export default {
  mounted () {
    const game = new Game(this.$refs.ui, {
      onUpdate: (data: any) => {
        console.log(data)
      },
      onOver: () => {
        alert('很遗憾，挑战失败！')
        game.start()
      },
      onWinning: () => {
        alert('恭喜你！挑战成功')
        game.start(game.cols + 2, game.mineCount + 2)
      }
    })
    game.start()
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
  background-color: @content-color;
}
.game-ui {
  flex: 1;
  height: 0;
}
canvas {
  width: 100%;
  background-color: mix(@primary-color, #fff, 20%);
}
</style>
