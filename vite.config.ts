import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5191, strictPort: true },
  preview: { port: 5191, strictPort: true },
  // appli locale : le contenu (quiz, cours…) est volontairement embarqué
  // le worker TypeScript (compilateur + fichiers lib) est un chunk à part, chargé à la demande
  build: { chunkSizeWarningLimit: 7000 },
  // pré-bundlé dès le démarrage : évite un rechargement de la page au premier import du worker TS
  optimizeDeps: { include: ['typescript'] },
})
