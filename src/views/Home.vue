<template>
  <div class="container">
    <ul class="game-list">
      <li class="game-item" v-for="(v, k) in games" :key="k">
        <router-link class="game-link" :to="{ name: 'game', params: { name: k } }">{{ v.name }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import games from '../components'
export default {
  data () {
    return { games }
  }
}
</script>

<style lang="less" scoped>
.container {
  padding: 10px;
}
.game-list {
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
}
.game-item:not(:last-of-type) {
  border-bottom: 1px solid @border-color;
}
.game-link {
  display: block;
  padding: 12px;
}
.game-link:hover {
  background-color: #eee;
}
</style>
