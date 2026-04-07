import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.juanelojga.com',
  integrations: [
    sitemap(),
    partytown({
      config: { forward: ['dataLayer.push', 'gtag'] },
    }),
    react(),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  },
});
