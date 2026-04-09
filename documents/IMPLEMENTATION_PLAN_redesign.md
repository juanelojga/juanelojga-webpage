# Implementation Plan: Portfolio Redesign

**Goal**: Replace the conventional portfolio shell with a narrative TODO-rail interface, new theme system, editorial photography integration, and chapter-based motion language — as defined in [DESIGN_DIRECTION_redesign.md](DESIGN_DIRECTION_redesign.md).

**Timeline**: 8 weeks (solo developer)

**Team**: Juan Almeida (full-stack engineer, sole contributor)

**Constraints**:

- Astro 5 + Tailwind 3 + TypeScript stack (keep current framework)
- React already integrated via `@astrojs/react` — use for interactive elements (TODO rail, theme toggle)
- Must preserve bilingual support (en/es) with existing dual i18n pattern
- Content stays in plain JSON (no Astro Content Collections migration)
- Netlify deployment, SEO/crawlability, and accessibility (WCAG AA) must be maintained
- Portrait photography assets must be produced externally (not blocked by code work)
- 21 existing test files at project start — 10 will be intentionally deleted during Phase 0b (legacy component cleanup); remaining ~11 tests must continue to pass or be updated alongside component changes

---

## Definition of Done — Quality Gate Checklist

Every task that produces or modifies a **component, utility function, layout, or interactive behavior** is not considered done until **all applicable items** in this checklist pass. Tasks that are purely data/config/copy (e.g., adding i18n keys, updating JSON content) only need items marked with ★.

### Mandatory Checklist

