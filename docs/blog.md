# Bilingual Blog System

An automated blog system with AI-generated bilingual posts, Astro content collections, and GitHub Actions automation.

## How It Works

### Content Architecture

Blog posts are markdown files stored in `src/content/blog/`, organized by language:

```
src/content/blog/
├── en/
│   └── building-rag-pipelines-that-actually-work.md
└── es/
    └── building-rag-pipelines-that-actually-work.md
```

Posts sharing the same `slug` across `en/` and `es/` form bilingual pairs. Each post has YAML frontmatter:

```yaml
---
title: 'Building RAG Pipelines That Actually Work'
date: 2026-04-01
tags: ['rag', 'ai', 'python', 'vector-databases']
summary: 'Most RAG tutorials skip the hard parts...'
language: en
slug: building-rag-pipelines-that-actually-work
category: ai
draft: false
readingTime: 8
---
```

The `language` field determines which locale the post appears in. The `slug` field creates the URL path. Setting `draft: true` hides the post from both the index and RSS feed.

### Content Collection Schema

Defined in `src/content.config.ts` using Astro's glob loader. A custom `generateId` function prefixes entry IDs with the language (`en/slug`, `es/slug`) to prevent collisions between bilingual pairs.

### Rendering Pipeline

```
Markdown files → Astro Content Collections → getStaticPaths() → Static HTML
```

- **Blog index** (`/[lang]/blog/`) — Server-rendered page with a React island (`BlogIndex.tsx`) for client-side tag filtering and pagination
- **Blog post** (`/[lang]/blog/[slug]/`) — Astro renders markdown via `<Content />` with `prose-blog` typography classes
- **RSS feed** (`/[lang]/blog/rss.xml`) — Per-language feed using `@astrojs/rss`

### Theme Integration

Blog prose styles use the site's CSS custom properties (`--color-text-primary`, `--color-signal-primary`, etc.) so content automatically respects Build Mode and After Hours themes.

Code blocks use Shiki with dual themes (`github-light` / `github-dark`). The active theme is toggled via CSS:

```css
[data-theme='build'] .shiki .dark {
  display: none;
}
[data-theme='after-hours'] .shiki .light {
  display: none;
}
```

### AI Generation (GitHub Actions)

A scheduled workflow generates posts twice per week:

1. **Topic selection** — Checks `MANUAL_TOPIC` env var → `topicQueue` in `blog-config.json` → AI picks from a random category (excluding recently used ones via `blog-history.json`)
2. **English generation** — Calls GitHub Models API (OpenAI-compatible) with persona and tone rules from `blog-config.json`
3. **Spanish adaptation** — Uses the English post as context for a natural Spanish adaptation (not literal translation)
4. **PR creation** — Commits both `.md` files to a new branch and opens a pull request for review

## Pages & Routes

| Route              | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `/en/blog/`        | English blog index with tag filters and pagination          |
| `/es/blog/`        | Spanish blog index                                          |
| `/en/blog/[slug]/` | English post detail with TOC, bilingual link, prev/next nav |
| `/es/blog/[slug]/` | Spanish post detail                                         |
| `/en/blog/rss.xml` | English RSS feed                                            |
| `/es/blog/rss.xml` | Spanish RSS feed                                            |

## File Structure

### Pages & Components

```
src/
├── content.config.ts                    # Blog collection schema
├── content/blog/{en,es}/*.md            # Blog posts
├── pages/[lang]/blog/
│   ├── index.astro                      # Blog index page
│   ├── [slug].astro                     # Post detail page
│   └── rss.xml.ts                       # RSS feed
├── components/blog/
│   ├── BlogIndex.tsx                    # React island: filtering + pagination
│   ├── BlogCard.tsx                     # Post card component
│   └── TableOfContents.astro            # Sticky TOC with scroll-spy
└── utils/blog.ts                        # Helpers: pagination, TOC, reading time
```

### Automation

```
scripts/
├── generate-blog-post.ts                # Main orchestrator
└── lib/
    ├── github-models.ts                 # OpenAI SDK client (GitHub Models)
    ├── topic-selector.ts                # Queue → config → AI topic selection
    ├── post-generator.ts                # Bilingual post generation prompts
    └── frontmatter.ts                   # YAML frontmatter + slug builder

blog-config.json                         # Categories, themes, generation rules
blog-history.json                        # Generated topics log (prevents repeats)
.github/workflows/generate-blog.yml      # Scheduled workflow + manual trigger
```

