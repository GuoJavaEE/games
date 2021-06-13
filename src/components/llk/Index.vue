<template>
  <div class="container">
    <div class="dashboard">
      <div class="title">经典连连看</div>
      <div class="btns">
        <button @click="onReStart">重新开始</button>
        <button @click="onRinse">洗 牌</button>
      </div>
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
    return { game: null }
  },
  mounted () {
    const game = new Game(this.$refs.ui as HTMLCanvasElement, {
      onDone: () => {
        alert('恭喜你，挑战成功！')
        game.start()
      },
      onFailed: () => {
        
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
  },
  methods: {
    onRinse () {
      this.game?.rinse()
    },
    onReStart () {
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
