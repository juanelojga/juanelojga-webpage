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

describe('HeroNarrative i18n parity', () => {
  it('should have heroNarrative keys in en.json', () => {
    expect(enJson).toHaveProperty('heroNarrative');
  });

  it('should have heroNarrative keys in es.json', () => {
    expect(esJson).toHaveProperty('heroNarrative');
  });

  it('should have matching heroNarrative key structures', () => {
    const enKeys = getKeysDeep(enJson.heroNarrative).sort();
    const esKeys = getKeysDeep(esJson.heroNarrative).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('should have all required heroNarrative keys', () => {
    const requiredKeys = [
      'name',
      'role',
      'headline',
      'translatorLine',
      'primaryCta',
      'secondaryCta',
    ];
    for (const key of requiredKeys) {
      expect(enJson.heroNarrative).toHaveProperty(key);
      expect(esJson.heroNarrative).toHaveProperty(key);
    }
  });

  it('should have non-empty values for all heroNarrative keys', () => {
    const enKeys = getKeysDeep(enJson.heroNarrative);
    for (const key of enKeys) {
      const shortKey = key.split('.').pop()!;
      expect((enJson.heroNarrative as Record<string, string>)[shortKey]).toBeTruthy();
      expect((esJson.heroNarrative as Record<string, string>)[shortKey]).toBeTruthy();
    }
  });
});
