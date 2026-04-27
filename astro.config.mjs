import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// De 'base' moet exact overeenkomen met je GitHub Pages submap
export default defineConfig({
  site: 'https://darsissau.github.io',
  base: '/toneel-de-valk/',
  vite: {
    plugins: [tailwindcss()]
  }
});
