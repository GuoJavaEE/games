<template>
  <div class="container">
    <div class="dashboard">
      <div class="title">经典消消看</div>
      <div class="btns">
        <button @click="onStart">新游戏</button>
      </div>
    </div>
    <div class="game-ui">
      <canvas ref="canvas" />
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
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.dashboard {
  padding: 10px;
  background-color: @content-color;
  display: flex;
  margin-bottom: 1px;
}
.game-ui {
  flex: 1;
  height: 0;
}
canvas {
  width: 100%;
  background-color: #fff;
}
.title {
  color: #fff;
  font-size: 1.5em;
  flex: 1;
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
