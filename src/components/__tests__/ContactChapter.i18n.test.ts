import { describe, it, expect } from 'vitest';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';

function getKeysDeep(obj: Record<string, any>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return getKeysDeep(value, fullKey);
    }
    return [fullKey];
  });
}

describe('ContactChapter i18n parity', () => {
  it('should have contact keys in en.json', () => {
    expect(enJson).toHaveProperty('contact');
  });

  it('should have contact keys in es.json', () => {
    expect(esJson).toHaveProperty('contact');
  });

  it('should have matching contact key structures', () => {
    const enKeys = getKeysDeep(enJson.contact).sort();
    const esKeys = getKeysDeep(esJson.contact).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('should have all required contact keys', () => {
    const requiredKeys = [
      'sectionTitle',
      'headline',
      'description',
      'emailCta',
      'emailToast',
      'resumeLink',
      'socialLabel',
      'ariaEmailCopied',
    ];
    for (const key of requiredKeys) {
      expect(enJson.contact).toHaveProperty(key);
      expect(esJson.contact).toHaveProperty(key);
    }
  });

  it('should have non-empty string values for all contact keys in en.json', () => {
    const values = Object.values(enJson.contact);
    for (const value of values) {
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it('should have non-empty string values for all contact keys in es.json', () => {
    const values = Object.values(esJson.contact);
    for (const value of values) {
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });
});
