<template>
  <div class="container">
    <div class="dashboard">
      <div class="title">经典贪吃蛇</div>
      <div class="btns">
        <button @click="onStart">开始游戏</button>
        <button @click="onTogglePause">{{ isStop ? '继 续' : '暂 停' }}</button>
      </div>
    </div>
    <div class="game-ui">
      <canvas ref="ui" />
    </div>
  </div>
</template>

<script lang="ts">
import Game from './game'
interface Data {
  game: Game | null,
  isStop: boolean
}
export default {
  data (): Data {
    return { game: null, isStop: false }
  },
  mounted () {
    const game = new Game(this.$refs.ui as HTMLCanvasElement, {
      onOver: (count) => {
        alert(`游戏结束！你共吃掉${count}块食物，请点击[开始游戏]按钮，重新开始游戏`)
      }
    })
    game.init()
    this.game = game
  },
  unmounted () {
    if (this.game) {
      this.game.removeListeners()
      this.game = null
    }
  },
  methods: {
    onTogglePause () {
      this.isStop = !this.isStop
      if (this.isStop) {
        this.game?.pause()
      } else {
        this.game?.unpause()
      }
    },
    onStart () {
      this.game?.start()
      this.isStop = false
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
  background-color: mix(@success-color, #fff, 10%);
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
