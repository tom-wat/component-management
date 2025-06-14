import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://component-api.wat91842.workers.dev',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  preview: {
    port: 3000,
  }
})
