import { describe, it, expect } from 'vitest';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';

describe('Navbar i18n keys', () => {
  const expectedKeys = ['projects', 'experience', 'skills', 'vision', 'resume'];

  it('should have all required navbar keys in en.json', () => {
    for (const key of expectedKeys) {
      expect(enJson.navbar).toHaveProperty(key);
      expect(enJson.navbar[key as keyof typeof enJson.navbar]).toBeTruthy();
    }
  });

  it('should have all required navbar keys in es.json', () => {
    for (const key of expectedKeys) {
      expect(esJson.navbar).toHaveProperty(key);
      expect(esJson.navbar[key as keyof typeof esJson.navbar]).toBeTruthy();
    }
  });

  it('should have matching key structures in en.json and es.json', () => {
    expect(Object.keys(enJson.navbar).sort()).toEqual(Object.keys(esJson.navbar).sort());
  });

  it('should not have removed old keys (about, contact)', () => {
    expect(enJson.navbar).not.toHaveProperty('about');
    expect(enJson.navbar).not.toHaveProperty('contact');
    expect(esJson.navbar).not.toHaveProperty('about');
    expect(esJson.navbar).not.toHaveProperty('contact');
  });
});
