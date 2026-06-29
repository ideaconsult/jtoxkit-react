import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Library build: emits an ESM bundle + a single style.css under dist/.
// React is a peer (provided by the host); dompurify is bundled so consumers only need
// React. @observablehq/plot is also kept external (an optional peer) so the embed reuses
// the host's instance instead of duplicating ~hundreds of KB — spectrasearch already
// depends on it. Hosts that want the dose-response chart install @observablehq/plot.
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.js', import.meta.url)),
      name: 'JToxKitReact',
      formats: ['es'],
      fileName: () => 'jtoxkit-react.js'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@observablehq/plot'],
      output: { assetFileNames: 'style.css' }
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false
  }
})
