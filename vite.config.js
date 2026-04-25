import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const REPO_NAME = process.env.VITE_BASE_PATH || '/football-dashboard/'

export default defineConfig({
  plugins: [react()],
  base: REPO_NAME,
  server: {
    // In dev, /fbd/* is proxied to https://api.football-data.org/v4/*
    // This bypasses the CORS block on localhost:5173 (only port 80 is whitelisted)
    proxy: {
      '/fbd': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/fbd/, ''),
        secure: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
