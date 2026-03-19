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

describe('SkillMatrix i18n parity', () => {
  it('should have skillMatrix keys in en.json', () => {
    expect(enJson).toHaveProperty('skillMatrix');
  });

  it('should have skillMatrix keys in es.json', () => {
    expect(esJson).toHaveProperty('skillMatrix');
  });

  it('should have matching skillMatrix key structures', () => {
    const enKeys = getKeysDeep(enJson.skillMatrix).sort();
    const esKeys = getKeysDeep(esJson.skillMatrix).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('should have all required top-level skillMatrix keys', () => {
    const requiredKeys = [
      'sectionTitle',
      'subtitle',
      'categories',
      'proofPoints',
      'expandLabel',
      'collapseLabel',
    ];
    for (const key of requiredKeys) {
      expect(enJson.skillMatrix).toHaveProperty(key);
      expect(esJson.skillMatrix).toHaveProperty(key);
    }
  });

  it('should have all required category keys', () => {
    const categoryKeys = ['build', 'scale', 'ai', 'ship'];
    for (const key of categoryKeys) {
      expect(enJson.skillMatrix.categories).toHaveProperty(key);
      expect(esJson.skillMatrix.categories).toHaveProperty(key);
    }
  });

  it('should have all required proofPoints keys', () => {
    const proofPointKeys = ['build', 'scale', 'ai', 'ship'];
    for (const key of proofPointKeys) {
      expect(enJson.skillMatrix.proofPoints).toHaveProperty(key);
      expect(esJson.skillMatrix.proofPoints).toHaveProperty(key);
    }
  });

  it('should have matching category and proofPoint keys', () => {
    const enCatKeys = Object.keys(enJson.skillMatrix.categories).sort();
    const enProofKeys = Object.keys(enJson.skillMatrix.proofPoints).sort();
    expect(enCatKeys).toEqual(enProofKeys);
  });

  it('should have non-empty values for all skillMatrix keys', () => {
    const enKeys = getKeysDeep(enJson.skillMatrix);
    for (const key of enKeys) {
      const parts = key.split('.');
      let enVal: any = enJson.skillMatrix;
      let esVal: any = esJson.skillMatrix;
      for (const part of parts) {
        enVal = enVal[part];
        esVal = esVal[part];
      }
      expect(enVal, `en.json skillMatrix.${key} should be non-empty`).toBeTruthy();
      expect(esVal, `es.json skillMatrix.${key} should be non-empty`).toBeTruthy();
    }
  });
});
