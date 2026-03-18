# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multilingual personal portfolio website for Juan Almeida (full-stack & AI engineer) built with Astro 5, deployed on Netlify at https://www.juanelojga.com. Currently undergoing a redesign that will introduce React for interactive elements and unit testing.

## Commands

```bash
npm install          # Install dependencies (Node 24 required, see .nvmrc)
npm run dev          # Dev server at localhost:4321
npm run build        # Production build to ./dist/
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
```

No test runner is configured yet. When adding tests, use Vitest (Astro's recommended test framework) with `@testing-library/react` for React component tests.

## Architecture

**Framework stack:** Astro 5 + Tailwind CSS 3 + TypeScript (strict mode). Currently pure Astro components with vanilla JS `<script is:inline>` for interactivity — migrating interactive elements to React (requires `@astrojs/react` integration).

**Single layout pattern:** `src/layouts/Layout.astro` wraps all pages with Navbar, `<main><slot/></main>`, Footer, plus `ViewTransitions`. Includes scroll-snap logic, SEO metadata (JSON-LD, OG tags), and Google Analytics via Partytown.

**Routing:** Root `/` redirects to `/en/`. Content lives in `src/pages/[lang]/index.astro` using `getStaticPaths()` for `en`/`es` locales.

**Desktop scroll-snap (>=1024px):** Sections use CSS scroll-snap with IntersectionObserver activation. New sections must have `class="fade-section"` and a unique `id`. Section IDs used by navbar: `home`, `about`, `projects`, `contact`.

### i18n (dual pattern)

1. **Self-contained components** (Navbar, Hero, Layout, Footer): use `useTranslations(Astro)` from `src/utils/translate.ts` with dot-notation keys like `t('navbar.about')`
2. **Prop-driven components** (About, Projects, Contact): page imports `src/i18n/${lang}.json` and passes translated strings as props

Translation files: `src/i18n/en.json` and `src/i18n/es.json` — nested JSON with identical key structures. Both must be updated together when adding/changing UI text.

### Content management

Plain JSON arrays in `src/content/` (projects, experience, core-technologies, tools-platforms) — not Astro Content Collections, no schema validation. Content is English-only and displayed as-is in both locales.

## Code Style

- **TypeScript:** extends `astro/tsconfigs/strict`, `@typescript-eslint/no-explicit-any` is OFF
- **Prettier:** single quotes, semicolons, 2-space indent, `arrowParens: "avoid"`, 100 char width, LF endings, `prettier-plugin-astro`
- **ESLint:** flat config extending eslint/typescript/astro/tailwind/prettier recommended; `tailwindcss/no-custom-classname` is OFF
- **Pre-commit:** Husky + lint-staged runs `eslint --fix` and `prettier --write` on staged files

**Component structure:** frontmatter (imports, logic) → HTML template with Tailwind → scoped `<style>` for animations → `<script is:inline>` for DOM logic

## Design Language

> Full design context is in [`.impeccable.md`](.impeccable.md). Key points below.

**Redesign concept**: Narrative TODO-rail interface — the page behaves like a personal execution board, not a brochure. A persistent TODO rail drives navigation with playful developer labels (_Boot identity_, _Compile strengths_, _Unlock work log_, _Open channel_).

**Brand personality**: Precise · Playful · High-Agency

**Theme system**: Dual-theme with named modes:

- **Build Mode** (light): chalk/concrete/pale graphite surfaces, acid green primary signal (~#00FF80)
- **After Hours** (dark): charcoal/ink/smoked teal surfaces, bright accents, sunglasses portrait variant

**Color roles**:

- Primary signal: acid green / digital lime — completion, focus, active rail states
- Secondary signal: electric cyan — hover trails, info accents
- Warm counter-accent: muted amber — warnings, timestamps
- Styling priority: Tailwind utilities → arbitrary values → scoped `<style>` → imported CSS (`src/css/global.css`)

**Typography**: JetBrains Mono (display/system cues) + Inter (editorial body copy). 5-level hierarchy from 64–88px hero display down to 13–15px meta.

**Photography**: Editorial portraits as core design material — hero pair for theme switching (4–8 frame sequence), 2–3 supporting editorial crops, 1 detail crop.

**Motion**: Task-resolution metaphor. Each chapter has a distinct reveal family. `prefers-reduced-motion: reduce` replaces all transforms with instant state + short opacity fades.

**Anti-references**: Generic dev portfolio templates, corporate SaaS landing pages, futuristic particle/neon clichés.

**Design principles**:

1. Narrative over brochure
2. Developer culture as native metaphor
3. Motion confirms progress
4. Photography carries personality
5. Machine-readable always (WCAG AA minimum)
6. Reward exploration with layered detail
7. Right rail is sacred

## Deployment

Netlify config in `netlify.toml`: builds with `npm run build`, publishes `dist/`. Cache headers set 1-year immutable for `/_astro/*` and `/assets/*`. Redirect `/` → `/en/` (301, force).

## Images & Icons

- Use `Image` from `astro:assets` with explicit width/height; hero=`loading="eager"`, others=`loading="lazy"`
- Font Awesome icons via CDN (stylesheet in Layout.astro)
- Material Symbols Outlined via Google Fonts

## Visual Verification Workflow

When asked to verify UI, always use Playwright MCP (never bash).

### App

- Dev server: `npm run dev` (port 4321)
- Key pages to check: `/en/`, `/es/`
- Root `/` redirects to `/en/`

### How to verify

Use Playwright MCP to open `localhost:4321`, navigate to the page that was just changed, and take a screenshot. Compare it to what was described and flag any visual issues.

### Screenshot conventions

- Always take full-page screenshots
- Test at desktop (1280px) and mobile (375px) widths
- Save to `.screenshots/` with descriptive names like `navbar-desktop.png`, `hero-mobile-es.png`

### What to flag

- Broken layouts or overflow issues
- Missing or misaligned elements
- Console errors during navigation
- Scroll-snap sections not aligning correctly
- i18n content missing or displaying wrong locale
