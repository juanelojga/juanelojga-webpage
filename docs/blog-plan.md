# AI-Generated Bilingual Blog — Implementation Plan

## Context

Add an automated blog system to the portfolio site. Blog posts are AI-generated twice per week using the **GitHub Models API** (OpenAI-compatible, free in GitHub Actions), delivered as **pull requests** for human review. Posts are bilingual (en/es), stored as markdown, and rendered by Astro's content collections. The hybrid topic system lets you define categories/themes while AI picks specific topics (with an optional manual queue).

---

## Phase 1: Blog Rendering Foundation

### 1.1 Install dependencies

```bash
npm install @tailwindcss/typography @astrojs/rss
npm install -D openai tsx
```

### 1.2 Content Collections schema

**New file: `src/content.config.ts`** (Astro 6 uses this filename)

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    summary: z.string(),
    language: z.enum(['en', 'es']),
    slug: z.string(),
    category: z.string(),
    draft: z.boolean().default(false),
    readingTime: z.number().optional(),
  }),
});

export const collections = { blog };
```

**New directories:**

- `src/content/blog/en/` — English posts
- `src/content/blog/es/` — Spanish posts

Posts sharing the same `slug` across `en/` and `es/` form bilingual pairs.

### 1.3 Astro config — add Shiki dual-theme

**Modify: `astro.config.mjs`** — add `markdown` config:

```js
markdown: {
  shikiConfig: {
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
},
```

### 1.4 Tailwind — add typography plugin

**Modify: `tailwind.config.mjs`**

- Add `require('@tailwindcss/typography')` to `plugins: []`

### 1.5 Blog prose theme styles

**Modify: `src/css/global.css`** — add theme-aware prose overrides using existing CSS custom properties (`--color-text-primary`, `--color-signal-primary`, etc.) so blog content respects Build Mode / After Hours.

Also add Shiki theme toggle CSS:

```css
[data-theme='build'] .shiki .dark {
  display: none;
}
[data-theme='after-hours'] .shiki .light {
  display: none;
}
```

### 1.6 i18n strings

**Modify: `src/i18n/en.json` and `src/i18n/es.json`** — add `"blog"` section with labels:

- Section title: `"// parse the log"` / `"// leer el log"`
- Read more, reading time, published date, filter labels, pagination, TOC, back link, RSS
- Add `"blog": "Blog"` to `navbar` keys

### 1.7 Blog utilities

**New file: `src/utils/blog.ts`**

- `getBlogPostsByLang(lang)` — fetch + sort + filter drafts
- `getUniqueTags(posts)` / `getUniqueCategories(posts)`
- `calculateReadingTime(content)` — words / 200 wpm
- `generateTableOfContents(headings)` — nested TOC from Astro headings
- `getBilingualSlug(slug, targetLang)` — alternate-language URL
- `POSTS_PER_PAGE` constant + `paginatePosts()` helper

---

## Phase 2: Blog Pages & Components

### 2.1 Blog index page

**New file: `src/pages/[lang]/blog/index.astro`**

- `getStaticPaths()` for `en`/`es`
- Uses `subpage` Layout variant (Navbar + Footer, no scroll-snap)
- Section header: `"// parse the log"` (developer-culture label matching existing `"// work log"`)
- Tag filter bar (horizontal scrollable pills)
- Blog card grid (2 cols desktop, 1 mobile)
- Pagination

### 2.2 Blog components (React islands)

**New file: `src/components/blog/BlogIndex.tsx`**

- Receives posts as props, handles client-side tag filtering + pagination
- Uses `framer-motion` for card animations (consistent with ProjectCard)
- `client:visible` directive

**New file: `src/components/blog/BlogCard.tsx`**

- Card styling matching existing design tokens: `rounded-xl border border-border bg-surface-secondary/50`
- Category pill (mono, signal-primary), title, summary, tags row, date + reading time
- Hover: border glow effect

### 2.3 Blog post detail page

**New file: `src/pages/[lang]/blog/[slug].astro`**

- `getStaticPaths()` from `getCollection('blog')`
- Renders markdown via Astro's `<Content />` with `prose prose-blog` classes
- Breadcrumbs (Home > Blog > Title)
- Post header: category, title, date, reading time, tags
- Table of contents (sticky sidebar desktop, collapsible mobile)
- "Also available in [English/Spanish]" link when counterpart exists
- Prev/next post navigation
- Structured data: `BlogPosting` + `BreadcrumbList`

**New file: `src/components/blog/TableOfContents.astro`**

- Renders h2/h3 headings as nested nav with scroll-spy (inline script)

### 2.4 Navbar update

**Modify: `src/components/Navbar.astro`**

- Add "Blog" link in desktop nav + mobile menu, targeting `/${lang}/blog/`

### 2.5 RSS feed

**New file: `src/pages/[lang]/blog/rss.xml.ts`**

- Per-language RSS feed using `@astrojs/rss` + `getCollection('blog')`
- `getStaticPaths()` for en/es

### 2.6 Sample post

Create one manual sample post in both languages to test the full rendering pipeline before automation.

---

## Phase 3: GitHub Actions Automation

### 3.1 Blog configuration

**New file: `blog-config.json`** (project root)

```json
{
  "categories": [
    {
      "id": "ai",
      "themes": ["RAG pipelines", "prompt engineering", "AI agents", "ML in production"]
    },
    { "id": "frontend", "themes": ["React performance", "Astro patterns", "CSS architecture"] },
    { "id": "backend", "themes": ["API design", "database optimization", "Python/Django"] },
    { "id": "architecture", "themes": ["system design", "microservices", "event-driven"] },
    { "id": "devops", "themes": ["CI/CD", "Docker", "infrastructure as code"] },
    { "id": "career", "themes": ["engineering leadership", "code review", "remote work"] }
  ],
  "topicQueue": [],
  "generationRules": {
    "wordsMin": 1200,
    "wordsMax": 2000,
    "tone": "practical, opinionated, conversational — like a senior engineer explaining to a peer",
    "persona": "Juan Almeida, a full-stack & AI engineer",
    "avoid": ["generic advice", "listicle format", "corporate jargon", "overly academic tone"]
  }
}
```

**New file: `blog-history.json`** — tracks generated topics to avoid repetition.

### 3.2 Generation script

**New files under `scripts/`:**

```
scripts/
  generate-blog-post.ts     # Main orchestrator
  lib/
    github-models.ts         # OpenAI SDK with GitHub Models baseURL
    topic-selector.ts        # Queue -> config categories -> AI selection (excludes history)
    post-generator.ts        # Prompts + bilingual generation
    frontmatter.ts           # Constructs YAML frontmatter + slug
```

**API client** — uses `openai` SDK with custom base URL:

```ts
import OpenAI from 'openai';
const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
});
```

**Flow:**

1. Load `blog-config.json` + `blog-history.json`
2. Select topic: check `MANUAL_TOPIC` env -> `topicQueue` -> AI picks from random category (excluding history)
3. Generate English post via GitHub Models API (system prompt with persona, tone, rules)
4. Generate Spanish post using English as context (natural adaptation, not literal translation)
5. Generate frontmatter (title, tags, summary for each language)
6. Write `.md` files to `src/content/blog/{en,es}/{slug}.md`
7. Update `blog-history.json`
8. Write slug to `/tmp/blog-generated-slug.txt` for the workflow

**Add to `package.json`:**

```json
"generate:blog": "tsx scripts/generate-blog-post.ts"
```

### 3.3 GitHub Actions workflow

**New file: `.github/workflows/generate-blog.yml`**

```yaml
name: Generate Blog Post
on:
  schedule:
    - cron: '0 9 * * 1,4' # Monday & Thursday 9am UTC
  workflow_dispatch:
    inputs:
      topic:
        description: 'Optional specific topic'
        required: false
        type: string

