import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// Served from the root of https://blob-fidget.jymer1102.com, so base is '/'.
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
