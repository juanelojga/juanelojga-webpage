import { describe, it, expect } from 'vitest';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';

describe('Footer i18n keys', () => {
  const expectedKeys = ['rights', 'linkedin', 'github', 'twitter'];

  it('should have all required footer keys in en.json', () => {
    for (const key of expectedKeys) {
      expect(enJson.footer).toHaveProperty(key);
      expect(enJson.footer[key as keyof typeof enJson.footer]).toBeTruthy();
    }
  });

  it('should have all required footer keys in es.json', () => {
    for (const key of expectedKeys) {
      expect(esJson.footer).toHaveProperty(key);
      expect(esJson.footer[key as keyof typeof esJson.footer]).toBeTruthy();
    }
  });

  it('should have matching key structures in en.json and es.json', () => {
    expect(Object.keys(enJson.footer).sort()).toEqual(Object.keys(esJson.footer).sort());
  });

  it('should not have removed old keys (home, projects, about, contact)', () => {
    expect(enJson.footer).not.toHaveProperty('home');
    expect(enJson.footer).not.toHaveProperty('projects');
    expect(enJson.footer).not.toHaveProperty('about');
    expect(enJson.footer).not.toHaveProperty('contact');
    expect(esJson.footer).not.toHaveProperty('home');
    expect(esJson.footer).not.toHaveProperty('projects');
    expect(esJson.footer).not.toHaveProperty('about');
    expect(esJson.footer).not.toHaveProperty('contact');
  });
});
