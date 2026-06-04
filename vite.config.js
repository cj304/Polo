import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// LeadCommand — Vite config.
// The dev server proxies /api to the local Express server (Telnyx webhooks,
// Stripe invoicing, Telnyx provisioning) so the SPA and the backend share an origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
