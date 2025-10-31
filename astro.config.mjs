import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import { étapes } from './constantes';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
  }
});