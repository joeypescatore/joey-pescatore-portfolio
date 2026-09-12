import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // local API testing: run `vercel dev --listen 3001` separately (it only
    // needs to serve /api — its own frontend-serving is unused and can be
    // ignored) and this dev server proxies /api calls to it, so the site
    // itself keeps running on the normal 5173 you already use
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
