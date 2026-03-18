import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPreferredTheme, setTheme, toggleTheme, onSystemThemeChange } from '../theme';

describe('theme utility', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('getPreferredTheme', () => {
    it('returns "build" when no stored preference and light system preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });
      expect(getPreferredTheme()).toBe('build');
    });

    it('returns "after-hours" when no stored preference and dark system preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: true,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });
      expect(getPreferredTheme()).toBe('after-hours');
    });

    it('returns stored preference when available', () => {
      localStorage.setItem('theme', 'after-hours');
      expect(getPreferredTheme()).toBe('after-hours');
    });

    it('ignores invalid stored values', () => {
      localStorage.setItem('theme', 'invalid');
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });
      expect(getPreferredTheme()).toBe('build');
    });
  });

  describe('setTheme', () => {
    it('sets data-theme attribute on html element', () => {
      setTheme('after-hours');
      expect(document.documentElement.getAttribute('data-theme')).toBe('after-hours');
    });

    it('persists theme to localStorage', () => {
      setTheme('build');
      expect(localStorage.getItem('theme')).toBe('build');
    });
  });

  describe('toggleTheme', () => {
    it('toggles from build to after-hours', () => {
      document.documentElement.setAttribute('data-theme', 'build');
      const result = toggleTheme();
      expect(result).toBe('after-hours');
      expect(document.documentElement.getAttribute('data-theme')).toBe('after-hours');
    });

    it('toggles from after-hours to build', () => {
      document.documentElement.setAttribute('data-theme', 'after-hours');
      const result = toggleTheme();
      expect(result).toBe('build');
      expect(document.documentElement.getAttribute('data-theme')).toBe('build');
    });

    it('defaults to after-hours when no data-theme is set', () => {
      const result = toggleTheme();
      expect(result).toBe('after-hours');
    });
  });

  describe('onSystemThemeChange', () => {
    it('returns an unsubscribe function', () => {
      const removeEventListener = vi.fn();
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener,
        })),
      });

      const unsubscribe = onSystemThemeChange(() => {});
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
      expect(removeEventListener).toHaveBeenCalled();
    });

    it('does not update when user has stored preference', () => {
      const addEventListener = vi.fn();
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          addEventListener,
          removeEventListener: vi.fn(),
        })),
      });

      localStorage.setItem('theme', 'build');
      const callback = vi.fn();
      onSystemThemeChange(callback);

      // Simulate system change
      const handler = addEventListener.mock.calls[0]?.[1];
      if (handler) {
        handler({ matches: true } as MediaQueryListEvent);
      }

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
