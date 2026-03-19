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

describe('BioChapter i18n parity', () => {
  it('should have bio keys in en.json', () => {
    expect(enJson).toHaveProperty('bio');
  });

  it('should have bio keys in es.json', () => {
    expect(esJson).toHaveProperty('bio');
  });

  it('should have matching bio key structures', () => {
    const enKeys = getKeysDeep(enJson.bio).sort();
    const esKeys = getKeysDeep(esJson.bio).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('should have all required bio keys', () => {
    const requiredKeys = ['sectionTitle', 'narrative', 'highlightLabel'];
    for (const key of requiredKeys) {
      expect(enJson.bio).toHaveProperty(key);
      expect(esJson.bio).toHaveProperty(key);
    }
  });

  it('should have non-empty values for all bio keys', () => {
    const enKeys = getKeysDeep(enJson.bio);
    for (const key of enKeys) {
      const shortKey = key.split('.').pop()!;
      expect((enJson.bio as Record<string, string>)[shortKey]).toBeTruthy();
      expect((esJson.bio as Record<string, string>)[shortKey]).toBeTruthy();
    }
  });
});
