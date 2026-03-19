/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Legacy alias — keeps existing `text-primary`, `bg-primary` working
        // across resume, case study, and form components during migration.
        primary: 'var(--color-signal-primary)',

        // Semantic surface colors (theme-switched via CSS custom properties)
        'surface-primary': 'var(--color-surface-primary)',
        'surface-secondary': 'var(--color-surface-secondary)',
        'surface-tertiary': 'var(--color-surface-tertiary)',

        // Signal colors
        'signal-primary': 'var(--color-signal-primary)',
        'signal-secondary': 'var(--color-signal-secondary)',
        'signal-warm': 'var(--color-signal-warm)',

        // Semantic text colors
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-inverse': 'var(--color-text-inverse)',

        // Border
        border: 'var(--color-border)',

        // Status colors (form feedback)
        'status-success': 'var(--color-status-success)',
        'status-success-muted': 'var(--color-status-success-muted)',
        'status-error': 'var(--color-status-error)',
        'status-error-muted': 'var(--color-status-error-muted)',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Level 0: Hero display (64–88px desktop, 32–40px mobile)
        hero: [
          'clamp(2rem, 5vw + 1rem, 5.5rem)',
          { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        // Level 1: Section titles (36–48px desktop, 26–30px mobile)
        section: [
          'clamp(1.625rem, 2.5vw + 1rem, 3rem)',
          { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '600' },
        ],
        // Level 2: Support labels, rail states (14–18px)
        label: [
          'clamp(0.875rem, 0.5vw + 0.75rem, 1.125rem)',
          { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' },
        ],
        // Body: Descriptive copy (18–20px desktop, 16–18px mobile)
        body: [
          'clamp(1rem, 0.25vw + 0.875rem, 1.25rem)',
          { lineHeight: '1.65', fontWeight: '400' },
        ],
        // Meta: Timestamps, tags, state labels (13–15px desktop, 12–14px mobile)
        meta: [
          'clamp(0.75rem, 0.15vw + 0.7rem, 0.9375rem)',
          { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' },
        ],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      keyframes: {
        'menu-slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'menu-slide-down': 'menu-slide-down 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
