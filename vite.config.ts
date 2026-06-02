import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base = '/<Repo-Name>/' für GitHub Pages. Bei lokalem Dev egal.
// Passe dies an den Namen deines GitHub-Repos an.
export default defineConfig({
  base: '/Studi-App/',
  plugins: [react()],
})
