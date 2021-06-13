<template>
  <div class="container">
    <div class="dashboard">
      <div class="title">扫雷游戏</div>
    </div>
    <div class="game-ui">
      <canvas ref="ui" />
    </div>
  </div>
</template>

<script lang="ts">
import Game from './game'
export default {
  data (): { game: Game | null } {
    return {
      game: null
    }
  },
  mounted () {
    const game = new Game(this.$refs.ui as HTMLCanvasElement, {
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
    this.game = game
  },
  unmounted () {
    if (this.game) {
      this.game.removeListeners()
      this.game = null
    }
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
.title {
  color: #fff;
  font-size: 1.5em;
}
</style>
