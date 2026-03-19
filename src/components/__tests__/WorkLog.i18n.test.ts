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

describe('WorkLog i18n parity', () => {
  it('should have workLog keys in en.json', () => {
    expect(enJson).toHaveProperty('workLog');
  });

  it('should have workLog keys in es.json', () => {
    expect(esJson).toHaveProperty('workLog');
  });

  it('should have matching workLog key structures', () => {
    const enKeys = getKeysDeep(enJson.workLog).sort();
    const esKeys = getKeysDeep(esJson.workLog).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('should have all required top-level workLog keys', () => {
    const requiredKeys = [
      'sectionTitle',
      'subtitle',
      'featuredLabel',
      'viewCaseStudy',
      'role',
      'duration',
      'techStack',
      'milestone',
    ];
    for (const key of requiredKeys) {
      expect(enJson.workLog).toHaveProperty(key);
      expect(esJson.workLog).toHaveProperty(key);
    }
  });

  it('should have non-empty string values for all workLog keys in en.json', () => {
    const values = Object.values(enJson.workLog);
    for (const value of values) {
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it('should have non-empty string values for all workLog keys in es.json', () => {
    const values = Object.values(esJson.workLog);
    for (const value of values) {
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });
});
