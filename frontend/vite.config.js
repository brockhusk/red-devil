import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dev only. Production is static files served by Nginx, which does this same
  // /api forwarding itself. Without this, fetch('/api/...') during `npm run dev`
  // hits Vite instead of the backend and 404s. It also keeps the browser on one
  // origin, which is what makes the SameSite=Strict session cookie work locally
  // exactly as it will in production.
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // Nginx strips /api via `proxy_pass http://127.0.0.1:8000/;`. Mirror
        // that here so route paths are identical in dev and prod.
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
