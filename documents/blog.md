# Research-First Bilingual Blog System

The blog publishes static Astro pages, but every new article starts with live weekly news research. A scheduled GitHub Actions workflow discovers current stories, investigates one in depth, generates English and Spanish posts, and opens a pull request for human review.

## Scheduled process

The workflow in `.github/workflows/generate-blog.yml` runs every Monday at 09:00 UTC. It can also be started manually from **GitHub → Actions → Generate Blog Post → Run workflow**.

Each run:

1. Checks out the repository and installs dependencies.
2. Searches the latest seven calendar days of news about software development, AI, coding, and software architecture.
3. Validates exactly four distinct stories and rejects stale, uncited, repeated, or previously covered stories.
4. Selects one of the four stories uniformly at random.
5. Searches again, reads source pages, and builds a research brief with at least three independent domains and one primary source.
6. Generates a cited English article using only the validated research brief.
7. Adapts the article into natural Spanish while preserving the evidence and links.
8. Writes both Markdown files, updates `blog-history.json`, creates a branch, and opens a pull request containing the selected story and research sources.

The workflow deliberately fails if it cannot find sufficiently fresh or well-supported material. A failed run does not create or publish a post.

## OpenRouter configuration

The generator uses OpenRouter's current `openrouter:web_search` and `openrouter:web_fetch` server tools. It does not use the deprecated online-model suffix or web-search plugin.

Required environment variable:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

Optional model override:

```bash
OPENROUTER_MODEL=provider/model-slug
```

When `OPENROUTER_MODEL` is unset or blank, the generator uses `openai/gpt-5.2`.

For scheduled runs, add `OPENROUTER_API_KEY` as a GitHub Actions repository secret:

1. Open **Settings → Secrets and variables → Actions**.
2. Under **Repository secrets**, create `OPENROUTER_API_KEY`.
3. Optionally, under **Repository variables**, create `OPENROUTER_MODEL` to override the default model without changing code.

The built-in `GITHUB_TOKEN` is used only to push the generated branch and open the pull request.

## Running locally

```bash
OPENROUTER_API_KEY=sk-or-v1-... pnpm generate:blog
```

To test another model:

```bash
OPENROUTER_API_KEY=sk-or-v1-... \
OPENROUTER_MODEL=provider/model-slug \
pnpm generate:blog
```

Local generation makes real model, search, and page-fetch requests and therefore consumes OpenRouter credits.

## Research safeguards

The research pipeline enforces:

- Exactly four candidate stories from the configured seven-day window.
- HTTPS sources returned by OpenRouter's web tools.
- No duplicate candidate URLs.
- No URLs or exact headlines already recorded in `blog-history.json`.
- At least five source-backed facts in the deeper research brief.
- At least three source domains, including one primary source.
- Inline article citations limited to URLs from the validated brief.
- English and Spanish word count, summary, tag, and FAQ constraints.
- A bounded second attempt when discovery, research, or writing validation fails.

Research settings and writing rules live in `blog-config.json`.

## Content architecture

Posts are stored as bilingual Markdown pairs sharing one slug:

```text
src/content/blog/
├── en/<slug>.md
└── es/<slug>.md
```

Each generated post contains normal metadata plus structured research sources:

```yaml
---
title: 'Example title'
date: 2026-07-18
tags: ['ai', 'architecture', 'agents']
summary: 'A concise 120–160 character description.'
language: en
slug: example-title
category: ai
draft: false
readingTime: 8
sources:
  - title: 'Primary announcement'
    url: 'https://example.com/announcement'
    publisher: 'Example'
    publishedAt: '2026-07-17'
    sourceType: primary
---
```

The post page renders these sources after the article. Inline links connect specific claims to the same source allowlist.

## Publishing

Generation does not publish directly. The GitHub Actions job opens a pull request, and a person reviews the story, claims, citations, English copy, and Spanish adaptation. Merging the PR triggers the normal Netlify deployment.

Astro then generates:

- `/en/blog/` and `/es/blog/`
- `/en/blog/<slug>/` and `/es/blog/<slug>/`
- `/en/blog/rss.xml` and `/es/blog/rss.xml`

Setting `draft: true` excludes a post from indexes, article routes, navigation, and RSS.

## Relevant files

```text
.github/workflows/generate-blog.yml     # Weekly schedule, secret, PR creation
blog-config.json                        # Research and writing constraints
blog-history.json                       # Previous topics and source URLs
scripts/generate-blog-post.ts           # Pipeline orchestration
scripts/lib/openrouter.ts               # OpenRouter JSON client
scripts/lib/research.ts                 # Discovery, validation, random choice, deep research
scripts/lib/post-generator.ts           # Grounded English and Spanish writing
scripts/lib/frontmatter.ts              # Markdown/frontmatter generation
src/content.config.ts                   # Astro content schema
src/pages/[lang]/blog/[slug].astro      # Article and research-source rendering
```
