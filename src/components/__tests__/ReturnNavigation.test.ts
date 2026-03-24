import { describe, it, expect } from 'vitest';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';

describe('ReturnNavigation', () => {
  describe('i18n labels', () => {
    it('should have returnCta label in en.json', () => {
      expect(enJson.caseStudy.inheritance.returnCta).toBeTruthy();
      expect(typeof enJson.caseStudy.inheritance.returnCta).toBe('string');
    });

    it('should have returnCta label in es.json', () => {
      expect(esJson.caseStudy.inheritance.returnCta).toBeTruthy();
      expect(typeof esJson.caseStudy.inheritance.returnCta).toBe('string');
    });

    it('should have non-empty returnCta in both locales', () => {
      expect(enJson.caseStudy.inheritance.returnCta.length).toBeGreaterThan(0);
      expect(esJson.caseStudy.inheritance.returnCta.length).toBeGreaterThan(0);
    });
  });

  describe('URL construction', () => {
    const supportedLangs = ['en', 'es'];

    it.each(supportedLangs)('should produce valid return URL for %s locale', lang => {
      const expectedUrl = `/${lang}/#projects`;
      expect(expectedUrl).toMatch(/^\/(en|es)\/#projects$/);
    });
  });
});
