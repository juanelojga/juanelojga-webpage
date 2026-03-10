import { describe, it, expect } from 'vitest';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';

describe('CaseStudy i18n keys', () => {
  it('should have caseStudy key in en.json', () => {
    expect(enJson).toHaveProperty('caseStudy');
  });

  it('should have caseStudy key in es.json', () => {
    expect(esJson).toHaveProperty('caseStudy');
  });

  const subKeys = ['breadcrumb', 'sections', 'metadata', 'hero', 'cta'] as const;

  it('should have all required sub-keys in en.json', () => {
    for (const key of subKeys) {
      expect(enJson.caseStudy).toHaveProperty(key);
      expect(enJson.caseStudy[key]).toBeTruthy();
    }
  });

  it('should have all required sub-keys in es.json', () => {
    for (const key of subKeys) {
      expect(esJson.caseStudy).toHaveProperty(key);
      expect(esJson.caseStudy[key]).toBeTruthy();
    }
  });

  it('should have matching key structures between en.json and es.json', () => {
    expect(Object.keys(enJson.caseStudy).sort()).toEqual(Object.keys(esJson.caseStudy).sort());

    for (const key of subKeys) {
      const enKeys = Object.keys(enJson.caseStudy[key]).sort();
      const esKeys = Object.keys(esJson.caseStudy[key]).sort();
      expect(enKeys).toEqual(esKeys);
    }
  });

  it('should have non-empty string values for breadcrumb keys', () => {
    for (const key of Object.keys(enJson.caseStudy.breadcrumb)) {
      const k = key as keyof typeof enJson.caseStudy.breadcrumb;
      expect(enJson.caseStudy.breadcrumb[k]).toBeTruthy();
      expect(esJson.caseStudy.breadcrumb[k]).toBeTruthy();
    }
  });

  it('should have non-empty string values for sections keys', () => {
    for (const key of Object.keys(enJson.caseStudy.sections)) {
      const k = key as keyof typeof enJson.caseStudy.sections;
      expect(enJson.caseStudy.sections[k]).toBeTruthy();
      expect(esJson.caseStudy.sections[k]).toBeTruthy();
    }
  });

  it('should have non-empty string values for metadata keys', () => {
    for (const key of Object.keys(enJson.caseStudy.metadata)) {
      const k = key as keyof typeof enJson.caseStudy.metadata;
      expect(enJson.caseStudy.metadata[k]).toBeTruthy();
      expect(esJson.caseStudy.metadata[k]).toBeTruthy();
    }
  });

  it('should have non-empty string values for hero keys', () => {
    for (const key of Object.keys(enJson.caseStudy.hero)) {
      const k = key as keyof typeof enJson.caseStudy.hero;
      expect(enJson.caseStudy.hero[k]).toBeTruthy();
      expect(esJson.caseStudy.hero[k]).toBeTruthy();
    }
  });

  it('should have non-empty string values for cta keys', () => {
    for (const key of Object.keys(enJson.caseStudy.cta)) {
      const k = key as keyof typeof enJson.caseStudy.cta;
      expect(enJson.caseStudy.cta[k]).toBeTruthy();
      expect(esJson.caseStudy.cta[k]).toBeTruthy();
    }
  });
});
