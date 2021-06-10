<template>
  <div v-if="item">
    <component :is="item.component" />
  </div>
</template>

<script>
import games from '../components/games'
export default {
  name: 'Game',
  computed: {
    item () {
      return games[this.$route.params.name]
    }
  }
}
</script>