| #   | Check                                  | Applies To                        | How to Verify                                                                                                                                                                                                                                                                        |
| --- | -------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ★1  | **Linter passes**                      | All code changes                  | `pnpm lint` exits with 0 errors. No `eslint-disable` comments unless justified and documented in PR.                                                                                                                                                                                 |
| ★2  | **Formatter passes**                   | All code changes                  | `pnpm format` produces no diff. Code matches Prettier config (single quotes, semicolons, 2-space indent, `arrowParens: "avoid"`, 100 char width).                                                                                                                                    |
| ★3  | **TypeScript compiles**                | All `.ts`/`.tsx`/`.astro` changes | `pnpm build` succeeds with no type errors. No `@ts-ignore` or `as any` unless justified.                                                                                                                                                                                             |
| ★4  | **Existing tests pass**                | All code changes                  | `pnpm test` (Vitest) exits with 0 failures. No test may be skipped (`.skip`) or temporarily disabled without a linked tracking issue.                                                                                                                                                |
| 5   | **Unit/integration test written**      | New components and utilities      | Every new component (`.astro`, `.tsx`) has a corresponding test file in `src/components/__tests__/`. Every new utility in `src/utils/` has a test. Coverage target: ≥80%.                                                                                                            |
| 6   | **i18n parity verified**               | Components with translated text   | Both `en.json` and `es.json` have identical key structures for new/changed keys. Test asserts key parity programmatically (existing pattern in test suite).                                                                                                                          |
| 7   | **Playwright visual verification**     | All visual components             | Run Playwright MCP against `localhost:4321` at **3 viewports** (desktop 1280px, tablet 768px, mobile 375px) in **both locales** (`/en/`, `/es/`). Screenshots saved to `.screenshots/` with descriptive names. No broken layouts, overflow, missing elements, or misaligned content. |
| 8   | **Playwright both-theme verification** | Themed components (after Phase 1) | Repeat viewport check (#7) with both `data-theme="build"` and `data-theme="after-hours"`. No contrast failures, missing theme variables, or broken visuals.                                                                                                                          |
| 9   | **Accessibility baseline**             | Interactive/visual components     | Keyboard navigation works (Tab/Shift+Tab/Enter/Escape); focus indicators visible; ARIA roles/labels present on interactive elements; no Lighthouse Accessibility regressions below 90.                                                                                               |
| 10  | **No console errors**                  | All components                    | Browser console shows zero errors/warnings during Playwright runs. `astro check` (if available) reports no issues.                                                                                                                                                                   |
| 11  | **Reduced motion respected**           | Animated components               | With `prefers-reduced-motion: reduce` enabled, animations are replaced with instant state or short opacity fade. Verified via Playwright emulation.                                                                                                                                  |
| 12  | **No dead code introduced**            | All code changes                  | No unused imports, unreachable code, or orphaned files. Retiring a component means removing all imports and references.                                                                                                                                                              |
| 13  | **Build succeeds**                     | All changes (final gate)          | `pnpm build` completes without errors. Output in `dist/` is deployable. No SSR/hydration mismatches.                                                                                                                                                                                 |

### Enforcement Rules

1. **Tests are not optional.** A component without a test is not done. If a test task is listed separately in a phase (e.g., "2.9 Write tests"), the preceding component tasks are in a _blocked_ state until tests pass.
2. **Playwright runs are not optional.** Every component build task must include visual verification before marking complete. The screenshots serve as visual regression baselines.
3. **Lint/format/type-check run on every task**, not just at phase end. The pre-commit hook (Husky + lint-staged) catches staged files, but the full suite must also pass.
4. **Milestone gates cannot be entered** until every task in the milestone has passed all applicable checklist items. The `critique` skill reviews assume all prior quality gates are green.
5. **Failed checks block progress.** If a check fails, fix it before moving to the next task. Do not accumulate tech debt across tasks.

### Playwright Verification Protocol

For consistency, follow this protocol for check #7 and #8:

1. Start dev server: `pnpm dev`
2. Open Playwright MCP and navigate to `localhost:4321/en/` and `localhost:4321/es/`
3. For each page, take full-page screenshots at:
   - **Desktop**: 1280×800 viewport
   - **Tablet**: 768×1024 viewport
   - **Mobile**: 375×812 viewport
4. Save screenshots to `.screenshots/` with naming convention: `{component}-{viewport}-{locale}-{theme}.png` (e.g., `hero-desktop-en-build.png`)
5. Manually inspect screenshots for:
   - Layout breaks or horizontal overflow
   - Missing or misaligned elements
   - Text truncation or overlap (especially Spanish locale)
   - Theme color application correctness
   - Scroll-snap section alignment (desktop)
   - Touch target sizing (mobile, ≥44px)
6. Flag and fix any issues before marking the task complete

---

## Design Skill Integration Strategy

The project uses the **Impeccable** skill suite to enforce design quality at every phase. Each skill is invoked at specific points in the workflow — not ad hoc — to ensure systematic coverage.

### Skill-to-Phase Map

| Skill              | Primary Phase(s)   | Purpose in This Project                                                                                                           |
| ------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `teach-impeccable` | Phase 0 (pre-work) | One-time setup: gather design context and save persistent design guidelines before any implementation                             |
| `frontend-design`  | Phases 0b, 2–6     | Build construction page (0b), then each new component (TodoRail, HeroNarrative, BioChapter, SkillMatrix, WorkLog, ContactChapter) |
| `distill`          | Phases 0b, 3, 5    | Codebase cleanup (0b); tighten the bio chapter (merge Philosophy + Vision); strip work log to essentials                          |
| `extract`          | Phase 1            | Extract reusable design tokens, color palettes, and spacing scales into the Tailwind config                                       |
| `typeset`          | Phase 1            | Define the 5-level typography hierarchy with responsive clamp values and font pairing                                             |
| `colorize`         | Phase 1            | Establish the dual-theme color system (Build Mode / After Hours) with signal and surface color roles                              |
| `arrange`          | Phases 2, 4, 5     | Layout composition for the split shell, skill matrix grouping, and work log cascade                                               |
| `adapt`            | Phases 2, 4, 8     | Responsive adaptation: mobile rail, compact skill cards, breakpoint QA                                                            |
| `onboard`          | Phases 2, 3        | TODO rail as a first-time discovery guide; hero as initial orientation moment                                                     |
| `bolder`           | Phase 3            | Push the hero section beyond safe/generic into distinctive territory                                                              |
| `clarify`          | Phases 3, 6        | Sharpen hero copy, bio narrative, CTA labels, and i18n microcopy                                                                  |
| `delight`          | Phases 6, 7        | Contact completion feedback, TODO rail checkmark moments, theme toggle surprise                                                   |
| `animate`          | Phase 7            | Implement all chapter-specific reveal families and micro-interactions                                                             |
| `overdrive`        | Phase 7            | Technically ambitious effects: portrait frame sequence, TODO rail state machine choreography                                      |
| `quieter`          | Phase 7            | Dial back any animations that feel aggressive after implementation; ensure elegance over spectacle                                |
| `harden`           | Phases 6, 8        | i18n edge cases (Spanish expansion), error states, text overflow, resilient interaction patterns                                  |
| `critique`         | Milestone gates    | Design effectiveness review at the end of each milestone before proceeding                                                        |
| `audit`            | Phase 8            | Comprehensive audit across accessibility, performance, theming, and responsive design                                             |
| `optimize`         | Phase 8            | Performance pass: Lighthouse scores, image optimization, animation budget enforcement                                             |
| `normalize`        | Phase 8            | Verify all components conform to the new design system tokens and patterns                                                        |
| `polish`           | Phase 8            | Final detail pass: alignment, spacing, consistency, and micro-adjustments before launch                                           |

### Invocation Protocol

1. **Before starting any component build**: invoke `frontend-design` to generate distinctive, production-grade code
2. **After completing each milestone**: invoke `critique` to evaluate design effectiveness and flag issues before moving on
3. **During Phase 8**: invoke `audit` → `normalize` → `optimize` → `polish` in sequence as a quality cascade
4. **When output feels generic or safe**: invoke `bolder` to push impact; follow with `quieter` if overcorrected

---

## Phase 0: Design Context Setup (Pre-Work)

> One-time setup to establish persistent design guidelines for AI-assisted development.

| Task                                                                        | Effort | Depends On | Done Criteria                                                                                            |
| --------------------------------------------------------------------------- | ------ | ---------- | -------------------------------------------------------------------------------------------------------- |
| 0.1 Run `teach-impeccable` skill to gather project design context           | 1h     | —          | Design context file generated with project-specific guidelines, color language, component patterns       |
| 0.2 Review and refine generated design context against DESIGN_DIRECTION doc | 1h     | 0.1        | Context file accurately reflects the narrative TODO-rail concept, dual-theme system, and design language |

### Execution Strategy

**Strictly sequential** — 0.1 → 0.2. No parallelism possible; 0.2 reviews the output of 0.1.

**Phase 0 Total**: ~2h

---

## Phase 0b: Construction Page & Codebase Cleanup (Pre-Week 1)

> Deploy a bilingual "under construction" holding page and remove all legacy homepage components that the redesign will replace. This creates a clean slate for building the new design without carrying dead code.

**Rationale**: The current site is visually and structurally incompatible with the new design system. Rather than maintaining two parallel codebases during development, this phase deploys a minimal construction page and strips away everything that will be rebuilt — reducing cognitive overhead, eliminating false test-pass signals from legacy components, and preventing accidental dependency on code that's being retired.

### Components to Remove (Homepage-only, being rebuilt in later phases)

| Component                 | Replacement (Future Phase)               |
| ------------------------- | ---------------------------------------- |
| `Hero.astro`              | `HeroNarrative.astro` (Phase 3)          |
| `HeroContent.astro`       | `HeroNarrative.astro` (Phase 3)          |
| `HeroImageCollage.astro`  | Portrait integration (Phase 3)           |
| `HeroSvgBackground.astro` | Removed entirely                         |
| `Philosophy.astro`        | `BioChapter.astro` (Phase 3)             |
| `Vision.astro`            | `BioChapter.astro` (Phase 3)             |
| `FeaturedProjects.astro`  | `WorkLog.astro` (Phase 5)                |
| `ProjectCard.astro`       | Redesigned `ProjectCard.astro` (Phase 5) |
| `SkillGrid.astro`         | `SkillMatrix.astro` (Phase 4)            |
| `Timeline.astro`          | `WorkLog.astro` (Phase 5)                |
| `Contact.astro`           | `ContactChapter.astro` (Phase 6)         |

### Components to Retain

| Component                                                                                                    | Reason                                                    |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `Navbar.astro`                                                                                               | Used by resume + case study pages (refactored in Phase 2) |
| `Footer.astro`                                                                                               | Used by resume + case study pages (refactored in Phase 2) |
| `Breadcrumbs.astro`, `CaseStudyHero.astro`, `CaseStudySection.astro`, `MetricsGrid.astro`, `CodeBlock.astro` | Case study detail pages                                   |
| `ResumePreview.astro`, `ResumeSkillsGrid.astro`                                                              | Resume page                                               |
| `TechPills.astro`                                                                                            | Case study pages                                          |
| `GoogleAnalytics.astro`                                                                                      | Analytics (retained)                                      |
| `LeadCaptureForm.tsx`                                                                                        | Resume page (already React)                               |

### Tests to Remove (for deleted components)

| Test File                   | Deleted Component         |
| --------------------------- | ------------------------- |
| `Hero.test.ts`              | `Hero.astro`              |
| `HeroContent.test.ts`       | `HeroContent.astro`       |
| `HeroImageCollage.test.ts`  | `HeroImageCollage.astro`  |
| `HeroSvgBackground.test.ts` | `HeroSvgBackground.astro` |
| `Philosophy.test.ts`        | `Philosophy.astro`        |
| `Vision.test.ts`            | `Vision.astro`            |
| `FeaturedProjects.test.ts`  | `FeaturedProjects.astro`  |
| `SkillGrid.test.ts`         | `SkillGrid.astro`         |
| `Timeline.test.ts`          | `Timeline.astro`          |
| `Contact.test.ts`           | `Contact.astro`           |

### Tasks

| Task                                                                   | Status  | Effort | Depends On | Done Criteria                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------- | ------- | ------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0b.1 Build bilingual "Under Construction" page in `[lang]/index.astro` | Done    | 3h     | 0.2        | Minimal, on-brand page with "Site under construction" message in both locales; includes name, brief tagline, and social/contact links (LinkedIn, GitHub, email); uses existing `Layout.astro` with Navbar + Footer; responsive at all breakpoints. **Quality gates ★1–★4, #7, #13.**                                                                              |
| 0b.2 Deploy construction page to production (Netlify)                  | Pending | 1h     | 0b.1       | Live site at juanelojga.com shows construction page in both `/en/` and `/es/`; resume and case study pages still accessible and unaffected; redirects working. **Quality gate #13.**                                                                                                                                                                              |
| 0b.3 Remove legacy homepage components                                 | Done    | 2h     | 0b.1       | Delete: `Hero.astro`, `HeroContent.astro`, `HeroImageCollage.astro`, `HeroSvgBackground.astro`, `Philosophy.astro`, `Vision.astro`, `FeaturedProjects.astro`, `ProjectCard.astro`, `SkillGrid.astro`, `Timeline.astro`, `Contact.astro`. No orphaned imports remain anywhere. **Quality gates ★1–★4, #12, #13.**                                                  |
| 0b.4 Remove tests for deleted components                               | Done    | 1h     | 0b.3       | Delete: `Hero.test.ts`, `HeroContent.test.ts`, `HeroImageCollage.test.ts`, `HeroSvgBackground.test.ts`, `Philosophy.test.ts`, `Vision.test.ts`, `FeaturedProjects.test.ts`, `SkillGrid.test.ts`, `Timeline.test.ts`, `Contact.test.ts`. Remaining test suite passes (`pnpm test` exits 0). **Quality gates ★1–★4.**                                               |
| 0b.5 Clean up orphaned i18n keys, CSS, and utilities                   | Done    | 2h     | 0b.3       | Remove i18n keys used exclusively by deleted components (preserve keys used by retained pages); remove unused CSS in `navbar.css` and `global.css` if applicable; remove scroll-snap logic tied exclusively to deleted homepage sections from `Layout.astro`; clean up `src/utils/skills.ts` if `SkillGrid` was sole consumer. **Quality gates ★1–★4, #12, #13.** |
| 0b.6 Clean up unused content JSON and assets                           | Done    | 1h     | 0b.3       | Archive or remove `experience.json` if only consumed by `Timeline` (verify); audit `src/assets/` for orphaned SVGs; verify `public/images/` assets used by case studies are retained. Content JSON files needed by future phases (`projects.json`, `skills.json`, etc.) are kept. **Quality gates ★1–★4, #12, #13.**                                              |
| 0b.7 Verify non-homepage pages and build integrity                     | Done    | 1h     | 0b.3–0b.6  | Resume page (`/[lang]/resume`) and case study pages (`/[lang]/projects/[slug]`) render correctly; `pnpm build` succeeds; `pnpm test` passes; no broken imports or missing dependencies. **Quality gates ★1–★4, #7 (Playwright verification of sub-pages), #10, #13.**                                                                                             |

**Current status**: Phase 0b implementation work is complete except for `0b.2` production deployment.

### Execution Strategy

```
Wave 1 ─ sequential: 0b.1 (construction page, ←0.2)
Wave 2 ─ sequential: 0b.2 (deploy to production, ←0b.1)
Wave 3 ─ sequential: 0b.3 (remove components, ←0b.1)
Wave 4 ─ parallel:   0b.4 (remove tests, ←0b.3) + 0b.5 (clean i18n/CSS, ←0b.3) + 0b.6 (clean content/assets, ←0b.3)
Wave 5 ─ sequential: 0b.7 (verify sub-pages + build, ←0b.3–0b.6)
```

- **Critical path**: 0b.1 → 0b.3 → 0b.7 (6h sequential minimum)
- **Parallelism savings**: ~3h — Wave 4 runs three cleanup tasks simultaneously (4h serial → ~2h parallel)
- **Deploy timing**: 0b.2 (deploy) runs after the construction page is built. The remaining cleanup (0b.3–0b.6) happens after the construction page is live, so there's no window where the site is broken in production
- **Safety note**: 0b.2 and 0b.3 can run in parallel (deploy happens independently of cleanup), but keeping them sequential avoids deploying a broken state if cleanup accidentally affects shared components

### Impact on Later Phases

The following retirement tasks from later phases are **eliminated** by this cleanup and should be removed or marked as pre-completed:

| Eliminated Task                                                                           | Original Phase | Original Effort |
| ----------------------------------------------------------------------------------------- | -------------- | --------------- |
| 3.6 Retire `HeroContent`, `HeroImageCollage`, `HeroSvgBackground`, `Philosophy`, `Vision` | Phase 3        | 2h              |
| 4.5 Retire `SkillGrid` and `Timeline` from homepage                                       | Phase 4        | 1h              |
| 5.6 Retire `FeaturedProjects` from homepage                                               | Phase 5        | 1h              |
| 6.3 Retire old `Contact` from homepage                                                    | Phase 6        | 1h              |
| **Total effort saved from later phases**                                                  |                | **5h**          |

**Net effect**: Phase 0b adds ~11h of work but eliminates ~5h from later phases and removes scattered retirement tasks that would otherwise interrupt the flow of new component development. More importantly, it ensures every subsequent phase starts from a clean codebase with zero legacy coupling.

**Phase 0b Total**: ~11h

---

## Milestones

| #   | Milestone             | Status      | Target     | Success Criteria                                                                                                                                                                                                                                                                   |
| --- | --------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | Clean Slate           | In progress | Pre-Week 1 | Construction page live on production. All legacy homepage components and their tests removed. `pnpm build` and `pnpm test` pass. Resume and case study pages unaffected. **All tasks 0b.1–0b.7 pass quality gate checklist.**                                                      |
| 1   | Foundation Complete   | Pending     | End Week 2 | New theme system, design tokens, typography, and base layout shell with TODO rail skeleton rendering on desktop/tablet/mobile. **All tasks 1.1–2.9 pass quality gate checklist. Playwright screenshots committed.**                                                                |
| 2   | Core Sections Built   | Pending     | End Week 4 | Hero ("Hello World"), Bio, Skills, and Work Log sections implemented with i18n and content integration. **All tasks 3.1–5.7 pass quality gate checklist. Full test suite green. Playwright screenshots committed.**                                                                |
| 3   | Interactions & Motion | Pending     | End Week 6 | TODO rail state machine, scroll-driven animations, theme toggle with portrait sequence, chapter-specific reveal families. **All tasks 6.1–7.10 pass quality gate checklist. Reduced-motion variants verified.**                                                                    |
| 4   | Polish & Launch       | Pending     | End Week 8 | Responsive QA, accessibility audit, performance optimization, test suite updated, production deploy. **All tasks 8.1–8.13 pass quality gate checklist. `pnpm lint`, `pnpm test`, `pnpm build` all exit 0. Lighthouse scores ≥90. Final Playwright screenshot baseline committed.** |

---

## Phase 1: Design Tokens & Theme Foundation (Week 1)

> Establish the new visual language before touching any components.
>
> **Skills**: `extract` (design token extraction) · `colorize` (dual-theme color system) · `typeset` (typography hierarchy)

| Task                                                                                         | Status | Effort | Depends On | Skill                | Done Criteria                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------- | ------ | ------ | ---------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1 Define design token system (colors, spacing, typography scales) in `tailwind.config.mjs` | Done   | 6h     | —          | `extract` `colorize` | Tailwind config has `buildMode` and `afterHours` color palettes, signal colors (acid green, electric cyan, muted amber), surface colors (chalk, carbon, ink, smoked teal), font families (monospace display + editorial sans). **Quality gates ★1–★4, #13.** |
| 1.2 Create CSS custom property layer for theme switching in `global.css`                     | Done   | 4h     | 1.1        | `colorize`           | CSS variables for all color roles toggle via `[data-theme="build"]` / `[data-theme="after-hours"]` class on `<html>`. **Quality gates ★1–★4, #13.**                                                                                                          |
| 1.3 Set up typography scale (Level 0–Body–Meta) with responsive clamp values                 | Done   | 4h     | 1.1        | `typeset`            | Tailwind utility classes or CSS for all 5 hierarchy levels from the design direction. **Quality gates ★1–★4, #7, #13.**                                                                                                                                      |
| 1.4 Add font assets (monospace display + editorial sans-serif)                               | Done   | 2h     | —          | `typeset`            | Fonts loaded via `<link>` or `@font-face` with `font-display: swap`; fallbacks defined. **Quality gates ★1–★4, #13.**                                                                                                                                        |
| 1.5 Update `design-tokens.test.ts` to validate new token structure                           | Done   | 2h     | 1.1, 1.2   | —                    | Test passes confirming token keys, contrast ratios, and theme variable presence. **Quality gates ★1–★4.**                                                                                                                                                    |
| 1.6 Create theme persistence utility (localStorage + system preference detection)            | Done   | 3h     | 1.2        | —                    | Utility reads `prefers-color-scheme`, checks localStorage override, applies `data-theme` attribute before first paint (inline script in `<head>`). **Quality gates ★1–★4, #5 (unit test for utility), #10, #13.**                                            |

### Execution Strategy

```
Wave 1 ─ parallel:  1.1 (tokens)          + 1.4 (font assets)
Wave 2 ─ parallel:  1.2 (CSS vars, ←1.1)  + 1.3 (typography, ←1.1)
Wave 3 ─ parallel:  1.5 (tests, ←1.1+1.2) + 1.6 (theme util, ←1.2)
```

- **Critical path**: 1.1 → 1.2 → 1.6 (13h sequential minimum)
- **Parallelism savings**: ~4h — Wave 1 saves 2h (1.4 runs alongside 1.1), Wave 2 saves 4h (1.3 runs alongside 1.2), Wave 3 saves 2h (1.5 runs alongside 1.6)
- **Early start opportunity**: 1.4 (font assets) has zero dependencies and can begin immediately, even before 1.1

**Phase 1 Total**: ~21h

---

## Phase 2: Layout Shell & TODO Rail (Weeks 1–2)

> Build the new page shell that replaces navbar + footer with the TODO rail navigation system.
>
> **Skills**: `frontend-design` (component builds) · `arrange` (split layout composition) · `adapt` (mobile rail) · `onboard` (rail as discovery UX)

| Task                                                                                                                     | Effort | Depends On    | Skill                     | Done Criteria                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------ | ------ | ------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 Design TODO rail data model and state machine (pending → active → completed)                                         | 3h     | —             | `onboard`                 | TypeScript interface for rail items with id, label (en/es), state, sectionId; state transition logic. **Quality gates ★1–★4, #5 (unit test for state machine).**                                                                                                |
| 2.2 Build `TodoRail.tsx` React component (desktop: right sticky column)                                                  | 8h     | 2.1, 1.2      | `frontend-design`         | Renders 4 items ("Boot identity", "Compile strengths", "Unlock work log", "Open channel") with 3-state visuals; sticky positioning; WAI-ARIA nav landmark with current/completed semantics. **Quality gates ★1–★4, #5, #7, #9, #10, #12, #13.**                 |
| 2.3 Build `TodoRailMobile.tsx` (sticky top progress strip / bottom dock)                                                 | 6h     | 2.2           | `frontend-design` `adapt` | Compact horizontal progress bar that expands to show full checklist on tap; same state machine. **Quality gates ★1–★4, #5, #7 (mobile + tablet viewports), #9, #10, #13.**                                                                                      |
| 2.4 Update `Layout.astro` to new shell: remove navbar/footer wrapper, add split layout (content stage left + rail right) | 6h     | 2.2, 2.3, 1.2 | `arrange`                 | Layout renders correctly at desktop/tablet/mobile breakpoints; no navbar or footer on homepage. **Quality gates ★1–★4, #7 (all 3 viewports, both locales), #10, #12, #13.**                                                                                     |
| 2.5 Add TODO rail i18n keys to `en.json` and `es.json`                                                                   | 2h     | 2.1           | `clarify`                 | Both translation files have `todoRail.*` keys with playful developer labels in both languages. **Quality gates ★1–★4, #6.**                                                                                                                                     |
| 2.6 Wire IntersectionObserver to drive rail state from scroll position                                                   | 4h     | 2.2, 2.4      | —                         | Scrolling through sections updates rail items through pending → active → completed states; clicking rail items scrolls to corresponding section. **Quality gates ★1–★4, #5 (unit test for observer logic), #7 (scroll behavior verified via Playwright), #10.** |
| 2.7 Build theme toggle component (compact utility strip)                                                                 | 4h     | 1.6, 1.2      | `frontend-design`         | Toggle switches between "Build Mode" and "After Hours" with CSS variable swap; respects reduced motion; includes locale switcher. **Quality gates ★1–★4, #5, #7, #8, #9, #11, #13.**                                                                            |
| 2.8 Build locale switcher (integrated into utility strip)                                                                | 2h     | 2.7           | —                         | Language switch preserves current section and theme state. **Quality gates ★1–★4, #5, #7 (both locales), #10.**                                                                                                                                                 |
| 2.9 Write tests for TodoRail and Layout changes                                                                          | 4h     | 2.2, 2.3, 2.4 | —                         | Unit tests for state machine logic, i18n key parity, and component rendering. **Quality gates ★1–★4.** All component tests from 2.2–2.8 must be included.                                                                                                       |
| 2.10 **Milestone 1 gate**: Run `critique` on foundation + layout shell                                                   | 2h     | 2.9           | `critique`                | Design effectiveness review covers: rail readability, layout balance, theme coherence, mobile adaptation; issues logged and addressed before Phase 3. **Prerequisite: all tasks 1.1–2.9 have passed their quality gates.**                                      |

### Execution Strategy

```
Wave 1 ─ parallel:  2.1 (data model)         + 2.7 (theme toggle, ←1.6+1.2)
Wave 2 ─ parallel:  2.2 (TodoRail, ←2.1+1.2) + 2.5 (i18n keys, ←2.1) + 2.8 (locale switcher, ←2.7)
Wave 3 ─ sequential: 2.3 (mobile rail, ←2.2)
Wave 4 ─ sequential: 2.4 (layout shell, ←2.2+2.3+1.2)
Wave 5 ─ parallel:  2.6 (IntersectionObserver, ←2.2+2.4) + 2.9 (tests, ←2.2+2.3+2.4)
Wave 6 ─ sequential: 2.10 (critique gate, ←2.9)
```

- **Critical path**: 2.1 → 2.2 → 2.3 → 2.4 → 2.9 → 2.10 (29h sequential minimum)
- **Parallelism savings**: ~10h — Wave 1 saves 4h (2.7 runs alongside 2.1), Wave 2 saves 4h (2.5+2.8 alongside 2.2), Wave 5 saves 4h (2.6 alongside 2.9)
- **Cross-phase note**: 2.1 has no Phase 1 dependencies and can start during Phase 1 Wave 2 or 3. 2.7 only needs 1.2+1.6 and can start as soon as those complete (before the rest of Phase 1 finishes)

**Phase 2 Total**: ~41h

---

## Phase 3: Hero & Bio Sections (Week 3)

> Replace the current hero with the narrative "Hello World" opening and create the bio chapter.
>
> **Skills**: `frontend-design` (component builds) · `bolder` (hero impact) · `clarify` (copy quality) · `distill` (bio tightening) · `onboard` (hero as orientation)

| Task                                                                                                                         | Effort | Depends On    | Skill                       | Done Criteria                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------- | ------ | ------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 Build new `HeroNarrative.astro` with "Hello World" headline + translator line                                            | 6h     | Phase 1, 2.4  | `frontend-design` `bolder`  | Static HTML headline that renders without JS; monospace display type; supporting value proposition line; primary + secondary CTA. **Quality gates ★1–★4, #5, #7, #9, #10, #12, #13.**                       |
| 3.2 Add hero typing/resolve animation (client-side span splitting)                                                           | 4h     | 3.1           | —                           | "Hello World" text animates with syntax-highlight effect on load; falls back to static text if JS disabled; respects `prefers-reduced-motion`. **Quality gates ★1–★4, #7, #10, #11.**                       |
| 3.3 Integrate portrait imagery into hero (light-mode base)                                                                   | 4h     | 3.1           | —                           | Hero portrait renders via `astro:assets` `Image` with `loading="eager"`, masked reveal entry; placeholder for dark-mode variant. **Quality gates ★1–★4, #7 (all viewports), #8, #10, #13.**                 |
| 3.4 Implement hero TODO teaching moment (Boot identity resolves on load)                                                     | 3h     | 3.2, 2.6      | `onboard`                   | First TODO item visibly transitions pending → active → completed during hero load choreography. **Quality gates ★1–★4, #7 (verify choreography via Playwright), #10, #11.**                                 |
| 3.5 Create `BioChapter.astro` (editorial narrative block)                                                                    | 6h     | 2.4, Phase 1  | `frontend-design` `distill` | Short editorial bio combining current Philosophy + Vision content into tighter narrative; one portrait crop anchoring the section; stacked block reveal. **Quality gates ★1–★4, #5, #7, #8, #9, #10, #13.** |
| ~~3.6~~ ~~Retire old components~~ — **ELIMINATED by Phase 0b.3** (legacy components already deleted during codebase cleanup) | ~~2h~~ | ~~3.1, 3.5~~  | —                           | Pre-completed. Components removed in Phase 0b.3. No action needed.                                                                                                                                          |
| 3.7 Update hero and bio i18n keys in `en.json` / `es.json`                                                                   | 3h     | 3.1, 3.5      | `clarify`                   | New `heroNarrative.*` and `bio.*` keys in both files; old `hero.*`, `philosophy.*`, `vision.*` keys cleaned up; copy is sharp and recruiter-friendly. **Quality gates ★1–★4, #6.**                          |
| 3.8 Update/write tests for new hero and bio components                                                                       | 4h     | 3.1, 3.5, 3.7 | —                           | Tests validate i18n key parity, content rendering, animation fallbacks. **Quality gates ★1–★4.** Playwright verification for 3.1–3.5 must be complete before this task is considered done.                  |

### Execution Strategy

```
Wave 1 ─ parallel:  3.1 (HeroNarrative, ←Phase 1+2.4) + 3.5 (BioChapter, ←2.4+Phase 1)
Wave 2 ─ parallel:  3.2 (typing anim, ←3.1)  + 3.3 (portrait, ←3.1) + 3.7 (i18n, ←3.1+3.5)
Wave 3 ─ parallel:  3.4 (TODO teaching, ←3.2+2.6) + 3.8 (tests, ←3.1+3.5+3.7)
```

- **Critical path**: 3.1 → 3.2 → 3.4 (13h) or 3.1 → 3.7 → 3.8 (13h) — two equally long paths
- **Parallelism savings**: ~12h — Wave 1 saves 6h (3.1 and 3.5 are independent), Wave 2 saves up to 6h (three tasks run simultaneously)
- **Cross-phase note**: 3.1 and 3.5 share the same prerequisites (Phase 1 + task 2.4), making the parallel start a significant efficiency gain. 3.4 depends on 2.6 (Phase 2) — ensure IntersectionObserver wiring is complete before starting
- **Phase 0b impact**: Task 3.6 (retire old components) eliminated — legacy components already removed in Phase 0b.3

**Phase 3 Total**: ~30h (was 32h; 2h saved by eliminating task 3.6)

---

## Phase 4: Skills Section (Week 4)

> Replace the flat skill grid with an interactive competency matrix / toolbelt board.
>
> **Skills**: `frontend-design` (component build) · `arrange` (matrix grouping layout) · `adapt` (mobile card stack)

| Task                                                                                                                                     | Effort | Depends On   | Skill                       | Done Criteria                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 Design skill cluster data model (Build, Scale, AI, Ship categories)                                                                  | 3h     | —            | —                           | Restructure or map existing `skills.json` + `core-technologies.json` into 4 grouped clusters with display order. **Quality gates ★1–★4.**                                                       |
| 4.2 Build `SkillMatrix.astro` (desktop: interactive competency board)                                                                    | 8h     | 4.1, Phase 1 | `frontend-design` `arrange` | Grouped clusters with category hover/focus revealing supporting proof points; chips animate into position; keyboard + touch accessible. **Quality gates ★1–★4, #5, #7, #8, #9, #10, #12, #13.** |
| 4.3 Build mobile skill layout (compact mission tracker card stack)                                                                       | 4h     | 4.2          | `adapt`                     | Stacked category cards with expandable detail; touch-friendly affordances. **Quality gates ★1–★4, #5, #7 (mobile + tablet viewports), #9, #10, #13.**                                           |
| 4.4 Add skills section i18n keys                                                                                                         | 2h     | 4.1          | `clarify`                   | `skills.*` keys updated for new category labels and proof point text in both locales. **Quality gates ★1–★4, #6.**                                                                              |
| ~~4.5~~ ~~Retire `SkillGrid` and `Timeline`~~ — **ELIMINATED by Phase 0b.3** (legacy components already deleted during codebase cleanup) | ~~1h~~ | ~~4.2~~      | —                           | Pre-completed. Components removed in Phase 0b.3. No action needed.                                                                                                                              |
| 4.6 Write tests for SkillMatrix                                                                                                          | 3h     | 4.2, 4.4     | —                           | Tests for rendering, category filtering, i18n parity. **Quality gates ★1–★4.** Playwright verification for 4.2–4.3 must be complete before this task is done.                                   |

### Execution Strategy

```
Wave 1 ─ sequential: 4.1 (data model)
Wave 2 ─ parallel:   4.2 (SkillMatrix, ←4.1+Phase 1) + 4.4 (i18n keys, ←4.1)
Wave 3 ─ parallel:   4.3 (mobile layout, ←4.2) + 4.6 (tests, ←4.2+4.4)
```

- **Critical path**: 4.1 → 4.2 → 4.3 (15h sequential minimum)
- **Parallelism savings**: ~4h — Wave 2 saves 2h (4.4 alongside 4.2), Wave 3 saves 3h (4.6 alongside 4.3)
- **Cross-phase note**: Phase 4 and Phase 5 share no direct dependencies — they can run fully in parallel once Phase 2 (Milestone 1) is complete. This is the largest parallelism opportunity in the plan
- **Phase 0b impact**: Task 4.5 (retire old components) eliminated — `SkillGrid` and `Timeline` already removed in Phase 0b.3

**Phase 4 Total**: ~20h (was 21h; 1h saved by eliminating task 4.5)

---

## Phase 5: Work Log Section (Weeks 4–5)

> Merge FeaturedProjects + Timeline into a unified Work Log chapter.
>
> **Skills**: `frontend-design` (component builds) · `arrange` (cascade layout) · `distill` (strip to essentials)

| Task                                                                                                                             | Effort | Depends On    | Skill                       | Done Criteria                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 Design Work Log data model (merged projects + experience milestones)                                                         | 3h     | —             | `distill`                   | Interface combining `projects.json` entries with `experience.json` roles into chronological or narrative order; one highlighted case study. **Quality gates ★1–★4.**                                                          |
| 5.2 Build `WorkLog.astro` section with cascade layout                                                                            | 8h     | 5.1, Phase 1  | `frontend-design` `arrange` | Project cards + role milestone markers in combined sectional layout; cascade reveal tied to scroll; connector from active TODO item to highlighted work area. **Quality gates ★1–★4, #5, #7, #8, #9, #10, #12, #13.**         |
| 5.3 Redesign `ProjectCard.astro` with metadata tray hover                                                                        | 4h     | 5.2           | `frontend-design`           | Card hover expands metadata tray (role, duration, tech stack) instead of simple lift; directional motion tied to pointer entry. **Quality gates ★1–★4, #5, #7 (hover verified via Playwright), #9, #10, #13.**                |
| 5.4 Ensure case study links remain functional (`/[lang]/projects/[slug]`)                                                        | 2h     | 5.2           | —                           | Case study pages still accessible via standard links from Work Log cards. **Quality gates ★1–★4, #7 (navigate links via Playwright, verify no 404s), #10.**                                                                   |
| 5.5 Add Work Log i18n keys                                                                                                       | 2h     | 5.1           | `clarify`                   | `workLog.*` keys in both locales. **Quality gates ★1–★4, #6.**                                                                                                                                                                |
| ~~5.6~~ ~~Retire `FeaturedProjects`~~ — **ELIMINATED by Phase 0b.3** (legacy components already deleted during codebase cleanup) | ~~1h~~ | ~~5.2~~       | —                           | Pre-completed. Components removed in Phase 0b.3. No action needed.                                                                                                                                                            |
| 5.7 Write tests for WorkLog and updated ProjectCard                                                                              | 3h     | 5.2, 5.3, 5.5 | —                           | Tests validate rendering, data integration, i18n parity. **Quality gates ★1–★4.** Playwright verification for 5.2–5.4 must be complete before this task is done.                                                              |
| 5.8 **Milestone 2 gate**: Run `critique` on all core sections                                                                    | 2h     | 5.7, 4.6, 3.8 | `critique`                  | Design effectiveness review covers: hero impact, bio readability, skill matrix usability, work log information density; issues addressed before Phase 6. **Prerequisite: all tasks 3.1–5.7 have passed their quality gates.** |

### Execution Strategy

```
Wave 1 ─ sequential: 5.1 (data model)
Wave 2 ─ parallel:   5.2 (WorkLog, ←5.1+Phase 1) + 5.5 (i18n keys, ←5.1)
Wave 3 ─ parallel:   5.3 (ProjectCard, ←5.2)      + 5.4 (case study links, ←5.2)
Wave 4 ─ sequential: 5.7 (tests, ←5.2+5.3+5.5)
Wave 5 ─ sequential: 5.8 (critique gate, ←5.7+4.6+3.8) ⚠ cross-phase blocker
```

- **Critical path**: 5.1 → 5.2 → 5.3 → 5.7 → 5.8 (20h sequential minimum)
- **Parallelism savings**: ~4h — Wave 2 saves 2h (5.5 alongside 5.2), Wave 3 saves 2h (5.4 alongside 5.3)
- **Cross-phase note**: Phases 4 and 5 are independently parallelizable — 5.1 can start at the same time as 4.1. However, **5.8 (Milestone 2 gate) blocks until Phase 3 tests (3.8) and Phase 4 tests (4.6) also pass**, making it a convergence point for three parallel streams
- **Phase 0b impact**: Task 5.6 (retire old component) eliminated — `FeaturedProjects` already removed in Phase 0b.3

**Phase 5 Total**: ~24h (was 25h; 1h saved by eliminating task 5.6)

---

## Phase 6: Contact Section & Page Completion (Week 5)

> Rebuild Contact as the final narrative chapter and wire up the full page.
>
> **Skills**: `frontend-design` (component build) · `clarify` (CTA copy) · `delight` (completion feedback) · `harden` (i18n edge cases)

| Task                                                                                                                        | Effort | Depends On              | Skill                       | Done Criteria                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 Build new `ContactChapter.astro` (final unresolved task narrative)                                                      | 6h     | Phase 1, 2.4            | `frontend-design` `delight` | Last TODO item ("Open channel") feels like "ready to start"; direct email CTA, social links, resume entry point; completion feedback toast on email copy. **Quality gates ★1–★4, #5, #7, #8, #9, #10, #12, #13.**                                                    |
| 6.2 Integrate resume access into Contact section                                                                            | 2h     | 6.1                     | —                           | Resume link/download visible within Contact chapter; links to existing `/[lang]/resume` page. **Quality gates ★1–★4, #7 (verify link navigation via Playwright), #10.**                                                                                              |
| ~~6.3~~ ~~Retire old `Contact`~~ — **ELIMINATED by Phase 0b.3** (legacy components already deleted during codebase cleanup) | ~~1h~~ | ~~6.1~~                 | —                           | Pre-completed. Components removed in Phase 0b.3. No action needed.                                                                                                                                                                                                   |
| 6.4 Wire full page section order in `[lang]/index.astro`                                                                    | 4h     | 3.1, 3.5, 4.2, 5.2, 6.1 | —                           | Homepage renders: HeroNarrative → BioChapter → SkillMatrix → WorkLog → ContactChapter; all sections have `class="fade-section"` and unique `id` matching TODO rail targets. **Quality gates ★1–★4, #7 (full-page screenshots all viewports/locales), #8, #10, #13.** |
| 6.5 Add Contact i18n keys and clean up retired keys                                                                         | 2h     | 6.1                     | `clarify`                   | `contact.*` keys updated; orphaned keys from retired components removed from both locales; CTA microcopy is action-oriented and clear. **Quality gates ★1–★4, #6.**                                                                                                  |
| 6.6 Ensure non-homepage pages still work (resume, case studies)                                                             | 3h     | 6.4                     | `harden`                    | `/[lang]/resume` and `/[lang]/projects/[slug]` render correctly; may use a simplified layout without TODO rail (or rail disabled); Spanish text expansion tested. **Quality gates ★1–★4, #7 (Playwright navigates all sub-pages), #10, #13.**                        |
| 6.7 Write tests for ContactChapter                                                                                          | 2h     | 6.1, 6.5                | —                           | Tests validate rendering, CTA functionality, i18n parity. **Quality gates ★1–★4.** Playwright verification for 6.1–6.4 must be complete before this task is done.                                                                                                    |
| 6.8 **Milestone 3 gate**: Run `critique` on complete page assembly                                                          | 2h     | 6.7                     | `critique`                  | Full-page design review: section flow, visual rhythm, narrative coherence, TODO rail pacing; issues addressed before animation work begins. **Prerequisite: all tasks 6.1–6.7 have passed their quality gates.**                                                     |

### Execution Strategy

```
Wave 1 ─ sequential: 6.1 (ContactChapter, ←Phase 1+2.4)
Wave 2 ─ parallel:   6.2 (resume access, ←6.1) + 6.5 (i18n, ←6.1)
Wave 3 ─ parallel:   6.4 (page wiring, ←3.1+3.5+4.2+5.2+6.1) + 6.7 (tests, ←6.1+6.5)
Wave 4 ─ sequential: 6.6 (sub-page QA, ←6.4)
Wave 5 ─ sequential: 6.8 (critique gate, ←6.7)
```

- **Critical path**: 6.1 → 6.5 → 6.7 → 6.8 (12h) or 6.1 → 6.4 → 6.6 (13h) — the page-wiring path is slightly longer
- **Parallelism savings**: ~4h — Wave 2 saves 2h (two tasks alongside each other), Wave 3 saves 2h (6.7 alongside 6.4)
- **Cross-phase blockers**: 6.4 is the most dependency-heavy task in the entire plan — it requires completed components from Phases 3, 4, 5, and 6. This is why Phases 4+5 must finish before full page assembly
- **Early start opportunity**: 6.1 only depends on Phase 1 + task 2.4 (not on Phases 3–5), so ContactChapter can be built in parallel with Phases 4 and 5
- **Phase 0b impact**: Task 6.3 (retire old Contact) eliminated — `Contact.astro` already removed in Phase 0b.3

**Phase 6 Total**: ~21h (was 22h; 1h saved by eliminating task 6.3)

---

## Phase 7: Animation & Interaction Polish (Week 6)

> Implement chapter-specific motion families and micro-interactions.
>
> **Skills**: `animate` (motion implementation) · `overdrive` (ambitious effects) · `delight` (micro-interaction joy) · `quieter` (tone down if overcorrected)

| Task                                                                                                            | Effort | Depends On    | Skill               | Done Criteria                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------- | ------ | ------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 7.1 Hero load choreography (TODO rail appears → Hello World types → portrait reveals → Boot identity completes) | 6h     | 3.2, 3.4, 2.6 | `animate`           | Load sequence executes in order; no layout shift; reduced-motion fallback shows instant states. **Quality gates ★1–★4, #7 (record load sequence via Playwright), #10, #11, #13.**                                                                |
| 7.2 TODO rail micro-interactions (cursor sweep, checkmark draw, strike-through)                                 | 6h     | 2.2, 2.6      | `delight` `animate` | Active item gets cursor-like sweep; check draws with overshoot; completed items get left-to-right strike-through; all CSS/SVG based. **Quality gates ★1–★4, #7, #9, #10, #11.**                                                                  |
| 7.3 Chapter-specific reveal families                                                                            | 8h     | 6.4           | `animate`           | Hero types in; Bio wipes on; Skills assemble; Work cascades; Contact resolves — each distinct but within one system. **Quality gates ★1–★4, #7 (scroll through all sections via Playwright), #10, #11, #13.**                                    |
| 7.4 Theme toggle portrait sequence (frame-by-frame transformation)                                              | 6h     | 2.7, 3.3      | `overdrive`         | Switching to "After Hours" triggers short (4–8 frame) image sequence ending on sunglasses; reverse on return; falls back to instant swap for reduced motion; frames lazy-loaded on first toggle. **Quality gates ★1–★4, #7, #8, #10, #11, #13.** |
| 7.5 Theme toggle surface choreography (palette + accent swap in ≤650ms)                                         | 4h     | 2.7, 1.2      | `animate`           | CSS variable transitions animate surfaces, accents, and text in one coordinated moment; no layout shift. **Quality gates ★1–★4, #7, #8, #10, #11.**                                                                                              |
| 7.6 Project card directional hover + metadata tray expand                                                       | 3h     | 5.3           | `delight`           | Pointer-entry-aware motion; keyboard focus mirrors intent. **Quality gates ★1–★4, #7 (hover interaction via Playwright), #9, #10, #11.**                                                                                                         |
| 7.7 Skills chip pulse/align on category hover                                                                   | 3h     | 4.2           | `animate`           | Chips respond to category focus with subtle alignment animation. **Quality gates ★1–★4, #7, #10, #11.**                                                                                                                                          |
| 7.8 Contact completion feedback (email copy toast, CTA states)                                                  | 2h     | 6.1           | `delight`           | Copy email action shows accessible toast; CTA has pressed/success state. **Quality gates ★1–★4, #7, #9, #10, #11.**                                                                                                                              |
| 7.9 `prefers-reduced-motion` full pass                                                                          | 3h     | 7.1–7.8       | `animate`           | Every animation replaced with instant state + short opacity transition; checklist logic and theme semantics preserved. **Quality gates ★1–★4, #7 (Playwright with reduced-motion emulation), #11.**                                              |
| 7.10 Run `quieter` to calibrate animation intensity                                                             | 2h     | 7.9           | `quieter`           | Review all animations for aggressiveness; tone down any that feel overwhelming while preserving delight; elegance over spectacle. **Quality gates ★1–★4, #7 (final animation screenshots), #10, #13.**                                           |

### Execution Strategy

```
Wave 1 ─ parallel:   7.1 (hero choreography, ←3.2+3.4+2.6)
                     7.2 (rail micro-interactions, ←2.2+2.6)
                     7.3 (chapter reveals, ←6.4)
                     7.4 (portrait sequence, ←2.7+3.3)
                     7.5 (theme surface anim, ←2.7+1.2)
                     7.6 (card hover, ←5.3)
                     7.7 (skills chip anim, ←4.2)
                     7.8 (contact feedback, ←6.1)
Wave 2 ─ sequential: 7.9 (reduced-motion pass, ←7.1–7.8)
Wave 3 ─ sequential: 7.10 (quieter calibration, ←7.9)
```

- **Critical path**: Wave 1 (longest task is 7.3 at 8h) → 7.9 → 7.10 (13h sequential minimum)
- **Parallelism savings**: ~25h — **all 8 animation tasks in Wave 1 are fully independent** and can run simultaneously. This is the most parallelizable phase in the plan. Serial execution would take 38h; parallel execution reduces Wave 1 to ~8h (limited by the longest task)
- **Sequencing constraint**: 7.9 (reduced-motion) and 7.10 (quieter) are strictly sequential gatekeepers — they review and adjust everything from Wave 1, so no animation task can skip them

**Phase 7 Total**: ~43h

---

## Phase 8: Responsive QA, Accessibility & Performance (Weeks 7–8)

> Validate across breakpoints, audit accessibility, optimize for production.
>
> **Skills**: `audit` (comprehensive audit) · `adapt` (responsive QA) · `optimize` (performance) · `normalize` (design system consistency) · `polish` (final detail pass) · `harden` (resilience)

| Task                                                                                | Effort | Depends On | Skill            | Done Criteria                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------- | ------ | ---------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.1 Desktop QA (≥1024px) — all sections, both themes, both locales                  | 4h     | Phase 7    | `adapt`          | No layout breaks, TODO rail functional, animations smooth, both themes render correctly in en + es. **Playwright full-page screenshots at 1280px for all 4 combinations (en/es × build/after-hours).**                                                                             |
| 8.2 Tablet QA (768–1023px) — compressed rail, simplified overlaps                   | 4h     | Phase 7    | `adapt`          | Narrower rail readable; section transitions simpler; no horizontal overflow. **Playwright full-page screenshots at 768px for all 4 combinations.**                                                                                                                                 |
| 8.3 Mobile QA (320–767px) — mission tracker mode, chapter cards                     | 4h     | Phase 7    | `adapt` `harden` | Sticky progress dock works; all content accessible; touch targets ≥44px; Spanish expansion doesn't break layout. **Playwright full-page screenshots at 375px for all 4 combinations.**                                                                                             |
| 8.4 Accessibility audit (keyboard nav, screen reader, contrast, focus rings)        | 6h     | Phase 7    | `audit`          | All interactive elements keyboard-reachable; focus indicators visible and styled; ARIA landmarks correct; WCAG AA contrast met in both themes. **Run axe-core or Lighthouse accessibility audit programmatically; score ≥90.**                                                     |
| 8.5 Performance optimization (Lighthouse ≥90, image optimization, animation budget) | 6h     | Phase 7    | `optimize`       | Lighthouse Performance/Accessibility/SEO ≥90; hero portrait preloaded; supplemental photos lazy-loaded; no scroll jank. **Lighthouse CI scores recorded and committed.**                                                                                                           |
| 8.6 SEO validation (semantic HTML, JSON-LD, OG tags, sitemap)                       | 3h     | 6.4        | —                | Heading hierarchy correct; JSON-LD still present; OG tags updated for new content; sitemap generates cleanly. **Quality gates ★1–★4, #10, #13.**                                                                                                                                   |
| 8.7 Cross-browser testing (Chrome, Firefox, Safari, Edge)                           | 4h     | 8.1–8.3    | —                | No critical visual or functional differences across evergreen browsers. **Playwright screenshots in Chromium, Firefox, and WebKit engines.**                                                                                                                                       |
| 8.8 Run `normalize` to verify design system consistency                             | 3h     | 8.1–8.3    | `normalize`      | All components use design tokens consistently; no hardcoded colors/spacing outside token system; theme switching uniform across sections. **Quality gates ★1–★4.**                                                                                                                 |
| 8.9 Update/fix all broken tests from component changes                              | 6h     | Phases 3–7 | —                | All 21+ test files pass; new tests added for new components; `pnpm build` succeeds cleanly. **`pnpm test` exits 0; `pnpm build` exits 0; no `.skip` or `.only` in test files.**                                                                                                    |
| 8.10 Run `polish` for final detail pass                                             | 3h     | 8.8, 8.9   | `polish`         | Alignment, spacing, consistency, and micro-detail issues fixed; pixel-level refinements; production-ready quality. **Quality gates ★1–★4, #7 (final golden screenshots), #8, #13.**                                                                                                |
| 8.11 Final lint + format pass                                                       | 1h     | 8.10       | —                | `pnpm lint` and `pnpm format` pass with no errors. **Zero ESLint warnings (not just errors). Prettier produces no diff.**                                                                                                                                                          |
| 8.12 **Milestone 4 gate**: Final `critique` before production deploy                | 2h     | 8.10       | `critique`       | Final design review: overall experience quality, narrative flow, theme coherence, interaction delight; sign-off for launch. **Prerequisite: all tasks 7.1–8.11 have passed their quality gates. Full Playwright screenshot set committed to `.screenshots/` as release baseline.** |
| 8.13 Production deploy to Netlify                                                   | 2h     | 8.1–8.12   | —                | Site live at juanelojga.com; cache headers correct; redirects working; no console errors                                                                                                                                                                                           |

### Execution Strategy

```
Wave 1 ─ parallel:   8.1 (desktop QA, ←Phase 7)
                     8.2 (tablet QA, ←Phase 7)
                     8.3 (mobile QA, ←Phase 7)
                     8.4 (accessibility audit, ←Phase 7)
                     8.5 (performance opt, ←Phase 7)
                     8.6 (SEO validation, ←6.4)
                     8.9 (fix broken tests, ←Phases 3–7)
Wave 2 ─ parallel:   8.7 (cross-browser, ←8.1–8.3) + 8.8 (normalize, ←8.1–8.3)
Wave 3 ─ sequential: 8.10 (polish, ←8.8+8.9)
Wave 4 ─ parallel:   8.11 (lint/format, ←8.10) + 8.12 (critique gate, ←8.10)
Wave 5 ─ sequential: 8.13 (deploy, ←8.1–8.12)
```

- **Critical path**: Wave 1 (longest: 8.9 at 6h or 8.5 at 6h) → 8.8 (3h) → 8.10 (3h) → 8.12 (2h) → 8.13 (2h) = 16h sequential minimum
- **Parallelism savings**: ~22h — Wave 1 runs 7 tasks simultaneously (28h serial → ~6h parallel), Wave 2 saves 3h (8.7 alongside 8.8), Wave 4 saves 1h (8.11 alongside 8.12)
- **Key constraint**: 8.10 (polish) is the convergence point — it needs both the normalize pass (8.8) and test fixes (8.9) complete. If test fixes run long, they block the entire polish → deploy pipeline
- **Risk mitigation**: Start 8.9 (test fixes) early — it can begin as soon as component phases complete, even before Phase 7 finishes, since it addresses test breakage from Phases 3–7

**Phase 8 Total**: ~48h

---

## Dependencies Map

### Phase-Level Dependency Graph

```
Phase 0 (teach-impeccable) ──> Phase 0b (Construction + Cleanup) ───────────────┐
  ├── 0b.1 Construction Page ──> 0b.2 Deploy to Production                      │
  ├── 0b.1 ──> 0b.3 Remove Legacy Components                                   │
  ├── 0b.3 ──> 0b.4 Remove Tests + 0b.5 Clean i18n/CSS + 0b.6 Clean Assets    │
  └── 0b.7 Verify Build & Sub-Pages (←0b.3–0b.6)                               │
                                                                                │
Phase 1 (Tokens/Theme) ─────────────────────────────────────────────────────────┐│
  ├── 1.1 Tokens ──> 1.2 CSS Vars ──> 1.6 Theme Persistence                    ││
  ├── 1.1 ──> 1.3 Typography ──> 1.5 Token Tests                               ││
  └── 1.4 Fonts (parallel)                                                      ││
                                                                                ││
Phase 2 (Layout/Rail) ──────────────────────────────────────────────────────────┐││
  ├── 2.1 Data Model ──> 2.2 TodoRail ──> 2.3 Mobile Rail                      │││
  ├── 2.2 + 1.2 ──> 2.4 Layout Shell ──> 2.6 IntersectionObserver             │││
  ├── 1.6 ──> 2.7 Theme Toggle ──> 2.8 Locale Switcher                        │││
  └── 2.9 Tests ──> 2.10 critique gate (Milestone 1)                           │││
                                                                               │││
Phase 3 (Hero/Bio) ─────────────────────────────────────────────────────┐      │││
  ├── 3.1 HeroNarrative ──> 3.2 Typing Anim ──> 3.4 TODO Teaching     │      │││
  ├── 3.1 ──> 3.3 Portrait ───────────────────────────────────────┐    │      │││
  ├── 3.5 BioChapter ──> 3.7 i18n ──> 3.8 Tests                  │    │      │││
  └── (3.6 eliminated — cleaned in Phase 0b) ────────────────────┘    │      │││
                                                                      │      │││
Phase 4 (Skills) & Phase 5 (Work Log) — FULLY PARALLEL STREAMS ──────┐│      │││
  ├── 4.1–4.4+4.6 (Skills, 4.5 eliminated) ─────────────────────>─┐  ││      │││
  ├── 5.1–5.5+5.7 (Work Log, 5.6 eliminated) ───────────────────>─┤  ┌──────┘││
  │                                                                ├──┤      │││
  │   6.1 (Contact, ←Phase 1+2.4) — EARLY START ─────────────────>┤  │      │││
  │                                                                │  │      │││
  └── 5.8 critique gate (M2, ←3.8+4.6+5.7) ──────────────────────>┘  │      │││
                                                                      │      │││
Phase 6 (Contact + Page Wiring, 6.3 eliminated) ──> 6.8 (M3) ───────>│      │││
  ──────> Phase 7 (Animation — 8 PARALLEL tracks) ──> 7.9 ──> 7.10   │      │││
  ──────> Phase 8 (QA — 7 PARALLEL tracks) ──> 8.10 ──> 8.12 ──> 8.13│││
```

### Cross-Phase Parallelism Opportunities

These are tasks that can start **before their phase officially begins**, reducing the overall timeline:

| Task                 | Can Start During | Prerequisite             | Savings |
| -------------------- | ---------------- | ------------------------ | ------- |
| 2.1 (data model)     | Phase 1 Wave 2   | No Phase 1 dependency    | ~4h     |
| 2.7 (theme toggle)   | Phase 1 Wave 3   | Only needs 1.2 + 1.6     | ~2h     |
| 6.1 (ContactChapter) | Phase 3 start    | Only needs Phase 1 + 2.4 | ~8h     |
| 8.9 (test fixes)     | Phase 7          | Phases 3–6 components    | ~6h     |

### Critical Path (End-to-End)

```
0.1 ─> 0.2 ─> 0b.1 ─> 0b.3 ─> 0b.7 ─> 1.1 ─> 1.2 ─> 2.2 ─> 2.3 ─> 2.4 ─> 2.9 ─> 2.10 ─>
─> 3.1 ─> 3.2 ─> 3.4 ─> ... ─> 6.4 ─> 6.8 ─> 7.3 ─> 7.9 ─> 7.10 ─>
─> 8.1 ─> 8.8 ─> 8.10 ─> 8.12 ─> 8.13
```

**Critical path duration**: ~116h (out of ~261h total — Phase 0b adds ~6h to the critical path but eliminates 5h from later phases)

The remaining ~145h runs on parallel tracks. Maximum parallelism reduces the elapsed calendar time from ~261h serial to ~116h effective.

### Milestone Convergence Points

These are the 5 synchronization barriers where all parallel streams must converge:

| Milestone | Gate Task | Waits For                                     | Blocks         |
| --------- | --------- | --------------------------------------------- | -------------- |
| M0        | 0b.7      | Phase 0b (0b.1–0b.6)                          | Phase 1        |
| M1        | 2.10      | All of Phase 1 + Phase 2 (2.1–2.9)            | Phases 3, 4, 5 |
| M2        | 5.8       | Phase 3 (3.8) + Phase 4 (4.6) + Phase 5 (5.7) | Phase 6.4+     |
| M3        | 6.8       | Phase 6 (6.1–6.7)                             | Phase 7        |
| M4        | 8.12      | Phase 7 + Phase 8 (8.1–8.11)                  | Deploy (8.13)  |

Phases 4 and 5 can proceed in parallel once Phase 2 is complete, but must finish before Phase 6.4 (page assembly).

---

## Risks & Mitigation

| Risk                                                  | Impact | Probability | Mitigation                                                                                                                                                                                                                                          |
| ----------------------------------------------------- | ------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portrait photography assets not ready                 | High   | Medium      | Use placeholder images for development; design portrait containers to accept any same-dimension image pair; block only Phase 7.4 (frame sequence) on actual assets                                                                                  |
| TODO rail feels gimmicky instead of useful            | High   | Medium      | Implement 3-state logic early (Proposal 1) and user-test with real scrolling; simplify labels if playful phrasing confuses recruiters                                                                                                               |
| Animation performance issues on low-end devices       | Medium | Medium      | Set strict animation budget (opacity + transform only); test on throttled CPU early in Phase 7; have reduced-motion as full fallback                                                                                                                |
| Spanish text expansion breaks layouts                 | Medium | High        | Test with Spanish locale from Phase 2 onward; use flexible containers (`min-width` not fixed `width`) for TODO labels and CTAs                                                                                                                      |
| Scope creep from design direction proposals           | High   | High        | Prioritize Proposals 1, 3, 4, 9, 10 per design doc; defer Proposals 2, 5, 6, 7, 8 to post-launch iteration                                                                                                                                          |
| Existing tests break during component retirement      | Low    | High        | Update tests alongside component changes in each phase (not deferred to Phase 8); run `pnpm test` after each phase                                                                                                                                  |
| Theme toggle portrait sequence too heavy              | Medium | Medium      | Limit to 4–8 optimized WebP frames; lazy-load on first toggle; disable for reduced motion; measure transfer size                                                                                                                                    |
| Case study and resume pages break from layout changes | Medium | Medium      | Keep sub-pages on a simplified layout variant without TODO rail; test in Phase 6.6                                                                                                                                                                  |
| Quality gate enforcement slows velocity               | Low    | Medium      | Gates catch issues early, reducing rework in later phases. Automate lint/format/type-check via pre-commit hook. Batch Playwright screenshots per phase, not per micro-task. Budget ~15% overhead for quality gates, offset by fewer late-stage bugs |
| Playwright visual regressions accumulate unnoticed    | Medium | Medium      | Commit `.screenshots/` baseline at each milestone gate. Review diffs in PR. Name files consistently (`{component}-{viewport}-{locale}-{theme}.png`) for easy comparison                                                                             |

---

## Resource Allocation

| Focus Area             | Hours | Weeks Active | Key Deliverables                                                                                          |
| ---------------------- | ----- | ------------ | --------------------------------------------------------------------------------------------------------- |
| Design context setup   | 2h    | Pre-work     | `teach-impeccable` context file, design guidelines aligned to design direction                            |
| Design system & tokens | 21h   | Week 1       | Tailwind config, CSS variables, typography scale, theme persistence                                       |
| Layout & navigation    | 41h   | Weeks 1–2    | TODO rail (desktop + mobile), layout shell, theme/locale toggles, Milestone 1 critique                    |
| Content sections       | 80h   | Weeks 3–5    | Hero, Bio, Skills, Work Log, Contact — all with i18n, tests, and Milestone 2–3 gates                      |
| Animation & motion     | 43h   | Week 6       | Load choreography, rail micro-interactions, chapter reveals, theme portrait sequence, quieter calibration |
| QA, polish & launch    | 48h   | Weeks 7–8    | Audit, normalize, optimize, polish cascade; responsive QA; Milestone 4 critique; deploy                   |
| Design quality gates   | 8h    | Milestones   | 4 `critique` reviews (end of M1, M2, M3, M4) ensuring design quality throughout                           |

**Total Effort**: ~255h across 8 weeks (~32h/week)

_Note: ~18h added compared to the pre-skill baseline (237h) for design quality activities: Phase 0 setup (2h), milestone critique gates (4×2h = 8h), quieter calibration (2h), normalize pass (3h), polish pass (3h)._

---

## Estimation Summary

| Estimate Type       | Hours     |
| ------------------- | --------- |
| Optimistic (O)      | 205h      |
| Most Likely (M)     | 255h      |
| Pessimistic (P)     | 330h      |
| **Expected (PERT)** | **~261h** |

Formula: $(205 + 4 \times 255 + 330) / 6 ≈ 261h$

Includes ~25% buffer over optimistic baseline. The ~18h skill integration overhead is offset by higher first-pass design quality, reducing rework in later phases.

---

## Weekly Checkpoints

- **Pre-work**: `teach-impeccable` run; design context file reviewed and aligned with DESIGN_DIRECTION doc
- **End of Week 1**: Tokens defined (`extract` + `colorize`), typography set (`typeset`), theme switching works, fonts loaded, rail skeleton renders
- **End of Week 2**: Full layout shell with functional TODO rail on all breakpoints; theme + locale toggles working; **Milestone 1 critique gate passed**
- **End of Week 3**: Hero (`bolder` + `frontend-design`) and Bio (`distill`) sections complete with i18n (`clarify`); old components retired
- **End of Week 4**: Skills section live (`arrange` + `adapt`); Work Log section in progress
- **End of Week 5**: All content sections complete; full page wired; case study/resume pages verified (`harden`); **Milestone 2 + 3 critique gates passed**
- **End of Week 6**: All animations implemented (`animate` + `overdrive`); `quieter` calibration done; reduced-motion pass complete
- **End of Week 7**: QA complete (`adapt`); `audit` done; `normalize` verified; `optimize` pass complete
- **End of Week 8**: `polish` pass done; **Milestone 4 final critique passed**; production deploy

---

## Post-Launch Iteration Candidates

These items from the design direction are intentionally deferred from the first release:

- **Proposal 5**: Connector logic (line traces) between TODO rail and active content chapter
- **Proposal 6**: Editorial photo fragments (cropped details, layered portrait slices)
- **Proposal 7**: Dominant CTA language system ("Start a build" / "Open a conversation")
- **Proposal 8**: Enhanced semantic HTML for LLM/bot discoverability (baseline covered; advanced layering deferred)
- Lead capture form on homepage (explicitly excluded from first release per design direction)
- Advanced scroll-pinning behaviors (hero pin while first TODO resolves)
- Skills chip clustering animation on category hover (simplified version in Phase 4; full physics-based version deferred)
