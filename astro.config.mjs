// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://darsissau.github.io",
  base: "/toneel-de-valk/", // naam van je repo
  vite: {
    plugins: [tailwindcss()],
  },
});
