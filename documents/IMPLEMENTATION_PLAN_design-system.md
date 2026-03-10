# Implementation Plan: Portfolio Website Redesign — Professional Blue/White Theme

**Created:** 2026-03-09
**Status:** Not Started
**PRD:** `documents/PRD.md`
**Branch:** `feat/new-design`

## Overview

Complete visual redesign of juanelojga.com from green-on-black hacker theme to a professional blue/white design system. The redesign introduces three page types (Homepage, Case Study, Resume), a new component library, React for interactive elements, Vitest for unit testing, and comprehensive SEO/AI-readiness features. Work is organized into 8 phases across 3 milestones (MVP Homepage, Case Studies + Resume, Polish & QA).

---

## Phase 1: Tooling & Testing Infrastructure

**Goal:** Set up Vitest, testing libraries, and React integration so every subsequent phase can include unit tests from day one.

**Status:** Complete

### Tasks

- [ ] Install Vitest + `happy-dom` + `@testing-library/dom` + `@testing-library/react`
- [ ] Create `vitest.config.ts` with Astro-compatible setup (use `getViteConfig` from `astro/config`)
- [ ] Add `test` and `test:watch` scripts to `package.json`
- [ ] Install `@astrojs/react`, `react`, `react-dom`, `@types/react`, `@types/react-dom`
- [ ] Add `react()` integration to `astro.config.mjs`
- [ ] Create a smoke test (`src/components/__tests__/smoke.test.ts`) that verifies Vitest runs
- [ ] Verify `npm run test` passes

### Quality Gates

- [ ] Tests passing (`npm run test`)
- [ ] Linter passing (`npm run lint`)
- [ ] Type checker passing (`npx astro check` or `npx tsc --noEmit`)
- [ ] Build passing (`npm run build`)

---

## Phase 2: Design System Migration

**Goal:** Replace all green-on-black design tokens with the blue/white professional theme. Update Tailwind config, global CSS, and font loading. No component rewrites yet — just the foundation.

**Status:** Complete

### Tasks

- [ ] Update `tailwind.config.mjs`:
  - [ ] Add custom colors: `primary: '#137fec'`, `background-light: '#f6f7f8'`, `background-dark: '#101922'`
  - [ ] Add Inter font family: `fontFamily: { display: ['Inter', 'sans-serif'] }`
  - [ ] Add border-radius tokens: `DEFAULT: '0.25rem'`, `lg: '0.5rem'`, `xl: '0.75rem'`, `full: '9999px'`
  - [ ] Remove old animation keyframes (`fade-in-left`, `fade-in-right`, `fadeInUp`) — will add new ones as needed
- [ ] Update `src/css/global.css`:
  - [ ] Remove all scroll-snap CSS (body `overflow-y: scroll`, `height: 100vh`, section `scroll-snap-align`, `.active-section` transitions)
  - [ ] Remove green glow shadow utilities
  - [ ] Set `body { font-family: 'Inter', sans-serif; }` as base
  - [ ] Add base body style: `bg-background-light text-slate-900`
- [ ] Update `src/css/navbar.css`: keep mobile menu animation classes, remove any green theme references
- [ ] Update `Layout.astro`:
  - [ ] Add Inter font via Google Fonts `<link>` (weights 300-900)
  - [ ] Remove Font Awesome CDN link (will replace with Material Symbols — already loaded)
  - [ ] Remove IntersectionObserver scroll-snap `<script>` block entirely
  - [ ] Remove scroll-snap related attributes/classes from `<main>` and section containers
  - [ ] Update `<body>` class to `bg-background-light text-slate-900 font-display`
- [ ] Create `src/components/__tests__/design-tokens.test.ts` — verify Tailwind config has expected tokens

### Quality Gates

- [ ] Tests passing (`npm run test`)
- [ ] Linter passing (`npm run lint`)
- [ ] Type checker passing
- [ ] Build passing (`npm run build`)
- [ ] Manual testing: dev server loads with Inter font and light background

---

## Phase 3: Navbar & Footer Redesign

**Goal:** Replace dark-themed Navbar and Footer with the new professional blue/white design matching the wireframe. Update i18n keys for new nav structure.

**Status:** Complete

### Tasks

