import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@wailsjs': path.resolve(__dirname, './wailsjs'),
      '@trueblocks/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@trueblocks/scaffold': path.resolve(__dirname, '../../packages/scaffold/src'),
    }
  }
})
