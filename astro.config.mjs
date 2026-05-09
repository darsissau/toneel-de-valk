import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// De 'base' moet exact overeenkomen met je GitHub Pages submap
export default defineConfig({
  site: 'https://toneeldevalk.be', // Pas dit aan naar je uiteindelijke domein
  vite: {
    plugins: [tailwindcss()]
  }
});
