import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// De 'base' moet exact overeenkomen met je GitHub Pages submap
export default defineConfig({
  site: 'https://toneeldevalk.be', // Pas dit aan naar je uiteindelijke domein
  integrations: [sitemap({
    filter: (page) => !page.includes('/welovedevalk4ever'),
  })],
  vite: {
    plugins: [tailwindcss()]
  }
});
