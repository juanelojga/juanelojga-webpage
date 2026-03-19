import { useState, useEffect } from 'react';
import {
  getPreferredTheme,
  toggleTheme,
  onSystemThemeChange,
  type ThemeName,
} from '../utils/theme';

export interface ThemeToggleLabels {
  label: string;
  buildMode: string;
  afterHours: string;
}

interface Props {
  labels: ThemeToggleLabels;
}

export default function ThemeToggle({ labels }: Props) {
  const [theme, setTheme] = useState<ThemeName>('build');

  useEffect(() => {
    setTheme(getPreferredTheme());
    return onSystemThemeChange(setTheme);
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  const isDark = theme === 'after-hours';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={labels.label}
      onClick={handleToggle}
      className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-meta transition-colors hover:bg-surface-secondary"
    >
      <span
        className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border bg-surface-tertiary transition-colors"
        aria-hidden="true"
      >
        <span
          className={`inline-block size-3.5 rounded-full transition-transform ${
            isDark ? 'translate-x-4 bg-signal-primary' : 'translate-x-0.5 bg-text-secondary'
          }`}
        />
      </span>
      <span className="select-none text-text-secondary">
        {isDark ? labels.afterHours : labels.buildMode}
      </span>
    </button>
  );
}
