import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/bookkeeping/', // GitHub Pages 部署路径
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})