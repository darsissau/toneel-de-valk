import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Gebruik base: '/' zodat GitHub Pages de juiste sub-URL structuur automatisch overneemt
export default defineConfig({
  site: 'https://darsissau.github.io',
  base: '/',
  vite: {
    plugins: [tailwindcss()]
  }
});
