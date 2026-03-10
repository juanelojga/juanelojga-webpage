import { describe, it, expect } from 'vitest';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';

describe('Resume i18n keys', () => {
  it('should have resume key in en.json', () => {
    expect(enJson).toHaveProperty('resume');
  });

  it('should have resume key in es.json', () => {
    expect(esJson).toHaveProperty('resume');
  });

  const subKeys = ['pageTitle', 'subtitle', 'breadcrumb', 'sections', 'seo'] as const;

  it('should have all required sub-keys in en.json', () => {
    for (const key of subKeys) {
      expect(enJson.resume).toHaveProperty(key);
      expect(enJson.resume[key]).toBeTruthy();
    }
  });

  it('should have all required sub-keys in es.json', () => {
    for (const key of subKeys) {
      expect(esJson.resume).toHaveProperty(key);
      expect(esJson.resume[key]).toBeTruthy();
    }
  });

  it('should have matching key structures between en.json and es.json', () => {
    expect(Object.keys(enJson.resume).sort()).toEqual(Object.keys(esJson.resume).sort());

    for (const key of ['breadcrumb', 'sections', 'seo'] as const) {
      const enKeys = Object.keys(enJson.resume[key]).sort();
      const esKeys = Object.keys(esJson.resume[key]).sort();
      expect(enKeys).toEqual(esKeys);
    }
  });

  it('should have non-empty string values for breadcrumb keys', () => {
    for (const key of Object.keys(enJson.resume.breadcrumb)) {
      const k = key as keyof typeof enJson.resume.breadcrumb;
      expect(enJson.resume.breadcrumb[k]).toBeTruthy();
      expect(esJson.resume.breadcrumb[k]).toBeTruthy();
    }
  });

  it('should have non-empty string values for sections keys', () => {
    for (const key of Object.keys(enJson.resume.sections)) {
      const k = key as keyof typeof enJson.resume.sections;
      expect(enJson.resume.sections[k]).toBeTruthy();
      expect(esJson.resume.sections[k]).toBeTruthy();
    }
  });

  it('should have non-empty string values for seo keys', () => {
    for (const key of Object.keys(enJson.resume.seo)) {
      const k = key as keyof typeof enJson.resume.seo;
      expect(enJson.resume.seo[k]).toBeTruthy();
      expect(esJson.resume.seo[k]).toBeTruthy();
    }
  });
});