- [x] Rewrite `src/components/Navbar.astro`:
  - [x] Sticky header: `bg-white/80 backdrop-blur-md border-b border-slate-200`
  - [x] Logo: primary-colored `terminal` Material Symbol icon + "Portfolio" text
  - [x] Desktop nav links: Projects, Experience, Skills, Vision (homepage anchors)
  - [x] "Resume" CTA button: `bg-primary text-white rounded-lg`
  - [x] Language switcher: keep existing EN/ES toggle with Material Symbols icon
  - [x] Mobile hamburger menu: preserve toggle behavior, update styling to white/blue
  - [x] Remove all `text-green-*`, `bg-black`, `border-green-*` classes
  - [x] Remove scroll-snap related JS (section activation, snap-to-section)
- [x] Rewrite `src/components/Footer.astro`:
  - [x] Background: `bg-slate-50 border-t border-slate-200`
  - [x] Layout: logo + social links (LinkedIn, GitHub, Twitter) + copyright
  - [x] Social links use Material Symbols or simple SVG icons
  - [x] Remove all dark theme classes and green accents
- [x] Update `src/i18n/en.json`:
  - [x] Update `navbar` keys: rename `about` → `experience`, add `skills`, `vision`, `resume`
  - [x] Update `footer` keys: add social link labels, update nav link names
- [x] Update `src/i18n/es.json`: mirror all key changes from `en.json`
- [x] Create `src/components/__tests__/Navbar.test.ts`
- [x] Create `src/components/__tests__/Footer.test.ts`

### Quality Gates

- [x] Tests passing (`npm run test`)
- [x] Linter passing (`npm run lint`)
- [x] Type checker passing
- [x] Build passing (`npm run build`)
- [x] Manual testing: navbar renders correctly on desktop and mobile in both en/es

---

## Phase 4: Homepage Components

**Goal:** Build all homepage sections — Hero, Philosophy, Vision, Featured Projects, Technical Proficiency, Recent Work (Timeline), and Contact. Remove old components (Matrix rain, About tabs).

**Status:** Not Started

### Tasks

#### 4a: Hero Section

- [ ] Rewrite `src/components/Hero.astro`:
  - [ ] Two-column layout: left (subtitle tag + h1 + description + 2 CTAs), right (portrait photo with gradient glow)
  - [ ] Subtitle: `"AI SYSTEMS ARCHITECT"` — `text-primary font-bold tracking-widest uppercase text-xs`
  - [ ] Headline: `"Designing the Future of AI"` — `text-5xl md:text-6xl font-black leading-[1.1] tracking-tight`
  - [ ] CTAs: "Get in Touch" (primary solid) + "View Projects" (white bordered)
  - [ ] Photo: use existing `me.jpg` with gradient glow effect (`bg-gradient-to-r from-primary to-blue-400 rounded-xl blur opacity-25`)
  - [ ] Remove Matrix rain `<canvas>` and all animation JS
  - [ ] Responsive: stacked on mobile, side-by-side on `lg:`
- [ ] Update Hero i18n keys in `en.json` and `es.json` (subtitle, headline, description, CTAs)
- [ ] Create `src/components/__tests__/Hero.test.ts`

#### 4b: Philosophy & Outlook Section

- [ ] Create `src/components/Philosophy.astro`:
  - [ ] Section heading with blue underline accent (`h-1 w-20 bg-primary rounded-full`)
  - [ ] 3-card grid: Self-Learner, Curiosity, Responsible Dev
  - [ ] Card pattern: `p-8 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-primary/30 hover:shadow-xl`
  - [ ] Each card: Material Symbol icon in `bg-primary/10` container + title + description
  - [ ] Content stored in a content file or component props (English-only per PRD decision)
- [ ] Create `src/components/__tests__/Philosophy.test.ts`

#### 4c: Vision & Future Section

- [ ] Create `src/components/Vision.astro`:
  - [ ] Centered layout with section heading + blue underline
  - [ ] 3 stacked cards: My Vision, My Expectations, Future Focus
  - [ ] Each card: icon + title + long description paragraph
  - [ ] English-only content (per PRD decision)
- [ ] Create `src/components/__tests__/Vision.test.ts`

#### 4d: Featured Projects Section

- [ ] Create `src/components/FeaturedProjects.astro`:
  - [ ] Section heading with blue underline accent
  - [ ] 3-card grid layout
  - [ ] Wraps `ProjectCard.astro` components
- [ ] Create `src/components/ProjectCard.astro`:
  - [ ] Card: `bg-white rounded-2xl border border-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all`
  - [ ] Project image: `aspect-video object-cover` with hover scale effect
  - [ ] Tech tags as pills: `px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded`
  - [ ] Title + description text
  - [ ] "View Case Study →" link (links to `/[lang]/projects/[slug]`)
