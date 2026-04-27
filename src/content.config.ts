import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const voorstellingen = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/voorstellingen" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    image: z.string(),
    summary: z.string(),
    ticket_link: z.string().optional(),
  }),
});

const nieuws = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/nieuws" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    image: z.string().optional(),
  }),
});

export const collections = {
  'voorstellingen': voorstellingen,
  'nieuws': nieuws,
};
