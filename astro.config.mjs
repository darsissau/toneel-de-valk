import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Forceer het base pad voor GitHub Pages
export default defineConfig({
  site: 'https://darsissau.github.io',
  base: '/toneel-de-valk/',
  vite: {
    plugins: [tailwindcss()]
  }
});
