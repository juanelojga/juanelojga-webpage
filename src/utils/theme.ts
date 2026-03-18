export type ThemeName = 'build' | 'after-hours';

const STORAGE_KEY = 'theme';

/** Read the user's preferred theme from localStorage, falling back to OS preference. */
export function getPreferredTheme(): ThemeName {
  if (typeof window === 'undefined') return 'build';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'build' || stored === 'after-hours') return stored;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'after-hours' : 'build';
}

/** Apply a theme to the document and persist the choice. */
export function setTheme(theme: ThemeName): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

/** Toggle between Build Mode and After Hours. Returns the new theme name. */
export function toggleTheme(): ThemeName {
  const current = document.documentElement.getAttribute('data-theme') as ThemeName | null;
  const next: ThemeName = current === 'after-hours' ? 'build' : 'after-hours';
  setTheme(next);
  return next;
}

/** Listen for OS-level color scheme changes. Only updates if user has no stored preference. */
export function onSystemThemeChange(callback: (theme: ThemeName) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const theme: ThemeName = e.matches ? 'after-hours' : 'build';
      setTheme(theme);
      callback(theme);
    }
  };
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}
