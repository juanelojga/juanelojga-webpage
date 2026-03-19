import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import tailwindConfig from '../../../tailwind.config.mjs';

/**
 * Parse relative luminance from a hex color per WCAG 2.x spec.
 * Returns a value between 0 (black) and 1 (white).
 */
function hexToRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = hexToRelativeLuminance(hex1);
  const l2 = hexToRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Design tokens', () => {
  const theme = tailwindConfig.theme?.extend;

  describe('colors', () => {
    const expectedColorKeys = [
      'primary',
      'surface-primary',
      'surface-secondary',
      'surface-tertiary',
      'signal-primary',
      'signal-secondary',
      'signal-warm',
      'text-primary',
      'text-secondary',
      'text-inverse',
      'border',
      'status-success',
      'status-success-muted',
      'status-error',
      'status-error-muted',
    ];

    it('should define all semantic color tokens', () => {
      for (const key of expectedColorKeys) {
        expect(theme?.colors).toHaveProperty(key);
      }
    });

    it('should reference CSS custom properties for theme switching', () => {
      expect(theme?.colors?.['surface-primary']).toBe('var(--color-surface-primary)');
      expect(theme?.colors?.['signal-primary']).toBe('var(--color-signal-primary)');
      expect(theme?.colors?.['text-primary']).toBe('var(--color-text-primary)');
    });

    it('should alias primary to signal-primary for backwards compatibility', () => {
      expect(theme?.colors?.primary).toBe('var(--color-signal-primary)');
    });
  });

  describe('fontFamily', () => {
    it('should define display font with Inter', () => {
      expect(theme?.fontFamily?.display).toEqual(['Inter', 'sans-serif']);
    });

    it('should define mono font with JetBrains Mono', () => {
      expect(theme?.fontFamily?.mono).toEqual(['JetBrains Mono', 'monospace']);
    });
  });

  describe('fontSize (typography scale)', () => {
    const expectedSizes = ['hero', 'section', 'label', 'body', 'meta'];

    it('should define all 5 typography scale levels', () => {
      for (const size of expectedSizes) {
        expect(theme?.fontSize).toHaveProperty(size);
      }
    });

    it('should use clamp() for responsive sizing', () => {
      for (const size of expectedSizes) {
        const value = theme?.fontSize?.[size];
        expect(Array.isArray(value)).toBe(true);
        expect(value[0]).toMatch(/^clamp\(/);
      }
    });

    it('hero should include tight line-height', () => {
      const [, options] = theme?.fontSize?.hero ?? [];
      expect(parseFloat(options?.lineHeight)).toBeLessThanOrEqual(1.1);
    });

    it('body should include relaxed line-height', () => {
      const [, options] = theme?.fontSize?.body ?? [];
      expect(parseFloat(options?.lineHeight)).toBeGreaterThanOrEqual(1.5);
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

describe('CSS theme variables', () => {
  const cssPath = path.resolve(__dirname, '../../css/global.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  it('should define Build Mode theme', () => {
    expect(css).toContain("[data-theme='build']");
  });

  it('should define After Hours theme', () => {
    expect(css).toContain("[data-theme='after-hours']");
  });

  const requiredVariables = [
    '--color-surface-primary',
    '--color-surface-secondary',
    '--color-surface-tertiary',
    '--color-signal-primary',
    '--color-signal-secondary',
    '--color-signal-warm',
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-inverse',
    '--color-border',
    '--color-status-success',
    '--color-status-success-muted',
    '--color-status-error',
    '--color-status-error-muted',
  ];

  it('should define all required CSS variables in Build Mode', () => {
    for (const v of requiredVariables) {
      expect(css).toContain(v);
    }
  });

  it('should include prefers-color-scheme dark fallback', () => {
    expect(css).toContain('prefers-color-scheme: dark');
  });

  it('should include prefers-reduced-motion rule', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
});

describe('WCAG AA contrast ratios', () => {
  // Build Mode: text-primary #1A1A1A on surface-primary #F5F5F0
  it('Build Mode: text on background meets 4.5:1', () => {
    const ratio = contrastRatio('#1A1A1A', '#F5F5F0');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  // After Hours: text-primary #F0F0EB on surface-primary #1A1A1A
  it('After Hours: text on background meets 4.5:1', () => {
    const ratio = contrastRatio('#F0F0EB', '#1A1A1A');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  // Build Mode: signal-primary (accessible) on surface-primary
  it('Build Mode: signal-primary on background meets 3:1 (large text / UI)', () => {
    const ratio = contrastRatio('#008F47', '#F5F5F0');
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  // After Hours: signal-primary on surface-primary
  it('After Hours: signal-primary on background meets 3:1 (large text / UI)', () => {
    const ratio = contrastRatio('#00FF80', '#1A1A1A');
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  // Build Mode: text-secondary on surface-primary
  it('Build Mode: text-secondary on background meets 4.5:1', () => {
    const ratio = contrastRatio('#636B78', '#F5F5F0');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  // After Hours: text-secondary on surface-primary
  it('After Hours: text-secondary on background meets 4.5:1', () => {
    const ratio = contrastRatio('#9CA3AF', '#1A1A1A');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
