import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5191, strictPort: true },
  preview: { port: 5191, strictPort: true },
  // appli locale : le contenu (quiz, cours…) est volontairement embarqué
  build: { chunkSizeWarningLimit: 1500 },
})
