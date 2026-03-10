# Implementation Plan: Design System Migration (PRD §6.1)

**Created:** 2026-03-09
**Status:** Not Started
**PRD Reference:** Section 6.1 — Design System Requirements (DS1–DS8)
**Branch:** `feat/new-design`

## Overview

Migrate the portfolio's visual foundation from the green-on-black hacker theme to a clean, professional blue/white design system. This covers the complete color system replacement (DS1), Inter font adoption (DS2), border-radius tokens (DS3), icon system migration (DS4), shadow/glow replacement (DS5), card component system (DS6), gradient glow effect (DS7), and section spacing standardization (DS8). This plan does NOT cover component rewrites (Hero, Navbar, etc.) — only the shared design tokens, utilities, and base styles that all components will consume.

## Phases

### Phase 1: Tailwind Config — Colors, Typography, and Tokens

**Goal:** Update `tailwind.config.mjs` with all new design tokens so they're available project-wide before any component work begins.

**Status:** Not Started

#### Tasks

- [ ] **DS1 — Color system:** Add custom colors to `theme.extend.colors`:
  - `primary: '#137fec'`
  - `background-light: '#f6f7f8'`
  - `background-dark: '#101922'` (reserved, not actively used in v1)
- [ ] **DS2 — Inter font:** Add `fontFamily.sans` override to use `['Inter', ...defaultTheme.fontFamily.sans]` so Inter becomes the default sans-serif stack
- [ ] **DS3 — Border-radius tokens:** Add `borderRadius` extensions:
  - `DEFAULT: '0.25rem'`
  - `lg: '0.5rem'`
  - `xl: '0.75rem'`
  - `2xl: '1rem'` (for card component `rounded-2xl`)
  - `full: '9999px'`
- [ ] **DS5 (partial) — Shadow tokens:** Add `boxShadow` extension:
  - `'primary/20': '0 4px 14px 0 rgba(19, 127, 236, 0.20)'` (replacement for green glow)
  - `'primary/25': '0 4px 14px 0 rgba(19, 127, 236, 0.25)'` (for primary button)
- [ ] Keep existing animation keyframes (`fade-in-left`, `fade-in-right`, `fadeInUp`) — they will be reviewed in a future component-level plan
- [ ] Verify config compiles without errors: `npm run build`

#### Quality Gates

- [ ] Code review (self-review changes before moving to next phase)
- [ ] Linter passing (`npm run lint`)
- [ ] Build passing (`npm run build`)
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] Verify new Tailwind classes are generated (spot-check `bg-primary`, `text-primary`, `font-sans` in browser DevTools)

---

### Phase 2: Inter Font Loading

**Goal:** Load Inter from Google Fonts so the font is available when Tailwind's `font-sans` resolves.

**Status:** Not Started

#### Tasks

