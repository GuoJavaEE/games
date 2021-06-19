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
}
</style>
