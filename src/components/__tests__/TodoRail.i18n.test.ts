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

describe('TODO Rail i18n parity', () => {
  it('should have todoRail keys in en.json', () => {
    expect(enJson).toHaveProperty('todoRail');
  });

  it('should have todoRail keys in es.json', () => {
    expect(esJson).toHaveProperty('todoRail');
  });

  it('should have matching todoRail key structures', () => {
    const enKeys = getKeysDeep(enJson.todoRail).sort();
    const esKeys = getKeysDeep(esJson.todoRail).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('should have all required todoRail keys', () => {
    const requiredKeys = [
      'label',
      'bootIdentity',
      'loadProfile',
      'compileStrengths',
      'unlockWorkLog',
      'openChannel',
      'statePending',
      'stateActive',
      'stateCompleted',
    ];
    for (const key of requiredKeys) {
      expect(enJson.todoRail).toHaveProperty(key);
      expect(esJson.todoRail).toHaveProperty(key);
    }
  });
});

describe('Theme toggle i18n parity', () => {
  it('should have themeToggle keys in both locales', () => {
    expect(enJson).toHaveProperty('themeToggle');
    expect(esJson).toHaveProperty('themeToggle');
  });

  it('should have matching themeToggle key structures', () => {
    const enKeys = getKeysDeep(enJson.themeToggle).sort();
    const esKeys = getKeysDeep(esJson.themeToggle).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('should have all required themeToggle keys', () => {
    const requiredKeys = ['label', 'buildMode', 'afterHours'];
    for (const key of requiredKeys) {
      expect(enJson.themeToggle).toHaveProperty(key);
      expect(esJson.themeToggle).toHaveProperty(key);
    }
  });
});

describe('Locale switcher i18n parity', () => {
  it('should have localeSwitcher keys in both locales', () => {
    expect(enJson).toHaveProperty('localeSwitcher');
    expect(esJson).toHaveProperty('localeSwitcher');
  });

  it('should have matching localeSwitcher key structures', () => {
    const enKeys = getKeysDeep(enJson.localeSwitcher).sort();
    const esKeys = getKeysDeep(esJson.localeSwitcher).sort();
    expect(enKeys).toEqual(esKeys);
  });
});
