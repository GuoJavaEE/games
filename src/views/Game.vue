<template>
  <div v-if="item">
    <component :is="curView" />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import games from '../components/games'
export default {
  name: 'Game',
  computed: {
    item () {
      return games[this.$route.params.name]
    },
    curView () {
      return this.item ? defineAsyncComponent(this.item.component) : null
    }
  }
}
</script>
