import { describe, it, expect } from 'vitest';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';

describe('Hero i18n keys', () => {
  const expectedKeys = ['subtitleTag', 'headline', 'description', 'ctaPrimary', 'ctaSecondary'];

  it('should have all required hero keys in en.json', () => {
    for (const key of expectedKeys) {
      expect(enJson.hero).toHaveProperty(key);
      expect(enJson.hero[key as keyof typeof enJson.hero]).toBeTruthy();
    }
  });

  it('should have all required hero keys in es.json', () => {
    for (const key of expectedKeys) {
      expect(esJson.hero).toHaveProperty(key);
      expect(esJson.hero[key as keyof typeof esJson.hero]).toBeTruthy();
    }
  });

  it('should have matching key structures in en.json and es.json', () => {
    expect(Object.keys(enJson.hero).sort()).toEqual(Object.keys(esJson.hero).sort());
  });

  it('should not have old hero keys', () => {
    expect(enJson.hero).not.toHaveProperty('greeting');
    expect(enJson.hero).not.toHaveProperty('name');
    expect(enJson.hero).not.toHaveProperty('viewWork');
    expect(enJson.hero).not.toHaveProperty('contactMe');
    expect(esJson.hero).not.toHaveProperty('greeting');
    expect(esJson.hero).not.toHaveProperty('name');
    expect(esJson.hero).not.toHaveProperty('viewWork');
    expect(esJson.hero).not.toHaveProperty('contactMe');
  });
});
