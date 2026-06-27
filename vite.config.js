import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev / standalone build. The library build lives in vite.lib.config.js.
export default defineConfig({
  plugins: [react()],
  base: '/jtoxkit/',
  server: {
    port: 5175,
    proxy: {
      // Dev convenience: route /ambit/* to a live AMBIT host to sidestep CORS while
      // developing. AMBIT is CORS-enabled, so this is optional — point apiBase at the
      // full AMBIT URL directly if you prefer. Override the target via VITE_AMBIT_PROXY.
      '/ambit': {
        target: process.env.VITE_AMBIT_PROXY || 'https://apps.ideaconsult.net',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/ambit/, '')
      }
    }
  }
})
