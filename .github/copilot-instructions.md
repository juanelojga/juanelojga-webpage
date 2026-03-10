# Project Guidelines

## Code Style

- **Astro strict TypeScript**: extends `astro/tsconfigs/strict`, but `@typescript-eslint/no-explicit-any` is OFF
- **Prettier**: single quotes, semicolons, 2-space indent, `arrowParens: "avoid"` (`x => x` not `(x) => x`), 100 print width, LF line endings, uses `prettier-plugin-astro`
- **ESLint**: flat config (`eslint.config.js`) extending `eslint:recommended`, `@typescript-eslint/recommended`, `astro/recommended`, `tailwindcss/recommended`, `prettier/recommended`; `tailwindcss/no-custom-classname` is OFF
- **Pre-commit**: Husky + lint-staged runs `eslint --fix` and `prettier --write` on staged files

## Architecture

- **Pure Astro**: no framework components (React/Vue/Svelte) — all `.astro` components with vanilla JS `<script is:inline>` for client interactivity
- **Single layout**: [src/layouts/Layout.astro](src/layouts/Layout.astro) wraps all pages with `<Navbar />`, `<main><slot /></main>`, `<Footer />`, plus `ViewTransitions`
- **Routing**: root [src/pages/index.astro](src/pages/index.astro) redirects to `/en/`; actual content is in [src/pages/\[lang\]/index.astro](src/pages/%5Blang%5D/index.astro) using `getStaticPaths()` for `en`/`es`
- **Desktop scroll-snap**: sections ≥1024px use scroll-snap with `IntersectionObserver` activation in Layout.astro inline script. New sections **must** have `class="fade-section"` and a unique `id`

### i18n (dual pattern)

1. **Self-contained components** (Navbar, Hero, Layout): use `useTranslations(Astro)` from [src/utils/translate.ts](src/utils/translate.ts) — calls `t('key.path')` with dot-notation
2. **Prop-driven components** (About, Projects, Contact): page dynamically imports `src/i18n/${lang}.json` and passes translated strings as props
3. Translation files: [src/i18n/en.json](src/i18n/en.json) / [src/i18n/es.json](src/i18n/es.json) — nested JSON, identical key structures. Both must be updated together

### Content management

- Plain JSON arrays in [src/content/](src/content/) (`projects.json`, `experience.json`, `core-technologies.json`, `tools-platforms.json`) — **not** Astro Content Collections, no schema validation
- Content files are English-only and displayed as-is in both locales

## Build and Test

```bash
npm install          # Install dependencies (Node 24 required)
npm run dev          # Dev server at localhost:4321
npm run build        # Production build to ./dist/
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
```

## Project Conventions

- **Design language**: green-on-black theme — accents use `text-green-400`, `bg-green-500`, glow via `shadow-[0_0_15px_#00FF80]`; backgrounds `bg-black`; text `text-white`/`text-gray-300`/`text-gray-400`
- **Styling hierarchy**: Tailwind utilities → arbitrary values → scoped `<style>` → imported CSS → [src/css/global.css](src/css/global.css)
- **Component structure**: frontmatter (imports, logic) → HTML template with Tailwind → scoped `<style>` for animations → `<script is:inline>` for DOM logic
- **Images**: use `Image` from `astro:assets` with explicit `width`/`height`; hero uses `loading="eager"`, others `loading="lazy"`
- **Accessibility**: semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), ARIA attributes on interactive elements, alt text on all images
- **Section IDs**: `home`, `about`, `projects`, `contact` — used by navbar anchors and scroll-snap logic
- **Icons**: Font Awesome via CDN + Material Symbols Outlined via Google Fonts

## Deployment

- **Netlify**: config in [netlify.toml](netlify.toml) — builds with `npm run build`, publishes `dist/`
- Cache: `/_astro/*` and `/assets/*` get immutable 1-year headers
- Redirect: `/` → `/en/` (301, redundant with Astro redirect as fallback)
- Google Analytics via Partytown integration (isolates GA to web worker)
