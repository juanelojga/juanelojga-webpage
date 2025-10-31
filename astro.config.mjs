import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import image from '@astrojs/image';

// https://astro.build/config
export default defineConfig({
  site: 'https://juanelojga.com',
  integrations: [tailwind(), sitemap(), image()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  },
});
