<template>
  <section class="container">
    <header>迷你拼图</header>
    <div class="tools">
      <img ref="img" src="./img/1.jpg">
      <span class="spring"></span>
      <div class="btns">
        <button @click="onStart">开始新游戏</button>
      </div>
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
    this.game = new Game(this.$refs.canvas as HTMLCanvasElement, {
      onDone: () => {
        alert('恭喜你！挑战成功！')
        this.game?.start({ rows: 4, cols: 4 })
      }
    })
    this.game.start({ img: this.$refs.img as HTMLImageElement })
  },
  unmounted () {
    this.game?.removeListeners()
  },
  methods: {
    onStart () {
      this.game?.start()
    }
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
.tools {
  padding: 2px;
  display: flex;
  align-items: center;
  padding-right: 10px;
  img {
    width: 80px;
    height: 80px;
  }
  .spring {
    flex: 1;
  }
}
.game-wrapper {
  flex: 1;
  height: 0;
  padding: 0 2px;
}
canvas {
  width: 100%;
  background-color: #fff;
}
.btns {
  button {
    background-color: @primary-color;
    color: #fff;
    border: none;
    padding: 6px 12px;
    margin-left: 10px;
    cursor: pointer;
    &:hover {
      background-color: mix(#fff, @primary-color, 10%);
    }
  }
}
</style>
