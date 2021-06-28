import { AsyncComponentLoader } from 'vue'

interface GameItemValue {
  name: string,
  component: AsyncComponentLoader
}

const games: { [key: string]: GameItemValue } = {
  2048: {
    name: '2048',
    component: () => import('./2048/Index.vue')
  },
  llk: {
    name: '经典连连看',
    component: () => import('./llk/Index.vue')
  },
  maze: {
    name: '走出迷宫',
    component: () => import('./maze/Index.vue')
  },
  mine: {
    name: '经典扫雷',
    component: () => import('./mine/Index.vue')
  },
  pintu: {
    name: '经典拼图',
    component: () => import('./pintu/Index.vue')
  },
  snake: {
    name: '经典贪吃蛇',
    component: () => import('./snake/Index.vue')
  },
  sudoku: {
    name: '数独',
    component: () => import('./sudoku/Index.vue')
  },
  wzq: {
    name: '五子棋之人机大战',
    component: () => import('./wzq/Index.vue')
  },
  xxk: {
    name: '消消看',
    component: () => import('./xxk/Index.vue')
  }
}

export default games

export const getGame = (name: string) => games[name]
