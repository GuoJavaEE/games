<template>
  <section class="container">
    <header>迷你拼图</header>
    <div class="thumb">
      <img ref="img" src="./img/1.jpg">
    </div>
    <div class="game-wrapper">
      <canvas ref="canvas"></canvas>
    </div>
  </section>
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
    this.game = new Game(this.$refs.canvas as HTMLCanvasElement)
    this.game.start({ img: this.$refs.img as HTMLImageElement })
  },
  unmounted () {
    this.game?.removeListeners()
  }
}
</script>

<style lang="less" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-bottom: 2px;
}
header {
  background-color: @content-color;
  padding: 10px;
  text-align: center;
  font-size: 16px;
  color: #fff;
}
.thumb {
  padding: 2px;
  img {
    width: 80px;
    height: 80px;
    display: block;
  }
}
.game-wrapper {
  flex: 1;
  height: 0;
  padding: 0 2px;
}
canvas {
  width: 100%;
}
</style>
