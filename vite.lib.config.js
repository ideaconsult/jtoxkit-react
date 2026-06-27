import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Library build: emits an ESM bundle + a single style.css under dist/.
// React is a peer (provided by the host); @tanstack/react-table and dompurify are
// bundled so consumers only need React — same self-contained model as qubounds-viewer.
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
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: { assetFileNames: 'style.css' }
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false
  }
})
