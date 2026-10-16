import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Chemins relatifs : le site est servi sous /portfolio/main-site/ sur GitHub Pages.
  base: './',
  // Les polices et images sont partagées avec link-tree dans ../assets.
  server: { fs: { allow: ['..'] } },
});
