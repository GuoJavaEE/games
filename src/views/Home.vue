<template>
  <ul>
    <li v-for="(v, k) in games" :key="k">
      <router-link :to="{ name: 'game', params: { name: k } }">{{ v.name }}</router-link>
    </li>
  </ul>
</template>

<script>
import { h } from 'vue'
import games from '../components/games'
export default {
  name: 'Home',
  data () {
    return { games }
  }
}
</script>

<style scoped>

</style>
