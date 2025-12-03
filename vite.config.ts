import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 根据环境变量决定 base path
  // 优先级：VITE_BASE_PATH > VERCEL/NETLIFY 检测 > 默认 GitHub Pages
  base: process.env.VITE_BASE_PATH || 
        (process.env.VERCEL || process.env.NETLIFY ? '/' : '/bookkeeping/'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})