- [ ] Update `src/content/projects.json`: add `slug`, `description`, `category` fields to existing projects (keep backward compatibility)
- [ ] Remove old `src/components/Projects.astro`
- [ ] Create `src/components/__tests__/FeaturedProjects.test.ts`
- [ ] Create `src/components/__tests__/ProjectCard.test.ts`

#### 4e: Technical Proficiency + Recent Work

- [ ] Create `src/components/SkillGrid.astro`:
  - [ ] 2x2 grid: Frameworks, Languages, Deployment, Specialization
  - [ ] Each category: `bg-slate-50 rounded-xl p-6` with icon + category title + skill list
  - [ ] Uses `<dl>`, `<dt>`, `<dd>` for semantic markup
- [ ] Create `src/components/Timeline.astro`:
  - [ ] Left-bordered timeline with colored dots
  - [ ] Active role: `bg-primary` dot; past roles: `bg-slate-200` dot
  - [ ] Each entry: role title, date range (with `<time datetime>`), description
  - [ ] Data from `src/content/experience.json`
- [ ] Both sections displayed side-by-side in 2-column grid on desktop (`lg:grid-cols-2`)
- [ ] Create `src/components/__tests__/SkillGrid.test.ts`
- [ ] Create `src/components/__tests__/Timeline.test.ts`

#### 4f: Contact Section Update

- [ ] Update `src/components/Contact.astro`:
  - [ ] Clean up styling to match new theme (remove green accents, dark backgrounds)
  - [ ] Keep email + social links (GitHub, LinkedIn, Twitter)
  - [ ] Add `id="contact"` for anchor navigation
- [ ] Create `src/components/__tests__/Contact.test.ts`

#### 4g: Page Assembly

- [ ] Update `src/pages/[lang]/index.astro`:
  - [ ] Import and render new components in order: Hero → Philosophy → Vision → FeaturedProjects → SkillGrid+Timeline (side-by-side) → Contact
  - [ ] Remove old component imports (About, Projects)
  - [ ] Remove `fade-section` classes and scroll-snap `id` attributes
  - [ ] Each section wrapped in `<section>` with proper `id` for anchor navigation
- [ ] Remove `src/components/About.astro` (replaced by Philosophy, Vision, SkillGrid, Timeline)
- [ ] Delete old `Projects.astro` if not already removed
- [ ] Update `Layout.astro` structured data (JSON-LD) for homepage: `Person` + `WebSite` + `ProfilePage`

### Quality Gates

- [ ] Tests passing (`npm run test`)
- [ ] Linter passing (`npm run lint`)
- [ ] Type checker passing
- [ ] Build passing (`npm run build`)
- [ ] Manual testing: homepage renders all sections correctly at 320px, 768px, 1024px, 1440px
- [ ] Manual testing: both `/en/` and `/es/` render correctly
- [ ] Lighthouse Performance >= 90

---

## Phase 5: SEO & AI Readiness (Homepage)

**Goal:** Add comprehensive SEO meta tags, structured data, AI discovery files, and bot-friendly configuration for the homepage.

**Status:** Not Started

### Tasks

- [ ] Update `Layout.astro` meta tags:
  - [ ] Ensure full meta tag set: `<title>`, `<meta description>`, `<link canonical>`, `<meta robots>`, `<meta author>`, hreflang alternates (en, es, x-default)
  - [ ] Add/verify OG tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:locale`, `og:site_name`
  - [ ] Add/verify Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- [ ] Update homepage JSON-LD structured data:
  - [ ] `Person` schema with `@id: "#person"`, `jobTitle`, `sameAs`, `knowsAbout`, `hasOccupation`
  - [ ] `WebSite` schema with `name`, `url`, `inLanguage`, `author`
  - [ ] `ProfilePage` schema with `mainEntity` referencing `#person`
- [ ] Add semantic HTML to all homepage components:
  - [ ] Verify heading hierarchy: exactly one `<h1>`, proper `h2`→`h3` nesting, no skips
  - [ ] Add `<time datetime>` to timeline entries
  - [ ] Add `<dl>/<dt>/<dd>` to skill categories
  - [ ] Add `itemscope`/`itemprop` microdata to project cards and experience entries
  - [ ] Ensure all `<img>` have descriptive `alt` text
  - [ ] Add `<article>` wrapping for project cards