permissions:
  contents: write
  pull-requests: write
  models: read

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc', cache: 'npm' }
      - run: npm ci
      - run: npm run generate:blog
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MANUAL_TOPIC: ${{ inputs.topic || '' }}
      - name: Create branch and PR
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          SLUG=$(cat /tmp/blog-generated-slug.txt)
          BRANCH="blog/$(date +%Y-%m-%d)-${SLUG}"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git checkout -b "$BRANCH"
          git add src/content/blog/ blog-history.json
          git commit -m "blog: add post '${SLUG}'"
          git push origin "$BRANCH"
          gh pr create --title "blog: ${SLUG}" --body "Auto-generated bilingual blog post. Review and merge to publish."
```

`workflow_dispatch` allows manual trigger with an optional topic override.

---

## Phase 4: Testing & Verification

### Tests to write

- **Unit tests** (`src/utils/__tests__/blog.test.ts`): reading time, TOC, pagination, tag extraction
- **Script tests** (`scripts/__tests__/topic-selector.test.ts`): queue popping, history exclusion, category rotation
- **E2E tests** (`e2e/blog.spec.ts`): index renders, post renders, tag filter, language switch, breadcrumbs, a11y

### Manual verification

- Both themes render blog correctly (Build Mode + After Hours)
- Shiki code blocks switch theme correctly
- RSS feed validates
- Blog appears in sitemap.xml
- Mobile responsive layout works
- `workflow_dispatch` test run generates valid PR
- Lighthouse accessibility >= 90

---

## Files Summary

| Action | File                                                           |
| ------ | -------------------------------------------------------------- |
| New    | `src/content.config.ts`                                        |
| New    | `src/content/blog/en/` and `src/content/blog/es/` directories  |
| New    | `src/pages/[lang]/blog/index.astro`                            |
| New    | `src/pages/[lang]/blog/[slug].astro`                           |
| New    | `src/pages/[lang]/blog/rss.xml.ts`                             |
| New    | `src/components/blog/BlogIndex.tsx`                            |
| New    | `src/components/blog/BlogCard.tsx`                             |
| New    | `src/components/blog/TableOfContents.astro`                    |
| New    | `src/utils/blog.ts`                                            |
| New    | `scripts/generate-blog-post.ts` + `scripts/lib/*.ts`           |
| New    | `.github/workflows/generate-blog.yml`                          |
| New    | `blog-config.json`, `blog-history.json`                        |
| Modify | `astro.config.mjs` — add markdown/shiki config                 |
| Modify | `tailwind.config.mjs` — add typography plugin                  |
| Modify | `src/css/global.css` — prose + shiki theme styles              |
| Modify | `src/i18n/en.json`, `src/i18n/es.json` — blog strings + navbar |
| Modify | `src/components/Navbar.astro` — add blog link                  |
| Modify | `package.json` — add deps + `generate:blog` script             |
