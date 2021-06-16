<template>
  <section class="container">
    <header>迷你拼图</header>
    <div class="thumb">
      <img ref="img" src="./img/1.jpg">
    </div>
    <div class="game-wrapper">
      <canvas></canvas>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  mounted () {
    
  }
}
</script>

<style lang="less" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
header {
  background-color: @content-color;
  padding: 10px;
  text-align: center;
  font-size: 16px;
  color: #fff;
}
.thumb {
  padding: 3px;
  img {
    width: 80px;
    height: 80px;
  }
}
.game-wrapper {
  flex: 1;
  height: 0;
}
canvas {
  width: 100%;
}
</style>
