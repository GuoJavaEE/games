<template>
  <div v-if="item">
    <component :is="curView" />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent } from 'vue'
import { getGame } from '../components'
export default {
  name: 'Game',
  computed: {
    item () {
      return getGame(this.$route.params.name as string)
    },
    curView (): any {
      return this.item ? defineAsyncComponent(this.item.component) : null
    }
  }
}
</script>