- [ ] Create `/public/robots.txt` with explicit AI crawler allowances (GPTBot, ClaudeBot, PerplexityBot, etc.)
- [ ] Create `/public/llms.txt` with structured site/owner overview
- [ ] Update `netlify.toml`:
  - [ ] Add `X-Robots-Tag: index, follow` header for all pages
  - [ ] Add `Content-Type: text/plain; charset=utf-8` + cache headers for `/llms.txt`

### Quality Gates

- [ ] Tests passing (`npm run test`)
- [ ] Linter passing (`npm run lint`)
- [ ] Build passing (`npm run build`)
- [ ] Manual testing: verify JSON-LD with Schema.org Validator (paste HTML)
- [ ] Manual testing: verify `/robots.txt` and `/llms.txt` accessible in dev
- [ ] Manual testing: verify heading hierarchy with browser dev tools
- [ ] Lighthouse SEO score = 100

---

## Phase 6: Case Study Pages

**Goal:** Build the case study page template and populate with 3 project case studies. Add per-page SEO.

**Status:** Not Started

### Tasks

#### 6a: Content Model

- [ ] Expand `src/content/projects.json` with full case study fields per PRD Appendix C:
  - [ ] `slug`, `category`, `heroImage`, `description`
  - [ ] `metadata`: `role`, `duration`, `techStack`, `target`
  - [ ] `challenge`: array of paragraphs
  - [ ] `solution`: `narrative` (paragraphs) + `features` (title/description pairs)
  - [ ] `implementation`: `description`, `techPills` (label/color), `codeSnippet` (language/code)
  - [ ] `results`: `metrics` (value/label) + `narrative`
- [ ] Populate 3 case studies with placeholder content (AI Agent Orchestrator, Scalable RAG Pipeline, Autonomous DevOps)

#### 6b: Case Study Components

- [ ] Create `src/components/Breadcrumbs.astro`:
  - [ ] Accepts `items` array of `{ label, href? }` objects
  - [ ] Renders breadcrumb trail with chevron separators
  - [ ] Last item displayed as active (no link, `text-primary`)
- [ ] Create `src/components/CaseStudyHero.astro`:
  - [ ] Two-column: left (category pill + h1 + description + 2 CTAs), right (full-width hero image)
  - [ ] Category pill: `bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold uppercase`
  - [ ] CTAs: "View Live Demo" (primary) + "Read Github Docs" (bordered)
- [ ] Create `src/components/CaseStudySection.astro`:
  - [ ] Reusable section with Material Symbol icon + heading + slot for content
  - [ ] Used for "The Challenge", "The Solution", "Technical Implementation", "The Results"
- [ ] Create `src/components/TechPills.astro`:
  - [ ] Renders array of tech stack pills with colored dots
  - [ ] Each pill: dot + label, color from data
- [ ] Create `src/components/CodeBlock.astro`:
  - [ ] Dark background code display with macOS-style traffic-light header dots
  - [ ] Language label in header
  - [ ] Syntax-colored code (can use `<pre><code>` with basic styling)
- [ ] Create `src/components/MetricsGrid.astro`:
  - [ ] 3-column grid of result metrics
  - [ ] Each metric: large number/value + descriptive label
  - [ ] Below grid: narrative paragraph

#### 6c: Case Study Page Route

- [ ] Create `src/pages/[lang]/projects/[slug].astro`:
  - [ ] `getStaticPaths()` generating paths from `projects.json` for both `en`/`es`
  - [ ] Uses `Layout.astro` wrapper
  - [ ] Renders: Breadcrumbs → CaseStudyHero → Metadata bar (4-col grid) → Challenge → Solution (with feature cards) → Implementation (TechPills + CodeBlock) → Results (MetricsGrid) → Footer CTA
  - [ ] Footer CTA: "Have a similar project in mind?" with "Get in Touch" + "Back to Portfolio" buttons
- [ ] Add `TechArticle` + `BreadcrumbList` JSON-LD structured data per case study
- [ ] Add per-page meta tags (title, description, OG, Twitter, canonical, hreflang)
- [ ] Add `article:author`, `article:published_time`, `article:tag` OG tags

#### 6d: Tests

- [ ] Create `src/components/__tests__/Breadcrumbs.test.ts`
- [ ] Create `src/components/__tests__/CaseStudyHero.test.ts`
- [ ] Create `src/components/__tests__/CaseStudySection.test.ts`
- [ ] Create `src/components/__tests__/TechPills.test.ts`
- [ ] Create `src/components/__tests__/CodeBlock.test.ts`
- [ ] Create `src/components/__tests__/MetricsGrid.test.ts`

