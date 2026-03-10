import { describe, it, expect } from 'vitest';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';

describe('Contact i18n keys', () => {
  const expectedKeys = ['title', 'subtitle', 'copyEmailAria'];

  it('should have all required contact keys in en.json', () => {
    for (const key of expectedKeys) {
      expect(enJson.contact).toHaveProperty(key);
      expect(enJson.contact[key as keyof typeof enJson.contact]).toBeTruthy();
    }
  });

  it('should have all required contact keys in es.json', () => {
    for (const key of expectedKeys) {
      expect(esJson.contact).toHaveProperty(key);
      expect(esJson.contact[key as keyof typeof esJson.contact]).toBeTruthy();
    }
  });

  it('should have matching key structures in en.json and es.json', () => {
    expect(Object.keys(enJson.contact).sort()).toEqual(Object.keys(esJson.contact).sort());
  });
});
