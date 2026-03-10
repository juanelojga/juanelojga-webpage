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

Green-on-black hacker theme:

- Accents: `text-green-400`, `bg-green-500`, glow via `shadow-[0_0_15px_#00FF80]`
- Backgrounds: `bg-black`
- Text: `text-white`, `text-gray-300`, `text-gray-400`
- Styling priority: Tailwind utilities → arbitrary values → scoped `<style>` → imported CSS (`src/css/global.css`)

Custom animations defined in `tailwind.config.mjs`: `fade-in-left`, `fade-in-right`, `fadeInUp`.

## Deployment

Netlify config in `netlify.toml`: builds with `npm run build`, publishes `dist/`. Cache headers set 1-year immutable for `/_astro/*` and `/assets/*`. Redirect `/` → `/en/` (301, force).

## Images & Icons

- Use `Image` from `astro:assets` with explicit width/height; hero=`loading="eager"`, others=`loading="lazy"`
- Font Awesome icons via CDN (stylesheet in Layout.astro)
- Material Symbols Outlined via Google Fonts