- [ ] **DS2 — Inter font loading:** Add Google Fonts `<link>` for Inter (weights 300, 400, 500, 600, 700, 800, 900) in `src/layouts/Layout.astro` `<head>`, using `display=swap` for performance:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
    rel="stylesheet"
  />
  ```
- [ ] Add `font-optical-sizing: auto` to body via global CSS or Tailwind layer for optimal Inter rendering
- [ ] Verify Inter renders on the dev server across existing pages (en/es)

#### Quality Gates

- [ ] Code review (self-review changes before moving to next phase)
- [ ] Build passing (`npm run build`)
- [ ] Manual testing: verify Inter font loads in browser (DevTools → Computed → font-family shows "Inter")
- [ ] Manual testing: verify no FOUT (flash of unstyled text) — `display=swap` is acceptable

---

### Phase 3: Global CSS — Remove Dark Theme Artifacts

**Goal:** Clean up `global.css` and Layout base classes, removing green-on-black defaults and establishing the new light-mode foundation.

**Status:** Not Started

#### Tasks

- [ ] **DS1 — Background migration:** Change `<body>` class in `Layout.astro` from `bg-black text-white` to `bg-background-light text-slate-900`
- [ ] **DS4 (partial) — Remove Font Awesome CDN:** Remove the Font Awesome `<link>` from `Layout.astro` `<head>` (Material Symbols is already loaded and will be the sole icon system)
- [ ] **DS5 — Remove scroll-snap CSS:** Remove the desktop scroll-snap rules from `global.css` (per PRD NV4/NV5, scroll-snap is removed entirely). Keep the file but clear the scroll-snap-related blocks:
  - Remove `@media (min-width: 1024px)` scroll-snap rules for `html` and `section`
  - Remove `.active-section` class
  - Remove `.footer-transition` class
  - Remove section opacity/scale/pointer-events rules
- [ ] **DS5 — Remove navbar.css:** Delete `src/css/navbar.css` if it only contains scroll-snap-related mobile menu styles, or clean out scroll-snap-dependent rules
- [ ] **DS8 — Section spacing base:** Add a Tailwind `@layer components` rule in `global.css` for section spacing utility (optional — can also be applied inline per component):
  ```css
  @layer components {
    .section-spacing {
      @apply py-20 px-6 md:px-20 lg:px-40;
    }
  }
  ```
- [ ] Remove IntersectionObserver scroll-snap script from `Layout.astro` `<script is:inline>` block (per PRD NV5)
- [ ] Verify no remaining references to `active-section` class or scroll-snap behavior in any component

#### Quality Gates

- [ ] Code review (self-review changes before moving to next phase)
- [ ] Linter passing (`npm run lint`)
- [ ] Build passing (`npm run build`)
- [ ] Manual testing: site loads with light background, dark text, no scroll-snap on desktop
- [ ] Manual testing: no console errors or missing font icons that break layout
- [ ] Grep for `bg-black` in Layout.astro — should be gone
- [ ] Grep for `scroll-snap` in codebase — should only be in plan/docs, not in CSS/components

---

### Phase 4: Component-Level Color & Shadow Migration

**Goal:** Replace all green accent colors and glow shadows across every component file with the new blue primary system. This is a mechanical find-and-replace phase.

**Status:** Not Started

#### Tasks

**Color replacements (DS1) — apply across all `.astro` component files:**

- [ ] Replace `text-green-400` → `text-primary` (primary accent text)
- [ ] Replace `text-green-300` → `text-primary` (hover accent text)
- [ ] Replace `bg-green-500` → `bg-primary` (buttons, fills)
- [ ] Replace `border-green-500` → `border-primary` (button borders)
- [ ] Replace `border-green-800` → `border-slate-200` (card/section borders)
- [ ] Replace `border-green-900` → `border-slate-200` (nav/footer borders)
- [ ] Replace `bg-green-900/10` → `bg-primary/10` (light background overlays)
- [ ] Replace `bg-green-900/20` → `bg-primary/20` (hover backgrounds)
- [ ] Replace `bg-green-800/10` → `bg-primary/10` (hover lighter)
- [ ] Replace `border-green-500/30` → `border-slate-200` (subtle dividers)
- [ ] Replace `border-green-400` → `border-primary` (active indicators)
- [ ] Replace `bg-black` in components → `bg-white` or `bg-background-light` (context-dependent)
- [ ] Replace `text-gray-300` → `text-slate-600` (body text)
- [ ] Replace `text-gray-400` → `text-slate-400` (metadata text)
- [ ] Replace gradient dividers: `via-green-500` → `via-primary`

**Shadow/glow replacements (DS5) — remove all green glow effects:**

- [ ] Hero.astro: Remove `drop-shadow-[0_0_20px_#00FF80]` from name text
- [ ] Hero.astro: Replace `shadow-[0_0_15px_#00FF80]` on CTA → `shadow-lg shadow-primary/25`
- [ ] Hero.astro: Remove `shadow-[0_0_20px_#00FF80]` and `shadow-[0_0_40px_#00FF80]` from hero image
- [ ] Contact.astro: Remove `drop-shadow-[0_0_25px_#00FF80]` from title
- [ ] Contact.astro: Remove `drop-shadow-[0_0_6px_#00FF80]` from social icons
- [ ] About.astro: Remove `drop-shadow-[0_0_16px_#00FF80]` from title
- [ ] Navbar.astro: Remove `shadow-[0_0_10px_#00FF80]` from logo
- [ ] About.astro: Replace `shadow-[0_0_6px_#00FF80]` on timeline dots → remove or use `shadow-primary/20`
- [ ] Projects.astro: Replace `hover:shadow-[0_0_15px_2px_rgba(13,242,89,0.5)]` → `hover:shadow-2xl`

**Font Awesome icon replacements (DS4) — replace remaining FA icons with Material Symbols:**

- [ ] Audit all components for `<i class="fa-*">` or `<i class="fas ">` usage
- [ ] Replace each Font Awesome icon with equivalent Material Symbols `<span class="material-symbols-outlined">icon_name</span>`
- [ ] Verify no remaining Font Awesome class references in codebase

#### Quality Gates

- [ ] Code review (self-review all changes — this is a large diff)
- [ ] Linter passing (`npm run lint`)
- [ ] Build passing (`npm run build`)
- [ ] Grep for `green-` in `src/components/` — should return zero results
- [ ] Grep for `#00FF80` in `src/` — should return zero results
- [ ] Grep for `fa-` in `src/` — should return zero results (Font Awesome removed)
- [ ] Manual testing: visually verify every section (Hero, About, Projects, Contact, Navbar, Footer) renders with blue accents on light background
- [ ] Manual testing: check both `/en/` and `/es/` locales

---

### Phase 5: Card Component System & Gradient Glow

**Goal:** Establish the reusable card patterns and hero gradient glow effect defined in the PRD design tokens.

**Status:** Not Started

#### Tasks

**DS6 — Card component system (add to `global.css` `@layer components`):**

- [ ] Define `.card` base class:
  ```css
  .card {
    @apply bg-white rounded-2xl border border-slate-200
           hover:shadow-2xl hover:-translate-y-1 transition-all duration-300;
  }
  ```
- [ ] Define `.card-philosophy` variant:
  ```css
  .card-philosophy {
    @apply p-8 rounded-xl border border-slate-100 bg-slate-50/50
           hover:border-primary/30 hover:shadow-xl transition-all duration-300;
  }
  ```
- [ ] Define `.btn-primary` and `.btn-secondary` component classes:
  ```css
  .btn-primary {
    @apply bg-primary text-white font-bold rounded-lg px-6 h-12
           shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200;
  }
  .btn-secondary {
    @apply bg-white border border-slate-200 text-slate-700 font-bold rounded-lg px-6 h-12
           hover:bg-slate-50 transition-all duration-200;
  }
  ```
- [ ] Define `.section-heading-underline` utility:
  ```css
  .section-heading-underline {
    @apply h-1 w-20 bg-primary rounded-full;
  }
  ```
- [ ] Define `.icon-container` utility:
  ```css
  .icon-container {
    @apply bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center;
  }
  ```
- [ ] Define `.tech-pill` utility:
  ```css
  .tech-pill {
    @apply px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded;
  }
  ```

**DS7 — Gradient glow effect (for hero image):**

- [ ] Define `.gradient-glow` utility for hero portrait:
  ```css
  .gradient-glow {
    @apply bg-gradient-to-r from-primary to-blue-400 rounded-xl blur-xl opacity-25;
  }
  ```

**DS8 — Verify section spacing:**

- [ ] Confirm `.section-spacing` from Phase 3 applies `py-20 px-6 md:px-20 lg:px-40`
- [ ] Document in a code comment that components should use this class or these exact utility values

#### Quality Gates

- [ ] Code review (self-review changes before moving to next phase)
- [ ] Linter passing (`npm run lint`)
- [ ] Build passing (`npm run build`)
- [ ] Manual testing: create a temporary test page or inspect DevTools to verify card hover effects, button styles, and gradient glow render correctly
- [ ] Verify all component classes are generated in CSS output (check DevTools or build output)

---

### Phase 6: Validation & Cleanup

**Goal:** Final verification that the design system migration is complete, consistent, and ready for component-level work (Hero, Navbar, etc. rewrites in separate plans).

**Status:** Not Started

#### Tasks

- [ ] **Full codebase audit:** Grep for any remaining old-theme artifacts:
  - `bg-black` outside of code blocks / intentional dark elements → should be zero in components
  - `text-green-` → zero
  - `bg-green-` → zero
  - `border-green-` → zero
  - `#00FF80` → zero
  - `shadow-.*00FF80` → zero
  - `fa-brands`, `fa-solid`, `fas ` → zero
  - `scroll-snap` → zero in CSS/components
  - `active-section` → zero in CSS/components
- [ ] **Font verification:** Confirm Inter loads at all required weights (300–900) and renders as `font-sans` default
- [ ] **Token verification:** Confirm all PRD Appendix A design tokens are available in Tailwind:
  - Colors: `primary`, `background-light`, `background-dark`
  - Shadows: `shadow-primary/20`, `shadow-primary/25`
  - Border-radius: `rounded`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`
  - Component classes: `.card`, `.card-philosophy`, `.btn-primary`, `.btn-secondary`, `.section-heading-underline`, `.icon-container`, `.tech-pill`, `.gradient-glow`, `.section-spacing`
- [ ] **Lighthouse baseline:** Run Lighthouse on dev build to confirm no performance regression from font loading or CSS changes
- [ ] **i18n check:** Verify both `/en/` and `/es/` render correctly with new design system
- [ ] **Format and lint:** Run `npm run format` and `npm run lint:fix` on all changed files

#### Quality Gates

- [ ] Code review (final self-review of all design system changes)
- [ ] Linter passing (`npm run lint`)
- [ ] Formatter passing (`npm run format`)
- [ ] Build passing (`npm run build`)
- [ ] Manual testing: full visual walkthrough of `/en/` and `/es/` — every section should use new color system, no green artifacts, no broken layouts
- [ ] Manual testing: responsive check at 320px, 768px, 1024px, 1440px widths

---

## Notes

### Decisions Made

- **Component classes in `global.css`**: Using `@layer components` for reusable patterns (`.card`, `.btn-primary`, etc.) rather than creating separate CSS files — keeps things centralized and Tailwind-idiomatic
- **Font loading via Google Fonts CDN**: Using hosted Inter rather than self-hosting — simpler setup, good caching via Google's CDN. Can optimize to self-hosted later if performance warrants it
- **Mechanical color replacement in Phase 4**: Doing a sweep across all components even though many will be rewritten later — ensures the design system is consistently applied and any component that isn't immediately rewritten still looks correct
- **Keeping existing animations**: `fade-in-left`, `fade-in-right`, `fadeInUp` are retained for now; the PRD mentions replacing with "smoother, more subtle" animations but that's a component-level concern
- **No dark mode**: All `dark:` prefixed classes must not be added. The PRD explicitly defers dark mode indefinitely

### Dependencies

- This plan must be completed BEFORE component-level rewrites (Hero, Navbar, Footer, etc.)
- `@astrojs/react` integration is NOT needed for this plan — it's a Phase 2 PRD dependency
- No new npm packages required — only Tailwind config changes and CSS updates

### File Change Summary

| File                            | Action                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| `tailwind.config.mjs`           | Edit — add colors, font, border-radius, shadows                                           |
| `src/layouts/Layout.astro`      | Edit — add Inter font link, change body classes, remove FA CDN, remove scroll-snap script |
| `src/css/global.css`            | Edit — remove scroll-snap rules, add component classes                                    |
| `src/css/navbar.css`            | Delete or clean                                                                           |
| `src/components/Hero.astro`     | Edit — color/shadow replacements                                                          |
| `src/components/About.astro`    | Edit — color/shadow replacements                                                          |
| `src/components/Projects.astro` | Edit — color/shadow replacements                                                          |
| `src/components/Contact.astro`  | Edit — color/shadow/icon replacements                                                     |
| `src/components/Navbar.astro`   | Edit — color/shadow replacements                                                          |
| `src/components/Footer.astro`   | Edit — color replacements                                                                 |

### Open Questions

- [ ] Should `.section-spacing` be a Tailwind component class or just documented as a convention to apply inline? (Leaning toward component class for consistency)
- [ ] Are there any other CSS files beyond `global.css` and `navbar.css` that contain theme-related styles?
