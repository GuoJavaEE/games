<template>
  <div class="container">
    <canvas ref="canvas"></canvas>
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
    this.game = new Game(this.$refs.canvas as HTMLCanvasElement, {
      onDone: score => {
        alert(`没有可消除的方块了，你的得分: ${score}`)
        this.game?.start()
      }
    })
    this.game.start()
  },
  unmounted () {
    this.game?.removeListeners()
    this.game = null
  }
}
</script>

<style scoped>
.container {
  height: 100vh;
}
canvas {
  width: 100%;
  border: 3px solid #fff;
  background-color: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 20%), 0 1px 1px rgb(0 0 0 / 14%), 0 2px 1px -1px rgb(0 0 0 / 12%);
}
</style>
