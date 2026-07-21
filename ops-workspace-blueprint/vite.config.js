import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built app works under any subpath
  // (e.g. GitHub Pages: /<repo>/blueprint/).
  base: './',
  plugins: [react()],
})
