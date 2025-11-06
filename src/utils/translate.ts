import type { AstroGlobal } from 'astro';
import en from '../i18n/en.json';
import es from '../i18n/es.json';

const translations = {
  en,
  es,
};

export function useTranslations(Astro: AstroGlobal) {
  const locale = Astro.currentLocale === 'es' ? 'es' : 'en';

  return function t(key: string): string {
    const keys = key.split('.');
    let current: any = translations[locale];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return key;
      }
    }

    return current;
  };
}
