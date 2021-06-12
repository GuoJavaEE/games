import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  css: {
    preprocessorOptions: {
      less: {
        additionalData: fs.readFileSync('./src/assets/theme.less').toString()
      }
    }
  }
})
