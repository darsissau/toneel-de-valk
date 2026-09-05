import { defineConfig } from 'astro/config';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Bepaal welke voorstellingen al gespeeld zijn en dus niet geïndexeerd mogen worden
const VORSTELLINGEN_DIR = join(process.cwd(), 'src/content/voorstellingen');
const MONTH_INDEX = {
  januari: 0, februari: 1, maart: 2, april: 3, mei: 4, juni: 5,
  juli: 6, augustus: 7, september: 8, oktober: 9, november: 10, december: 11,
};

function parseDateString(str = '') {
  const match = String(str).match(/(\d{1,2})\s+([a-zà-ÿ]+)\s+(\d{4})/i);
  if (!match) return NaN;
  const monthIndex = MONTH_INDEX[match[2].toLowerCase()];
  if (monthIndex === undefined) return NaN;
  return new Date(Number(match[3]), monthIndex, Number(match[1])).getTime();
}

function isPastProduction(raw) {
  const scheduleLines = [...raw.matchAll(/time:\s*"?([^"\n]+)"?/g)].map(m => m[1]);
  const dates = scheduleLines.map(parseDateString).filter((t) => !isNaN(t));
  if (dates.length === 0) return false;
  return Math.max(...dates) < Date.now();
}

const pastSlugs = [];
for (const file of readdirSync(VORSTELLINGEN_DIR)) {
  if (!file.endsWith('.md')) continue;
  const raw = readFileSync(join(VORSTELLINGEN_DIR, file), 'utf-8');
  if (isPastProduction(raw)) {
    pastSlugs.push('/voorstellingen/' + file.replace(/\.md$/, ''));
  }
}

export default defineConfig({
  site: 'https://toneeldevalk.be', // Pas dit aan naar je uiteindelijke domein
  integrations: [sitemap({
    filter: (page) =>
      !page.includes('/welovedevalk4ever') &&
      !page.includes('/bedankt') &&
      !page.includes('/fotos') &&
      !page.includes('/nieuws') &&
      !page.includes('/privacy') &&
      !pastSlugs.some((slug) => page.includes(slug)),
  })],
  vite: {
    plugins: [tailwindcss()]
  }
});