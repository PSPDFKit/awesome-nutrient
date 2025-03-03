import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sign': {
        target: 'http://localhost:6000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})