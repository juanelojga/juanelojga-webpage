import { describe, it, expect } from 'vitest';
import enJson from '../../i18n/en.json';
import esJson from '../../i18n/es.json';

describe('LeadCaptureForm i18n keys', () => {
  it('should have form key in resume section of en.json', () => {
    expect(enJson.resume).toHaveProperty('form');
  });

  it('should have form key in resume section of es.json', () => {
    expect(esJson.resume).toHaveProperty('form');
  });

  const formKeys = [
    'heading',
    'fullName',
    'fullNamePlaceholder',
    'email',
    'emailPlaceholder',
    'submit',
    'submitting',
    'successMessage',
    'errorMessage',
    'privacyNotice',
    'requiredField',
    'invalidEmail',
  ] as const;

  it('should have all required form keys in en.json', () => {
    for (const key of formKeys) {
      expect(enJson.resume.form).toHaveProperty(key);
      expect(enJson.resume.form[key]).toBeTruthy();
    }
  });

  it('should have all required form keys in es.json', () => {
    for (const key of formKeys) {
      expect(esJson.resume.form).toHaveProperty(key);
      expect(esJson.resume.form[key]).toBeTruthy();
    }
  });

  it('should have matching form key structures between en.json and es.json', () => {
    const enKeys = Object.keys(enJson.resume.form).sort();
    const esKeys = Object.keys(esJson.resume.form).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('should have non-empty string values for all form keys', () => {
    for (const key of formKeys) {
      expect(typeof enJson.resume.form[key]).toBe('string');
      expect(typeof esJson.resume.form[key]).toBe('string');
      expect(enJson.resume.form[key].length).toBeGreaterThan(0);
      expect(esJson.resume.form[key].length).toBeGreaterThan(0);
    }
  });
});
