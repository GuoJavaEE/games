<template>
  <router-view />
</template>

<style lang="less">
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

li {
  list-style: none;
}

a {
  color: @content-color;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background-color: @background-color;
}
</style>
