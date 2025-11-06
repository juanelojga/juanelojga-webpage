import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.juanelojga.com',
  integrations: [
    tailwind(), 
    sitemap(), 
    partytown({
      config: { forward: ['dataLayer.push', 'gtag'] }
    })
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  },
});