### Tests

```
src/utils/__tests__/blog.test.ts         # Reading time, TOC, pagination, tags
scripts/__tests__/topic-selector.test.ts # Queue popping, history exclusion
e2e/blog.spec.ts                         # Blog index, post detail, a11y
```

## Deploying to Production

### 1. Merge this branch

The blog is fully static — it builds and deploys like the rest of the site via Netlify. No server-side runtime needed.

```bash
git checkout main
git merge feat/add-blog-post
git push origin main
```

Netlify will automatically build and deploy. The blog pages will be available at `/en/blog/` and `/es/blog/`.

### 2. Verify the deployment

After deploy, check:

- [ ] `/en/blog/` — Blog index renders with the sample post
- [ ] `/es/blog/` — Spanish index renders
- [ ] `/en/blog/building-rag-pipelines-that-actually-work/` — Post detail renders with TOC
- [ ] `/en/blog/rss.xml` — RSS feed is valid
- [ ] Navbar "Blog" link appears on all subpages
- [ ] Both themes (Build Mode / After Hours) render blog correctly
- [ ] Code blocks switch theme with the site theme

### 3. Enable automated post generation

The GitHub Actions workflow at `.github/workflows/generate-blog.yml` is already configured. It requires:

**No additional secrets needed** — the workflow uses `GITHUB_TOKEN` which is automatically available. The `models: read` permission grants access to GitHub Models API.

The workflow will:

- Run automatically every Monday and Thursday at 9am UTC
- Generate a bilingual blog post
- Open a pull request for your review

To verify it works, trigger it manually:

1. Go to the repository on GitHub
2. Navigate to **Actions** → **Generate Blog Post**
3. Click **Run workflow**
4. Optionally enter a specific topic, or leave blank for AI selection
5. Wait for the PR to appear

### 4. Review and publish posts

Each generated post arrives as a pull request. Review the content, then merge to publish. The Netlify deploy will automatically include the new post.

## Managing the Blog

### Writing a post manually

Create matching files in `src/content/blog/en/` and `src/content/blog/es/` with the same `slug`. Use the frontmatter template above. The post will appear after the next build.

### Queueing specific topics

Add topics to the `topicQueue` array in `blog-config.json`:

```json
{
  "topicQueue": ["Why I migrated from Next.js to Astro", "Building voice AI agents with WebRTC"]
}
```

Queued topics are used in order before AI selects from categories.

### Adjusting categories and tone

Edit `blog-config.json` to add/remove categories, change themes, or adjust generation rules:

```json
{
  "categories": [{ "id": "ai", "themes": ["RAG pipelines", "prompt engineering"] }],
  "generationRules": {
    "wordsMin": 1200,
    "wordsMax": 2000,
    "tone": "practical, opinionated, conversational",
    "persona": "Juan Almeida, a full-stack & AI engineer",
    "avoid": ["generic advice", "listicle format"]
  }
}
```

### Hiding a post

Set `draft: true` in the post's frontmatter. It will be excluded from the index, RSS feed, and prev/next navigation.

### Changing the schedule

Edit the cron expression in `.github/workflows/generate-blog.yml`:

```yaml
schedule:
  - cron: '0 9 * * 1,4' # Monday & Thursday 9am UTC
```

### Pagination

Posts per page is set to 6 in `src/utils/blog.ts` (`POSTS_PER_PAGE`). Change the constant to adjust.

## Modified Existing Files

| File                          | Change                                             |
| ----------------------------- | -------------------------------------------------- |
| `astro.config.mjs`            | Added `markdown.shikiConfig` with dual themes      |
| `tailwind.config.mjs`         | Added `@tailwindcss/typography` plugin             |
| `src/css/global.css`          | Added `.prose-blog` overrides and Shiki toggle CSS |
| `src/i18n/en.json`            | Added `blog.*` and `navbar.blog` keys              |
| `src/i18n/es.json`            | Added `blog.*` and `navbar.blog` keys              |
| `src/components/Navbar.astro` | Added "Blog" link to desktop and mobile nav        |
| `package.json`                | Added dependencies + `generate:blog` script        |