### Quality Gates

- [ ] Tests passing (`npm run test`)
- [ ] Linter passing (`npm run lint`)
- [ ] Type checker passing
- [ ] Build passing (`npm run build`)
- [ ] Manual testing: all 3 case study pages render in en/es
- [ ] Manual testing: responsive at all breakpoints (320px, 768px, 1024px, 1440px)
- [ ] Manual testing: breadcrumb navigation works correctly
- [ ] JSON-LD validates for each case study page

---

## Phase 7: Resume Page

**Goal:** Build the Resume page with PDF preview, lead capture form (React), Netlify Forms integration, and reCAPTCHA.

**Status:** Not Started

### Tasks

#### 7a: Resume Page Components

- [ ] Create `src/components/ResumePreview.astro`:
  - [ ] macOS-style window chrome (traffic-light dots + filename header)
  - [ ] Mock resume content with placeholder blocks (matching wireframe)
  - [ ] Gradient fade overlay at bottom to tease content
- [ ] Create `src/components/LeadCaptureForm.tsx` (React):
  - [ ] Fields: Full Name (text, required) + Email Address (email, required)
  - [ ] "Download Resume (PDF)" primary CTA button
  - [ ] Privacy notice: "Your information is used solely for professional networking purposes."
  - [ ] Client-side validation (required fields, email format)
  - [ ] Submit states: idle → loading → success → error
  - [ ] Netlify Forms attributes: `data-netlify="true"`, `netlify-honeypot="bot-field"`
  - [ ] reCAPTCHA integration: `data-netlify-recaptcha="true"`
  - [ ] On success: trigger PDF download
  - [ ] Use `client:visible` directive for lazy hydration

#### 7b: Resume Page Route

- [ ] Create `src/pages/[lang]/resume.astro`:
  - [ ] `getStaticPaths()` for en/es
  - [ ] Breadcrumbs: Home > Resume
  - [ ] Page header: "Professional Resume" h1 + subtitle
  - [ ] ResumePreview component
  - [ ] LeadCaptureForm component
  - [ ] Skills quick-links: 4-column grid (Development, UI/UX Design, Cloud Systems, Leadership)
- [ ] Add actual resume PDF to `/public/` (or `/public/documents/`)
- [ ] Add `WebPage` + `BreadcrumbList` JSON-LD
- [ ] Add per-page meta tags (title, description, OG, Twitter, canonical, hreflang)
- [ ] Update i18n files with resume page keys (header, form labels, CTA, privacy notice, breadcrumb)

#### 7c: Tests

- [ ] Create `src/components/__tests__/ResumePreview.test.ts`
- [ ] Create `src/components/__tests__/LeadCaptureForm.test.tsx`

### Quality Gates

- [ ] Tests passing (`npm run test`)
- [ ] Linter passing (`npm run lint`)
- [ ] Type checker passing
- [ ] Build passing (`npm run build`)
- [ ] Manual testing: resume page renders in en/es
- [ ] Manual testing: form validation works (empty fields, invalid email)
- [ ] Manual testing: form submits to Netlify Forms (deploy preview)
- [ ] Manual testing: responsive at all breakpoints

---

## Phase 8: Polish, Analytics & QA

**Goal:** Final polish — analytics events, `/llms-full.txt` generation, accessibility audit, cross-browser testing, performance optimization, and comprehensive QA.

**Status:** Not Started

### Tasks

#### 8a: Analytics

- [ ] Add custom GA4 events (in components or via utility):
  - [ ] `case_study_view` — on case study page load (with project slug)
  - [ ] `resume_download_attempt` — on form submission
  - [ ] `resume_download_success` — on successful PDF delivery
  - [ ] `cta_click` — on CTA button clicks (with label: Get in Touch, View Projects, etc.)
  - [ ] `outbound_link` — on external link clicks (GitHub, LinkedIn, Twitter)
- [ ] Verify GA4 tracking continuity (existing `page_view` events still fire)

#### 8b: AI Readiness

- [ ] Create build script to auto-generate `/public/llms-full.txt` from content JSON files + page content
- [ ] Add `llms-full.txt` headers to `netlify.toml`
- [ ] Verify `/llms.txt` and `/llms-full.txt` return correct content

#### 8c: Accessibility Audit

