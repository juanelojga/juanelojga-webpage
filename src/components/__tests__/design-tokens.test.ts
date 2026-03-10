import { describe, it, expect } from 'vitest';
import tailwindConfig from '../../../tailwind.config.mjs';

describe('Design tokens', () => {
  const theme = tailwindConfig.theme?.extend;

  describe('colors', () => {
    it('should define primary color', () => {
      expect(theme?.colors?.primary).toBe('#137fec');
    });

    it('should define background-light color', () => {
      expect(theme?.colors?.['background-light']).toBe('#f6f7f8');
    });

    it('should define background-dark color', () => {
      expect(theme?.colors?.['background-dark']).toBe('#101922');
    });
  });

  describe('fontFamily', () => {
    it('should define display font with Inter', () => {
      expect(theme?.fontFamily?.display).toEqual(['Inter', 'sans-serif']);
    });
  });

  describe('borderRadius', () => {
    it('should define default border-radius', () => {
      expect(theme?.borderRadius?.DEFAULT).toBe('0.25rem');
    });

    it('should define lg border-radius', () => {
      expect(theme?.borderRadius?.lg).toBe('0.5rem');
    });

    it('should define xl border-radius', () => {
      expect(theme?.borderRadius?.xl).toBe('0.75rem');
    });

    it('should define full border-radius', () => {
      expect(theme?.borderRadius?.full).toBe('9999px');
    });
  });

  describe('removed old tokens', () => {
    it('should not have old animation keyframes', () => {
      expect(theme?.keyframes).toBeUndefined();
    });

    it('should not have old animation definitions', () => {
      expect(theme?.animation).toBeUndefined();
    });
  });
});
