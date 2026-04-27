import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/toneel-de-valk/' : '/',
  vite: {
    plugins: [tailwindcss()]
  }
});