- [ ] Run axe/Lighthouse accessibility audit on all pages
- [ ] Fix any WCAG 2.1 AA violations:
  - [ ] Color contrast ratios (especially primary blue on white/light backgrounds)
  - [ ] Focus indicators on interactive elements
  - [ ] ARIA labels on icon-only buttons
  - [ ] Skip navigation link
  - [ ] `alt` text completeness
- [ ] Verify keyboard navigation works across all pages

#### 8d: Performance Optimization

- [ ] Optimize all images: use `astro:assets` Image component with explicit dimensions
  - [ ] Hero portrait: `loading="eager"` (LCP element)
  - [ ] All other images: `loading="lazy"`
  - [ ] Project/case study images: provide WebP/AVIF formats
- [ ] Review bundle size — ensure no unnecessary JS shipped
- [ ] Verify FCP < 1.5s, LCP < 2.5s, CLS < 0.1

#### 8e: Cross-Browser & Responsive Testing

- [ ] Test in Chrome, Firefox, Safari, Edge (last 2 versions)
- [ ] Test at breakpoints: 320px, 768px, 1024px, 1440px
- [ ] Test on real mobile device (or BrowserStack)
- [ ] Verify all hover/transition effects degrade gracefully on touch devices

#### 8f: SEO Final Audit

- [ ] Verify JSON-LD validates on all page types (Google Rich Results Test)
- [ ] Verify hreflang tags match across en/es page pairs
- [ ] Verify sitemap includes all new pages with hreflang alternates
- [ ] Verify canonical URLs are correct on all pages
- [ ] Verify `robots.txt` allows all target crawlers
- [ ] Verify all images have descriptive `alt` text
- [ ] Verify all external links have `rel="noopener noreferrer"`

#### 8g: Cleanup

- [ ] Remove any unused old components, CSS, or assets
- [ ] Remove unused content fields from JSON files
- [ ] Verify no `dark:` utility classes remain (per PRD: no dark mode)
- [ ] Verify no Font Awesome references remain (replaced by Material Symbols)
- [ ] Verify no green theme colors remain (`text-green-*`, `bg-green-*`, `shadow-*#00FF80*`)
- [ ] Update `CLAUDE.md` to reflect new design system, component structure, and conventions

### Quality Gates

- [ ] All tests passing (`npm run test`)
- [ ] Linter passing (`npm run lint`)
- [ ] Type checker passing
- [ ] Build passing (`npm run build`)
- [ ] Lighthouse >= 95 on all metrics (Performance, Accessibility, Best Practices)
- [ ] Lighthouse SEO = 100 on all pages
- [ ] WCAG 2.1 AA compliant
- [ ] All JSON-LD validates via Google Rich Results Test
- [ ] `/robots.txt`, `/llms.txt`, `/llms-full.txt` accessible and correct
- [ ] All analytics events firing in GA4 DebugView

---

## Notes

### Decisions Made

- **React boundary:** Only `LeadCaptureForm.tsx` uses React — everything else is Astro (per PRD Section 8.4)
- **No dark mode:** Remove all `dark:` utility classes from wireframes during implementation (per PRD Section 5)
- **Philosophy & Vision content:** English-only, stored in component/content files, not i18n (per PRD Q5)
- **Lead capture form fields:** Name + Email only — no Company/Role field (per PRD Q8)
- **reCAPTCHA:** Required on lead capture form (per PRD Q9)
- **Interests tab:** Dropped entirely (per PRD Q11)
- **"Get in Touch" CTA:** Anchor link to Contact section (per PRD Q12)
- **Content:** Build with mock/placeholder case study data first, replace with real content later (per PRD Q3)
- **Inter font:** Loaded via Google Fonts CDN (weights 300-900)
- **Icons:** Material Symbols Outlined replaces Font Awesome (already loaded in Layout)

### Dependencies

- Resume PDF must be provided for Phase 7 integration
- Real case study content (challenge, solution, results narratives) needed before launch — placeholder content acceptable during development
- OG images (1200x630px) per case study needed for Phase 6 SEO (can use placeholder initially)
- reCAPTCHA site key needed for lead capture form (Netlify provides this automatically with `data-netlify-recaptcha`)

### Milestone Mapping

| Milestone             | Phases | PRD Phase |
| --------------------- | ------ | --------- |
| MVP Homepage          | 1–5    | Phase 1   |
| Case Studies + Resume | 6–7    | Phase 2   |
| Polish & QA           | 8      | Phase 3   |
