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

  describe('animations', () => {
    it('should define menu-slide-down keyframes', () => {
      expect(theme?.keyframes?.['menu-slide-down']).toEqual({
        '0%': { opacity: '0', transform: 'translateY(-8px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      });
    });

    it('should define menu-slide-down animation', () => {
      expect(theme?.animation?.['menu-slide-down']).toBe('menu-slide-down 0.2s ease-out');
    });
  });
});
