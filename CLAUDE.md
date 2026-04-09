# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multilingual personal portfolio website for Juan Almeida (full-stack & AI engineer) built with Astro 5, deployed on Netlify at https://www.juanelojga.com. Currently undergoing a redesign that will introduce React for interactive elements and unit testing.

## Commands

```bash
pnpm install         # Install dependencies (Node 24 required, see .nvmrc)
pnpm dev             # Dev server at localhost:4321
pnpm build           # Production build to ./dist/
pnpm preview         # Preview production build
pnpm lint            # ESLint check
pnpm lint:fix        # ESLint auto-fix
pnpm format          # Prettier format
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

Netlify config in `netlify.toml`: builds with `pnpm run build`, publishes `dist/`. Cache headers set 1-year immutable for `/_astro/*` and `/assets/*`. Redirect `/` → `/en/` (301, force).

## Images & Icons

- Use `Image` from `astro:assets` with explicit width/height; hero=`loading="eager"`, others=`loading="lazy"`
- Font Awesome icons via CDN (stylesheet in Layout.astro)
- Material Symbols Outlined via Google Fonts

## Playwright MCP (Visual Verification & Browser Automation)

The project uses `@playwright/mcp` to give Claude Code direct browser control for visual verification, debugging, and development feedback loops. The MCP server is configured in `.claude/settings.json` and runs headless Chromium.

### When to use Playwright MCP

- **After any UI change**: verify the result visually before considering the task done
- **Debugging layout/style issues**: inspect the live page instead of guessing from code
- **Checking i18n**: navigate both `/en/` and `/es/` to confirm translations render correctly
- **Validating responsive design**: resize the browser to test breakpoints
- **Checking console errors**: use `browser_console_messages` after navigation to catch runtime issues

### Verification workflow

1. Ensure dev server is running (`pnpm dev` on port 4321)
2. `browser_navigate` to `http://localhost:4321/en/` (or `/es/`)
3. `browser_snapshot` to get the accessibility tree / DOM state
4. `browser_take_screenshot` for visual verification
5. `browser_resize` to 375px width, then screenshot again for mobile
6. `browser_console_messages` to check for errors
7. Compare against expected behavior and flag issues

### Available Playwright MCP tools

| Tool                       | Purpose                                   |
| :------------------------- | :---------------------------------------- |
| `browser_navigate`         | Go to a URL                               |
| `browser_take_screenshot`  | Capture current viewport                  |
| `browser_snapshot`         | Get page accessibility tree               |
| `browser_resize`           | Change viewport dimensions                |
| `browser_click`            | Click elements (use accessible selectors) |
| `browser_fill_form`        | Fill input fields                         |
| `browser_hover`            | Hover over elements                       |
| `browser_press_key`        | Simulate keyboard input                   |
| `browser_console_messages` | Read browser console output               |
| `browser_network_requests` | Inspect network activity                  |
| `browser_evaluate`         | Run JS in page context                    |
| `browser_tabs`             | List open tabs                            |
| `browser_close`            | Close the browser                         |

### Screenshot conventions

- Always take full-page screenshots at both desktop (1280px) and mobile (375px) widths
- Save to `.screenshots/` with descriptive names like `navbar-desktop.png`, `hero-mobile-es.png`

### What to flag

- Broken layouts or overflow issues
- Missing or misaligned elements
- Console errors during navigation
- Scroll-snap sections not aligning correctly
- i18n content missing or displaying wrong locale
- Network errors or failed resource loads
