import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
      global: 'globalThis',
  },
  server: {
      port: 3000,
  },
  resolve: {
      alias: {
          './runtimeConfig': './runtimeConfig.browser',
      },
  },
  optimizeDeps: {
    include: ['buffer'],
    exclude: ['buffer/global.js'], 
    entries: {
        'buffer': 'buffer/globalThis.js',
    },
    }
});