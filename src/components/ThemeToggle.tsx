import { useState, useEffect } from 'react';
import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import {
  getPreferredTheme,
  toggleTheme,
  onSystemThemeChange,
  type ThemeName,
} from '../utils/theme';
import { DURATION, EASE_OUT } from '../utils/animation';
import { preloadFrames } from '../utils/portraitSequence';

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
  const reducedMotion = useFramerReducedMotion();

  useEffect(() => {
    setTheme(getPreferredTheme());
    return onSystemThemeChange(setTheme);
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setTheme(next);

    // Dispatch event for portrait frame sequence in HeroNarrative
    window.dispatchEvent(new CustomEvent('theme:toggle-start', { detail: { theme: next } }));

    // Preload portrait frames on first toggle (fire-and-forget)
    preloadFrames();
  };

  const isDark = theme === 'after-hours';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={labels.label}
      onClick={handleToggle}
      className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-mono text-meta transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-primary"
    >
      <span
        className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border bg-surface-tertiary transition-colors"
        aria-hidden="true"
      >
        <motion.span
          className="inline-block size-3.5 rounded-full"
          animate={{
            x: isDark ? 16 : 2,
            backgroundColor: isDark ? 'var(--color-signal-primary)' : 'var(--color-text-secondary)',
          }}
          transition={{
            duration: reducedMotion ? 0 : DURATION.fast,
            ease: EASE_OUT,
          }}
        />
      </span>
      <span className="select-none text-text-secondary">
        {isDark ? labels.afterHours : labels.buildMode}
      </span>
    </button>
  );
}
