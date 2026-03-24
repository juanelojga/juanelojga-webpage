# Implementation Plan: Inheritance Case Study Section

**Goal**: Add a reusable inheritance-themed section to project detail pages that interprets each project through OOP lineage — parent class, inherited traits, overrides, and specialized outcomes — as defined in [DESIGN_DIRECTION_case-study-inheritance.md](DESIGN_DIRECTION_case-study-inheritance.md).

**Timeline**: 4 weeks (solo developer)

**Team**: Juan Almeida (full-stack engineer, sole contributor)

**Constraints**:

- Section lives inside `src/pages/[lang]/projects/[slug].astro` — additive, not a page replacement
- Must reuse the existing dual-theme system (`data-theme="build"` / `data-theme="after-hours"`) and design tokens from `src/css/global.css`
- After Hours is the default visual target, but Build Mode must be fully designed (not inverted)
- React for interactive components only (node activation, trait linking, override spotlighting); Astro for static layout
- All project data from `src/content/projects.json` — schema extension via optional `inheritanceStory` object
- Bilingual EN/ES with existing dual i18n pattern (prop-driven for case-study components)
- WCAG AA minimum; reduced-motion alternatives for all animations
- Every new file (component, utility, type) requires a corresponding test file
- SOLID and DRY: single-responsibility components, shared utilities extracted, no duplicated logic

---

## Definition of Done — Quality Gate Checklist

Inherits the same gate structure from the [main redesign plan](IMPLEMENTATION_PLAN_redesign.md). Every task producing or modifying a component, utility, or interactive behavior must meet all applicable checks. Summary of mandatory gates:

| #   | Check                              | Applies To                        | How to Verify                                                                                                                                      |
| --- | ---------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| ★1  | **Linter passes**                  | All code changes                  | `npm run lint` exits 0. No `eslint-disable` without justification.                                                                                 |
| ★2  | **Formatter passes**               | All code changes                  | `npm run format` produces no diff. Prettier: single quotes, semicolons, 2-space indent, `arrowParens: "avoid"`, 100 char width.                    |
| ★3  | **TypeScript compiles**            | All `.ts`/`.tsx`/`.astro` changes | `npm run build` succeeds with no type errors. No `@ts-ignore` or `as any` unless justified.                                                        |
| ★4  | **Existing tests pass**            | All code changes                  | `npm test` (Vitest) exits 0. No `.skip` or temporarily disabled tests.                                                                             |
| 5   | **Unit/integration test written**  | New components and utilities      | Every new component (`.astro`, `.tsx`) has a test in `src/components/__tests__/`. Every new utility has a test. Coverage target: ≥80%.             |
| 6   | **i18n parity verified**           | Components with translated text   | Both `en.json` and `es.json` have identical key structures for new/changed keys. Test asserts key parity programmatically.                         |
| 7   | **Playwright visual verification** | All visual components             | Screenshots at desktop (1280px), tablet (768px), mobile (375px) in both locales (`/en/projects/[slug]`, `/es/projects/[slug]`). No broken layouts. |
| 8   | **Both-theme verification**        | Themed components                 | Screenshots with `data-theme="build"` and `data-theme="after-hours"`. After Hours is primary target quality; Build Mode must hold parity.          |
| 9   | **Accessibility baseline**         | Interactive/visual components     | Keyboard navigation works; focus indicators visible; ARIA roles/labels present; no Lighthouse Accessibility regression below 90.                   |
| 10  | **No console errors**              | All components                    | Browser console shows zero errors during Playwright runs.                                                                                          |
| 11  | **Reduced motion respected**       | Animated components               | With `prefers-reduced-motion: reduce`, animations replaced with instant state or short opacity fade. Verified via Playwright emulation.            |
| 12  | **No dead code introduced**        | All code changes                  | No unused imports, unreachable code, or orphaned files.                                                                                            |
| 13  | **Build succeeds**                 | All changes (final gate)          | `npm run build` completes. No SSR/hydration mismatches.                                                                                            |

### Enforcement Rules

1. **Tests are not optional.** A component without a test is not done.
2. **Playwright runs are not optional.** Screenshots serve as visual regression baselines.
3. **Lint/format/type-check run on every task**, not at phase end.
4. **Failed checks block progress.** Fix before moving to the next task.

---

## Design Skill Integration Strategy

| Skill             | Primary Phase(s) | Purpose in This Project                                                                              |
| ----------------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `frontend-design` | Phases 2–4       | Build each new component (InheritanceSection shell, panels, trait grid, override cards, lineage map) |
| `distill`         | Phase 2          | Keep the inheritance story readable — avoid UML density or academic abstraction                      |
| `colorize`        | Phase 2          | After Hours as default mood; parent vs child surface distinction; override accent treatment          |
| `arrange`         | Phase 2          | Desktop split composition (narrative left, lineage visualization right); mobile vertical stack       |
| `adapt`           | Phases 2, 5      | Mobile vertical inheritance stack; tablet compressed lineage; responsive trait cards                 |
| `clarify`         | Phase 1          | Sharpen inheritance labels, override titles, and return CTA copy in both locales                     |
| `animate`         | Phase 3          | Connector draw, trait assembly, override activation, lineage map node highlighting                   |
| `delight`         | Phase 3          | Trait-to-proof linking hover, override spotlight, parent-to-child reveal                             |
| `quieter`         | Phase 3          | Calibrate animation intensity after implementation — elegance over spectacle                         |
| `harden`          | Phase 4          | Spanish text expansion on trait chips, lineage labels; touch/keyboard parity                         |
| `critique`        | Milestone gates  | Design effectiveness review at end of each milestone                                                 |
| `audit`           | Phase 5          | Comprehensive accessibility, performance, and theming audit                                          |
| `normalize`       | Phase 5          | Verify all components use shared design tokens consistently                                          |
| `optimize`        | Phase 5          | Animation budget enforcement, SVG connector performance, image/media loading                         |
| `polish`          | Phase 5          | Final detail pass: alignment, spacing, consistency, micro-adjustments                                |

### Invocation Protocol

1. **Before starting any component build**: invoke `frontend-design`
2. **After completing each milestone**: invoke `critique`
3. **During Phase 5**: invoke `audit` → `normalize` → `optimize` → `polish` in sequence
4. **If output feels generic or safe**: invoke `bolder`; follow with `quieter` if overcorrected

---

## Phase 0: Content Model & Information Architecture (Pre-Build)

> Define the data contract for inheritance storytelling, lock i18n key structures, and validate that the existing project data can support the metaphor.
>
> **Skills**: `clarify` (copy structure) · `distill` (keep the model lean)

| Task                                                                       | Effort | Depends On | Skill     | Done Criteria                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------- | ------ | ---------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 Design `InheritanceStory` TypeScript interface                         | 3h     | —          | `distill` | Interface defined in `src/types/inheritance.ts` with: `parentClass` (name, description, icon), `inheritedTraits[]` (label, evidence, origin), `overrides[]` (label, description, proofMetric?, codeSnippet?), `resultingIdentity` (statement). Optional fields for intermediate layers. Follows SRP — types only, no logic. **Quality gates ★1–★4, #5 (unit test for type guards/validators).** |
| 0.2 Extend `projects.json` with `inheritanceStory` data for all 3 projects | 4h     | 0.1        | `clarify` | Each project in `projects.json` has an optional `inheritanceStory` object following the new interface. Content is meaningful — maps real architecture to the metaphor. Validated by updated content test. **Quality gates ★1–★4, #5 (update `CaseStudy.content.test.ts`).**                                                                                                                     |
| 0.3 Add inheritance i18n keys to `en.json` and `es.json`                   | 3h     | 0.1        | `clarify` | New `caseStudy.inheritance.*` keys in both locales: section title, parent class label, inherited traits label, overrides label, resulting identity label, helper subtitle, return CTA text. Identical key structures. **Quality gates ★1–★4, #6 (update `CaseStudy.i18n.test.ts`).**                                                                                                            |
| 0.4 Create utility functions for inheritance data access                   | 2h     | 0.1        | —         | `src/utils/inheritance.ts` with: `getInheritanceStory(project)` (returns typed story or null), `hasInheritanceStory(project)` (type guard). Pure functions, no side effects. **Quality gates ★1–★4, #5 (unit test `src/utils/__tests__/inheritance.test.ts`).**                                                                                                                                 |
| 0.5 Validate content completeness across all 3 projects                    | 1h     | 0.2, 0.3   | —         | Run `npm test` — all content and i18n tests pass. Each project has enough data to render every planned sub-component. **Quality gates ★1–★4.**                                                                                                                                                                                                                                                  |

### Execution Strategy

```
Wave 1 ─ sequential: 0.1 (TypeScript interface)
Wave 2 ─ parallel:   0.2 (project data, ←0.1) + 0.3 (i18n keys, ←0.1) + 0.4 (utility fns, ←0.1)
Wave 3 ─ sequential: 0.5 (validate, ←0.2+0.3)
```

- **Critical path**: 0.1 → 0.2 → 0.5 (8h sequential minimum)
- **Parallelism savings**: ~4h — Wave 2 runs three tasks simultaneously (9h serial → ~4h parallel)

**Phase 0 Total**: ~13h

---

## Phase 1: i18n Copy & Content Authoring

> Write all bilingual copy for the inheritance section before touching any components.
>
> **Skills**: `clarify` (copy quality)

| Task                                                  | Effort | Depends On | Skill     | Done Criteria                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------- | ------ | ---------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1 Author AIEcommerce inheritance story content (EN) | 2h     | 0.2        | `clarify` | Parent class: "Autonomous Agent Orchestration Engine". Inherited traits: stateful graph execution, self-healing inventory, LLM content generation. Overrides: autonomous PC assembly logic, marketplace-specific enrichment. Resulting identity: specialized e-commerce agent pipeline. **Quality gate ★4.** |
| 1.2 Author Narbox inheritance story content (EN)      | 2h     | 0.2        | `clarify` | Parent class: "Distributed Logistics Runtime". Inherited traits: state machine lifecycle, GraphQL typed contracts, i18n-first architecture. Overrides: consolidation state transitions, customs document automation. Resulting identity: specialized forwarding platform. **Quality gate ★4.**               |
| 1.3 Author PBXAI inheritance story content (EN)       | 2h     | 0.2        | `clarify` | Parent class: "Real-time Media Gateway". Inherited traits: bidirectional streaming, stateful channel management, circuit-breaker resilience. Overrides: silence detection turn-taking, low-latency AI brain bridging. Resulting identity: specialized voice AI orchestrator. **Quality gate ★4.**            |
| 1.4 Translate all inheritance content to Spanish      | 3h     | 1.1–1.3    | `clarify` | Spanish content preserves technical accuracy, matches key structure exactly. No truncated labels. **Quality gates ★1–★4, #6 (i18n parity test passes).**                                                                                                                                                     |
| 1.5 Write helper subtitle copy (EN/ES)                | 1h     | 0.3        | `clarify` | Short contextual line under section heading: "Read this project as a specialized implementation built on a reusable engineering base." / Spanish equivalent. **Quality gates ★1–★4, #6.**                                                                                                                    |

### Execution Strategy

```
Wave 1 ─ parallel:   1.1 (AIEcommerce) + 1.2 (Narbox) + 1.3 (PBXAI) + 1.5 (subtitle copy)
Wave 2 ─ sequential: 1.4 (translate all, ←1.1+1.2+1.3)
```

- **Critical path**: Longest of 1.1/1.2/1.3 (2h) → 1.4 (3h) = 5h
- **Parallelism savings**: ~5h — Wave 1 runs four tasks simultaneously (7h serial → ~2h parallel)

**Phase 1 Total**: ~10h

---

## Phase 2: Core Section Components (Week 1–2)

> Build all structural components for the inheritance section — Astro for static layout, React only for interactive surfaces.
>
> **Skills**: `frontend-design` (component builds) · `arrange` (composition) · `adapt` (responsive) · `colorize` (theme treatment) · `distill` (lean architecture)

| Task                                                                                           | Effort | Depends On    | Skill                               | Done Criteria                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------- | ------ | ------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 Build `InheritanceSection.astro` (section shell)                                           | 4h     | 0.1, 0.3      | `frontend-design` `distill`         | Astro component wrapping the entire inheritance block. Props: `story: InheritanceStory`, `labels: InheritanceSectionLabels`, `lang: string`. Semantic HTML shell with `<section>` tag, unique `id`, heading, helper subtitle, and slot areas for sub-components. After Hours as default visual target. **Quality gates ★1–★4, #5, #7, #8, #9, #10, #12, #13.** |
| 2.2 Build `ParentClassPanel.astro` (base architecture card)                                    | 4h     | 2.1           | `frontend-design` `colorize`        | Restrained smoked teal/graphite surface. Displays parent class name (20–28px monospace), icon, and description. Acts as visual origin point. Stable, non-interactive — pure Astro. Clear "Base Class" label. **Quality gates ★1–★4, #5, #7, #8, #9, #12, #13.**                                                                                                |
| 2.3 Build `ChildClassPanel.astro` (project-specific specialization card)                       | 4h     | 2.2           | `frontend-design` `colorize`        | Brighter contrast surface, visually offset from parent. Stronger edge definition. "Extends" connector label. Displays project name and resulting identity statement. **Quality gates ★1–★4, #5, #7, #8, #9, #12, #13.**                                                                                                                                        |
| 2.4 Build `InheritedTraitsGrid.tsx` (React — interactive trait chips with linked highlighting) | 6h     | 2.1, 0.4      | `frontend-design` `arrange`         | Grid of trait chips derived from `inheritedTraits[]`. Each chip: label + origin badge. Hover/focus reveals evidence line. Touch: tap-to-expand. Keyboard: Tab + Enter. Muted accent token colors. SRP: rendering + highlight state only. **Quality gates ★1–★4, #5, #7, #8, #9, #10, #11, #12, #13.**                                                          |
| 2.5 Build `OverrideCards.tsx` (React — interactive override spotlighting)                      | 6h     | 2.1, 0.4      | `frontend-design` `colorize`        | 1–3 cards from `overrides[]`. Acid green accent treatment on activation. Selecting a card spotlights related metric or code snippet. Override cards receive strongest visual emphasis. DRY: shares highlight logic pattern with InheritedTraitsGrid. **Quality gates ★1–★4, #5, #7, #8, #9, #10, #11, #12, #13.**                                              |
| 2.6 Build `LineageMap.tsx` (React — compact visual lineage diagram)                            | 6h     | 2.2, 2.3, 0.4 | `frontend-design` `arrange` `adapt` | Desktop: richer node diagram showing parent → inherited layers → overrides → result. Mobile: vertical stack with progress-like node markers. Semantic HTML first (ordered list), React for active highlighting on scroll/hover. Electric cyan connectors. **Quality gates ★1–★4, #5, #7, #8, #9, #10, #11, #12, #13.**                                         |
| 2.7 Build `ReturnNavigation.astro` (editorial return CTA)                                      | 2h     | 0.3           | `frontend-design`                   | Strong bottom action linking back to `/${lang}/#projects`. Uses i18n labels. Standard `<a>` tag with directional cue. Reuses token system for hover states. Not a full component — lightweight partial. **Quality gates ★1–★4, #5, #7, #9, #12, #13.**                                                                                                         |
| 2.8 Compose full section in `InheritanceSection.astro`                                         | 3h     | 2.2–2.7       | `arrange`                           | Desktop: two-part composition (left narrative column: parent → child → traits → overrides; right lineage visualization). Tablet: stacked + compact lineage header. Mobile: vertical inheritance stack with expandable cards. All responsive breakpoints verified. **Quality gates ★1–★4, #7 (all 3 viewports, both locales), #8, #10, #13.**                   |
| 2.9 Integrate `InheritanceSection` into `[slug].astro` page                                    | 2h     | 2.8, 0.2      | —                                   | Section renders after metadata bar and before challenge section. Conditionally shown only when `project.inheritanceStory` exists. Passes translated labels from `cs.inheritance.*`. Page still renders cleanly for projects without inheritance data. **Quality gates ★1–★4, #7, #10, #13.**                                                                   |
| 2.10 Write tests for all Phase 2 components                                                    | 6h     | 2.1–2.9       | —                                   | Test files: `InheritanceSection.test.ts`, `ParentClassPanel.test.ts`, `ChildClassPanel.test.ts`, `InheritedTraitsGrid.test.tsx`, `OverrideCards.test.tsx`, `LineageMap.test.tsx`, `ReturnNavigation.test.ts`. Cover rendering, props, accessibility attributes, interactive states. **Quality gates ★1–★4.** Playwright verification for 2.1–2.9 complete.     |
| 2.11 **Milestone 1 gate**: Run `critique` on structural section                                | 2h     | 2.10          | `critique`                          | Design effectiveness review: inheritance readability, After Hours quality, Build Mode parity, mobile adaptation, content clarity. Issues logged and addressed before Phase 3. **Prerequisite: all tasks 0.1–2.10 passed quality gates.**                                                                                                                       |

### Execution Strategy

```
Wave 1 ─ parallel:   2.1 (section shell, ←0.1+0.3) + 2.7 (return nav, ←0.3)
Wave 2 ─ parallel:   2.2 (parent panel, ←2.1) + 2.4 (traits grid, ←2.1+0.4) + 2.5 (override cards, ←2.1+0.4)
Wave 3 ─ parallel:   2.3 (child panel, ←2.2) + 2.6 (lineage map, ←2.2+0.4)
Wave 4 ─ sequential: 2.8 (composition, ←2.2–2.7)
Wave 5 ─ sequential: 2.9 (page integration, ←2.8+0.2)
Wave 6 ─ sequential: 2.10 (tests, ←2.1–2.9)
Wave 7 ─ sequential: 2.11 (critique gate, ←2.10)
```

- **Critical path**: 2.1 → 2.2 → 2.3 → 2.8 → 2.9 → 2.10 → 2.11 (25h sequential minimum)
- **Parallelism savings**: ~14h — Wave 1 saves 2h, Wave 2 saves 8h (3 tasks), Wave 3 saves 4h (2 tasks)

**Phase 2 Total**: ~45h

---

## Phase 3: Motion & Interaction Layer (Week 3)

> Implement animation behaviors and micro-interactions that clarify lineage, specialization, and activation.
>
> **Skills**: `animate` (motion implementation) · `delight` (micro-interaction quality) · `quieter` (calibration)

| Task                                                                                    | Effort | Depends On | Skill               | Done Criteria                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------- | ------ | ---------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3.1 Section entry choreography (parent resolves first → child enters → connector draws) | 4h     | 2.8        | `animate`           | IntersectionObserver triggers staged entry: parent block fades in, then child block enters with slight offset, then connector line draws between them. Sequence completes in ≤1.2s. No layout shift. **Quality gates ★1–★4, #7, #10, #11, #13.**                               |
| 3.2 Trait assembly animation (chips appear sequentially from parent toward child)       | 3h     | 2.4, 3.1   | `animate`           | Inherited traits chips stagger in with 50–80ms delays as section enters view. Use transform + opacity only. Direction implies flow from parent origin. **Quality gates ★1–★4, #7, #10, #11.**                                                                                  |
| 3.3 Override card activation (border pulse + label state change on selection)           | 3h     | 2.5        | `animate` `delight` | Selecting/hovering an override card triggers acid green border trace and label emphasis. Dims inherited defaults to focus on project-specific behavior. Keyboard focus reproduces same emphasis. **Quality gates ★1–★4, #7, #9, #10, #11.**                                    |
| 3.4 Trait-to-proof linking (hover highlights origin and manifestation)                  | 3h     | 2.4        | `delight`           | Hovering a trait chip highlights where it manifests in override cards or results. Electric cyan connector or highlight bridges the linked elements. Touch: tap-to-link. **Quality gates ★1–★4, #7, #9, #10, #11.**                                                             |
| 3.5 Lineage map scroll-driven node activation                                           | 4h     | 2.6        | `animate`           | As user scrolls through traits/overrides, the active node in the lineage map updates. Compact sticky lineage label remains visible during deeper content reading. Mobile: step-based activation. **Quality gates ★1–★4, #7 (scroll behavior via Playwright), #10, #11.**       |
| 3.6 Parent-to-child connector draw (SVG or CSS line trace)                              | 3h     | 2.2, 2.3   | `animate`           | CSS `clip-path` or lightweight SVG `stroke-dashoffset` animation draws a connector between panels. Transform + opacity only. Does not animate continuously — fires once on section entry. **Quality gates ★1–★4, #7, #10, #11.**                                               |
| 3.7 `prefers-reduced-motion` full pass for inheritance section                          | 2h     | 3.1–3.6    | `animate`           | Every animation replaced with instant state + short opacity transition (≤200ms). Trait chips appear instantly. Connector shown as static line. Override emphasis uses border-color change only. **Quality gates ★1–★4, #7 (Playwright with reduced-motion emulation), #11.**   |
| 3.8 Create shared animation utility (`src/utils/inheritanceAnimation.ts`)               | 2h     | 3.1–3.6    | —                   | Extract reusable animation helpers: `staggerReveal()`, `connectorDraw()`, `nodeHighlight()`. SRP: timing + easing config separate from trigger logic. DRY: no duplicated animation parameters across components. **Quality gates ★1–★4, #5 (unit test for timing utilities).** |
| 3.9 Write tests for animation utilities and interaction behaviors                       | 3h     | 3.7, 3.8   | —                   | Tests for: stagger timing, reduced-motion detection, highlight state transitions, connector draw completion. **Quality gates ★1–★4.**                                                                                                                                          |
| 3.10 Run `quieter` to calibrate animation intensity                                     | 2h     | 3.9        | `quieter`           | Review all inheritance animations for aggressiveness. Tone down any that feel overwrought. Connector draw, trait stagger, override pulse should feel precise, not flashy. **Quality gates ★1–★4, #7, #10, #13.**                                                               |
| 3.11 **Milestone 2 gate**: Run `critique` on motion layer                               | 2h     | 3.10       | `critique`          | Design review covers: motion clarifies lineage (not decorative), animations feel native to portfolio identity, After Hours motion has appropriate subtlety. Issues addressed before Phase 4. **Prerequisite: all tasks 3.1–3.10 passed quality gates.**                        |

### Execution Strategy

```
Wave 1 ─ parallel:   3.1 (entry choreography, ←2.8)
                     3.3 (override activation, ←2.5)
                     3.4 (trait linking, ←2.4)
                     3.6 (connector draw, ←2.2+2.3)
Wave 2 ─ parallel:   3.2 (trait assembly, ←2.4+3.1)
                     3.5 (lineage scroll, ←2.6)
Wave 3 ─ sequential: 3.7 (reduced-motion pass, ←3.1–3.6)
Wave 4 ─ parallel:   3.8 (animation utility, ←3.1–3.6) + 3.9 (tests, ←3.7+3.8)
Wave 5 ─ sequential: 3.10 (quieter calibration, ←3.9)
Wave 6 ─ sequential: 3.11 (critique gate, ←3.10)
```

- **Critical path**: 3.1 → 3.2 → 3.7 → 3.8 → 3.9 → 3.10 → 3.11 (18h sequential minimum)
- **Parallelism savings**: ~11h — Wave 1 runs 4 tasks simultaneously (13h serial → ~4h parallel), Wave 2 saves 3h

**Phase 3 Total**: ~31h

---

## Phase 4: Responsive Hardening & i18n Edge Cases (Week 3–4)

> Validate responsive behavior across all breakpoints, harden for Spanish text expansion, and ensure touch/keyboard parity.
>
> **Skills**: `adapt` (responsive QA) · `harden` (resilience) · `clarify` (copy edge cases)

| Task                                                                                      | Effort | Depends On | Skill            | Done Criteria                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------- | ------ | ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 Desktop QA (≥1024px) — inheritance section, both themes, both locales                 | 3h     | Phase 3    | `adapt`          | Split composition renders correctly; lineage map visible alongside narrative; connector draws properly; After Hours surfaces feel authored, not inverted. **Playwright screenshots at 1280px for all 4 combinations (en/es × build/after-hours).**             |
| 4.2 Tablet QA (768–1023px) — compressed lineage, stacked panels                           | 3h     | Phase 3    | `adapt`          | Parent/child panels stack cleanly; lineage strip compact; interactions still functional; no horizontal overflow. **Playwright screenshots at 768px for all 4 combinations.**                                                                                   |
| 4.3 Mobile QA (320–767px) — vertical inheritance stack, expandable cards                  | 3h     | Phase 3    | `adapt` `harden` | Vertical flow replaces horizontal composition; trait chips wrap correctly; override cards are expandable; touch targets ≥44px; Spanish expansion tested. **Playwright screenshots at 375px for all 4 combinations.**                                           |
| 4.4 Spanish text expansion validation                                                     | 2h     | 4.1–4.3    | `harden`         | Trait chip labels, override titles, lineage node labels, and return CTA all accommodate longer Spanish text without truncation or overflow. Multiline support verified. **Quality gates ★1–★4, #7.**                                                           |
| 4.5 Keyboard and screen reader validation                                                 | 3h     | Phase 3    | `harden`         | All interactive nodes (traits, override cards, lineage map, return CTA) are keyboard-reachable via Tab/Shift-Tab. Focus indicators visible. ARIA roles correct. Decorative connectors hidden from assistive tech (`aria-hidden`). **Quality gates ★1–★4, #9.** |
| 4.6 Theme switch integration (section redraws emphasis states, preserves scroll position) | 2h     | Phase 3    | —                | Switching themes while viewing the inheritance section correctly redraws surfaces, accents, and connector colors. No layout shift. Active lineage node state preserved. **Quality gates ★1–★4, #7, #8, #10.**                                                  |
| 4.7 Locale switch integration (preserves project path and in-page position)               | 2h     | Phase 3    | —                | Switching locale on case study page navigates to the same project in the other locale. Inheritance section renders with correct language. **Quality gates ★1–★4, #7, #10.**                                                                                    |
| 4.8 Verify non-inheritance pages are unaffected                                           | 1h     | 2.9        | —                | Homepage, resume page, and projects without `inheritanceStory` data render without errors or layout changes. **Quality gates ★1–★4, #7, #10, #13.**                                                                                                            |
| 4.9 **Milestone 3 gate**: Run `critique` on hardened section                              | 2h     | 4.1–4.8    | `critique`       | Responsive quality across all breakpoints; Spanish text handled gracefully; theme parity verified; keyboard + screen reader confirmed. **Prerequisite: all Phase 4 tasks passed quality gates.**                                                               |

### Execution Strategy

```
Wave 1 ─ parallel:   4.1 (desktop QA, ←Phase 3)
                     4.2 (tablet QA, ←Phase 3)
                     4.3 (mobile QA, ←Phase 3)
                     4.5 (keyboard/SR, ←Phase 3)
                     4.6 (theme switch, ←Phase 3)
                     4.7 (locale switch, ←Phase 3)
                     4.8 (non-inheritance pages, ←2.9)
Wave 2 ─ sequential: 4.4 (Spanish expansion, ←4.1–4.3)
Wave 3 ─ sequential: 4.9 (critique gate, ←4.1–4.8)
```

- **Critical path**: Wave 1 (longest: 3h) → 4.4 (2h) → 4.9 (2h) = 7h
- **Parallelism savings**: ~12h — Wave 1 runs 7 tasks simultaneously (17h serial → ~3h parallel)

**Phase 4 Total**: ~21h

---

## Phase 5: Audit, Performance & Polish (Week 4)

> Comprehensive quality pass — accessibility audit, performance optimization, design system normalization, and final polish.
>
> **Skills**: `audit` (comprehensive audit) · `optimize` (performance) · `normalize` (design system consistency) · `polish` (final detail pass)

| Task                                                          | Effort | Depends On | Skill       | Done Criteria                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------- | ------ | ---------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 Accessibility audit (axe-core / Lighthouse accessibility) | 3h     | Phase 4    | `audit`     | Lighthouse Accessibility score ≥90 on all 3 project pages. axe-core reports zero critical/serious violations. Text contrast AA-compliant in both themes. Diagram information has text equivalents. **Quality gates #9.**                                                                                  |
| 5.2 Performance optimization                                  | 3h     | Phase 4    | `optimize`  | No scroll jank from connector/lineage animations. SVG connectors lightweight (< 2KB). No continuous animation loops. React bundle for inheritance components < 15KB gzipped. `transform` and `opacity` only in animation hot paths. Lighthouse Performance ≥90. **Quality gates ★3, #13.**                |
| 5.3 Design token consistency check                            | 2h     | Phase 4    | `normalize` | All inheritance components use shared CSS custom properties — no hardcoded colors, spacing, or font sizes. After Hours and Build Mode use the same token references (values switch via theme). No component has its own local color definitions. **Quality gates ★1–★4.**                                 |
| 5.4 SEO validation for case study pages                       | 2h     | 2.9        | —           | JSON-LD `TechArticle` schema still valid. OG tags correct. Heading hierarchy sequential (h1 → h2 → h3). New section does not break existing breadcrumb schema. Sitemap includes all project routes. **Quality gates ★1–★4, #10, #13.**                                                                    |
| 5.5 Cross-browser testing (Chrome, Firefox, Safari, Edge)     | 3h     | 4.1–4.3    | —           | No critical visual or functional differences across evergreen browsers. CSS connector animations work in all engines. SVG line draw compatible. **Playwright screenshots in Chromium, Firefox, WebKit.**                                                                                                  |
| 5.6 Final test suite pass                                     | 2h     | 5.1–5.5    | —           | All test files pass (`npm test` exits 0). `npm run build` succeeds. `npm run lint` exits 0. `npm run format` produces no diff. No `.skip` or `.only` in test files. **Quality gates ★1–★4, #12, #13.**                                                                                                    |
| 5.7 Run `polish` for final detail pass                        | 3h     | 5.3, 5.6   | `polish`    | Alignment, spacing, and consistency refined. Parent-to-child offset feels intentional. Connector endpoints clean. Trait chip spacing uniform. Override card emphasis balanced. Production-ready quality. **Quality gates ★1–★4, #7 (final golden screenshots), #8, #13.**                                 |
| 5.8 Final lint + format pass                                  | 1h     | 5.7        | —           | `npm run lint` and `npm run format` pass. Zero ESLint warnings. Prettier produces no diff. **Quality gates ★1–★2.**                                                                                                                                                                                       |
| 5.9 **Milestone 4 gate**: Final `critique` before merge       | 2h     | 5.8        | `critique`  | Final design review: inheritance metaphor improves comprehension, After Hours feels intentional, Build Mode holds parity, section feels native to portfolio identity, not like a separate microsite. **Prerequisite: all tasks 5.1–5.8 passed quality gates. Final Playwright screenshot set committed.** |

### Execution Strategy

```
Wave 1 ─ parallel:   5.1 (accessibility, ←Phase 4)
                     5.2 (performance, ←Phase 4)
                     5.3 (token consistency, ←Phase 4)
                     5.4 (SEO, ←2.9)
                     5.5 (cross-browser, ←4.1–4.3)
Wave 2 ─ sequential: 5.6 (test suite, ←5.1–5.5)
Wave 3 ─ sequential: 5.7 (polish, ←5.3+5.6)
Wave 4 ─ sequential: 5.8 (lint/format, ←5.7)
Wave 5 ─ sequential: 5.9 (critique gate, ←5.8)
```

- **Critical path**: Wave 1 (longest: 3h) → 5.6 (2h) → 5.7 (3h) → 5.8 (1h) → 5.9 (2h) = 11h
- **Parallelism savings**: ~8h — Wave 1 runs 5 tasks simultaneously (13h serial → ~3h parallel)

**Phase 5 Total**: ~21h

---

## Dependencies Map

### Phase-Level Dependency Graph

```
Phase 0 (Content Model & IA)
  ├── 0.1 TypeScript interface ──> 0.2 project data + 0.3 i18n keys + 0.4 utility fns
  └── 0.5 validate (←0.2+0.3)

Phase 1 (i18n Copy & Content)
  ├── 1.1+1.2+1.3 (EN stories, ←0.2) + 1.5 (subtitle, ←0.3)
  └── 1.4 translate (←1.1–1.3)

Phase 2 (Core Components) ←── Phase 0 + Phase 1
  ├── 2.1 section shell ──> 2.2 parent ──> 2.3 child
  ├── 2.1 ──> 2.4 traits grid + 2.5 override cards
  ├── 2.2+2.3 ──> 2.6 lineage map
  ├── 2.7 return nav (independent)
  ├── 2.8 composition (←2.2–2.7)
  ├── 2.9 page integration (←2.8)
  ├── 2.10 tests (←2.1–2.9)
  └── 2.11 critique gate (←2.10)

Phase 3 (Motion & Interaction) ←── Phase 2
  ├── 3.1+3.3+3.4+3.6 (parallel, ←Phase 2 components)
  ├── 3.2 (←3.1) + 3.5 (←2.6)
  ├── 3.7 reduced motion (←3.1–3.6)
  ├── 3.8+3.9 animation utilities + tests (←3.7)
  ├── 3.10 quieter (←3.9)
  └── 3.11 critique gate (←3.10)

Phase 4 (Responsive Hardening) ←── Phase 3
  ├── Wave 1: 4.1–4.3+4.5–4.8 (parallel)
  ├── 4.4 Spanish expansion (←4.1–4.3)
  └── 4.9 critique gate (←4.1–4.8)

Phase 5 (Audit & Polish) ←── Phase 4
  ├── Wave 1: 5.1–5.5 (parallel)
  ├── 5.6 test suite → 5.7 polish → 5.8 lint → 5.9 critique gate
  └── (linear finish)
```

### Cross-Phase Parallelism Opportunities

| Task                   | Can Start During | Prerequisite   | Savings |
| ---------------------- | ---------------- | -------------- | ------- |
| 1.1–1.3 (EN stories)   | Phase 0 Wave 2   | Only needs 0.2 | ~2h     |
| 2.7 (return nav)       | Phase 2 Wave 1   | Only needs 0.3 | ~2h     |
| 4.8 (non-inhertitance) | Phase 2 end      | Only needs 2.9 | ~4h     |
| 5.4 (SEO validation)   | Phase 2 end      | Only needs 2.9 | ~4h     |

### Critical Path (End-to-End)

```
0.1 ─> 0.2 ─> 0.5 ─> 1.1 ─> 1.4 ─>
2.1 ─> 2.2 ─> 2.3 ─> 2.8 ─> 2.9 ─> 2.10 ─> 2.11 ─>
3.1 ─> 3.2 ─> 3.7 ─> 3.9 ─> 3.10 ─> 3.11 ─>
4.1 ─> 4.4 ─> 4.9 ─>
5.6 ─> 5.7 ─> 5.8 ─> 5.9
```

**Critical path duration**: ~62h (out of ~140h total)

The remaining ~78h runs on parallel tracks. Maximum parallelism reduces elapsed calendar time from ~140h serial to ~62h effective.

### Milestone Convergence Points

| Milestone | Gate Task | Waits For             | Blocks  |
| --------- | --------- | --------------------- | ------- |
| M1        | 2.11      | Phases 0–2 (0.1–2.10) | Phase 3 |
| M2        | 3.11      | Phase 3 (3.1–3.10)    | Phase 4 |
| M3        | 4.9       | Phase 4 (4.1–4.8)     | Phase 5 |
| M4        | 5.9       | Phase 5 (5.1–5.8)     | Merge   |

---

## Milestones

| #   | Milestone             | Target     | Success Criteria                                                                                                                                                                                                 |
| --- | --------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Structure Complete    | End Week 2 | Content model defined; all 6 structural components rendering; page integration working; tests passing; After Hours default quality verified; Build Mode parity confirmed. All tasks 0.1–2.10 pass quality gates. |
| 2   | Motion Complete       | Mid Week 3 | All animations implemented; reduced-motion pass done; quieter calibration applied; trait linking and override spotlighting working. All tasks 3.1–3.10 pass quality gates.                                       |
| 3   | Hardened & Responsive | End Week 3 | Responsive QA at 3 breakpoints × 2 themes × 2 locales; Spanish expansion validated; keyboard + screen reader confirmed; theme/locale switch integration verified. All tasks 4.1–4.8 pass quality gates.          |
| 4   | Polish & Ship         | End Week 4 | Accessibility audit passed; performance optimized; design tokens normalized; final polish applied; lint/format/build clean; ready for merge. All tasks 5.1–5.8 pass quality gates. Final screenshots committed.  |

---

## New Files Inventory

### Components (7 new files)

| File                                      | Type  | Purpose                                | Test File                                               |
| ----------------------------------------- | ----- | -------------------------------------- | ------------------------------------------------------- |
| `src/components/InheritanceSection.astro` | Astro | Section shell — layout, heading, slots | `src/components/__tests__/InheritanceSection.test.ts`   |
| `src/components/ParentClassPanel.astro`   | Astro | Base architecture card                 | `src/components/__tests__/ParentClassPanel.test.ts`     |
| `src/components/ChildClassPanel.astro`    | Astro | Project specialization card            | `src/components/__tests__/ChildClassPanel.test.ts`      |
| `src/components/InheritedTraitsGrid.tsx`  | React | Interactive trait chips grid           | `src/components/__tests__/InheritedTraitsGrid.test.tsx` |
| `src/components/OverrideCards.tsx`        | React | Override spotlighting cards            | `src/components/__tests__/OverrideCards.test.tsx`       |
| `src/components/LineageMap.tsx`           | React | Compact lineage diagram                | `src/components/__tests__/LineageMap.test.tsx`          |
| `src/components/ReturnNavigation.astro`   | Astro | Editorial return CTA                   | `src/components/__tests__/ReturnNavigation.test.ts`     |

### Utilities (2 new files)

| File                                | Purpose                                  | Test File                                          |
| ----------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| `src/utils/inheritance.ts`          | Data access, type guards                 | `src/utils/__tests__/inheritance.test.ts`          |
| `src/utils/inheritanceAnimation.ts` | Shared animation helpers (stagger, draw) | `src/utils/__tests__/inheritanceAnimation.test.ts` |

### Types (1 new file)

| File                       | Purpose                            | Test File                             |
| -------------------------- | ---------------------------------- | ------------------------------------- |
| `src/types/inheritance.ts` | TypeScript interfaces, type guards | (validated via `inheritance.test.ts`) |

### Modified Files

| File                                                 | Change                                                  |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `src/content/projects.json`                          | Add optional `inheritanceStory` to each project         |
| `src/i18n/en.json`                                   | Add `caseStudy.inheritance.*` keys                      |
| `src/i18n/es.json`                                   | Add `caseStudy.inheritance.*` keys (matching structure) |
| `src/pages/[lang]/projects/[slug].astro`             | Integrate `InheritanceSection` conditionally            |
| `src/components/__tests__/CaseStudy.content.test.ts` | Update schema validation for `inheritanceStory`         |
| `src/components/__tests__/CaseStudy.i18n.test.ts`    | Validate new `inheritance` key structure                |

**Total new files**: 10 source files + 9 test files = 19 files

---

## Risks & Mitigation

| Risk                                                      | Impact | Probability | Mitigation                                                                                                                                                                  |
| --------------------------------------------------------- | ------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inheritance metaphor feels academic or alienates non-devs | High   | Medium      | Keep labels editorial, not UML. Add helper subtitle. Tie every trait to one concrete proof point. `critique` gate validates comprehension.                                  |
| Too many layers flatten multi-layer projects              | Medium | Medium      | Limit to one parent + one child per project. Optional intermediate layer only when genuinely needed (deferred to post-launch).                                              |
| After Hours feels disconnected (just inverted colors)     | Medium | Medium      | Use `colorize` skill to shift tone, surface depth, and connector treatment. After Hours must feel authored, not automated. `critique` gate catches drift.                   |
| Spanish text expansion breaks trait chips and lineage     | Medium | High        | Use flexible containers (`min-width` not fixed `width`). Test Spanish from Phase 2. Multiline support on all labels. `harden` skill validates.                              |
| SVG connector animation performance on low-end devices    | Medium | Medium      | Use CSS `clip-path` or `stroke-dashoffset` — no complex SVG filters. Test on throttled CPU. Reduced-motion as full fallback. `optimize` reviews animation budget.           |
| Section competes visually with existing hero/metadata     | Medium | Low         | Keep section visually tighter at top. Reserve larger expressive moves for override cards deeper in block. `distill` skill enforces restraint.                               |
| Content model too rigid across diverse projects           | Medium | Medium      | Make `inheritanceStory` fully optional. Each field within it optional too. Projects can derive stories editorially from existing `challenge`/`solution` fields.             |
| React bundle bloat from 3 interactive components          | Low    | Medium      | Target < 15KB gzipped for all 3 components combined. Share highlight logic between `InheritedTraitsGrid` and `OverrideCards`. Use `client:visible` for progressive loading. |
| Existing case study tests break from schema extension     | Low    | High        | Update `CaseStudy.content.test.ts` in Phase 0.2. Make `inheritanceStory` validation optional (not required for schema pass). Run `npm test` after every data change.        |
| Lineage map becomes noise on mobile                       | Medium | Medium      | Replace with vertical stack + step markers. Keep node count low. `adapt` skill reduces complexity instead of shrinking desktop layout.                                      |

---

## Resource Allocation

| Focus Area                 | Hours | Weeks Active | Key Deliverables                                                                                            |
| -------------------------- | ----- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| Content model & IA         | 13h   | Pre-build    | TypeScript interfaces, project data extension, i18n keys, utility functions                                 |
| i18n copy authoring        | 10h   | Week 1       | EN/ES inheritance stories for 3 projects, helper subtitle, translation validation                           |
| Core section components    | 45h   | Weeks 1–2    | 7 components (3 Astro + 3 React + 1 lightweight), composition, page integration, tests, M1 critique         |
| Motion & interaction       | 31h   | Week 3       | Entry choreography, trait assembly, override activation, lineage scroll, connector draw, reduced-motion, M2 |
| Responsive hardening       | 21h   | Weeks 3–4    | 3-breakpoint QA, Spanish expansion, keyboard/SR, theme/locale switch, M3 critique                           |
| Audit, performance, polish | 21h   | Week 4       | Accessibility audit, performance optimization, token normalization, final polish, M4 critique               |
| Design quality gates       | 8h    | Milestones   | 4 `critique` reviews (M1–M4) ensuring design quality throughout                                             |

**Total Effort**: ~141h across 4 weeks (~35h/week)

---

## Estimation Summary

| Estimate Type       | Hours     |
| ------------------- | --------- |
| Optimistic (O)      | 112h      |
| Most Likely (M)     | 141h      |
| Pessimistic (P)     | 185h      |
| **Expected (PERT)** | **~144h** |

Formula: $(112 + 4 \times 141 + 185) / 6 ≈ 144h$

Includes ~25% buffer over optimistic baseline.

---

## Weekly Checkpoints

- **End of Week 1**: Content model locked; all i18n keys authored; section shell and parent/child panels rendering; trait grid and override cards interactive; lineage map wired
- **End of Week 2**: Full composition assembled on page; all 3 projects rendering inheritance section; tests passing; **Milestone 1 critique gate passed**
- **End of Week 3**: All animations implemented; reduced-motion pass complete; quieter calibration done; responsive QA across all breakpoints; Spanish expansion validated; **Milestone 2 + 3 critique gates passed**
- **End of Week 4**: Accessibility audit passed; performance optimized; design tokens normalized; final polish applied; **Milestone 4 final critique passed**; ready for merge

---

## Post-Launch Iteration Candidates

These items from the design direction are intentionally deferred:

- **Intermediate inheritance layer** (Proposal 2): Add `shared runtime` or `base system` level only when multi-layer projects genuinely need it
- **Evidence-linked trait cards** (Proposal 5): Turn trait chips into full evidence cards with origin, purpose, and manifestation — Medium complexity, needs careful mobile handling
- **Copy-to-clipboard architecture notes**: Only if it supports comprehension, not novelty
- **Advanced lineage diagram**: Physics-based node positioning or richer visual connectors
- **Scroll-pinning lineage label**: Compact sticky lineage persisting while reading deeper content — simplified in Phase 3.5, full implementation deferred

---

## SOLID & DRY Compliance Map

| Principle                 | Application                                                                                                                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Single Responsibility** | `inheritance.ts` = data access only. `inheritanceAnimation.ts` = timing/easing only. Each component handles one concern: `ParentClassPanel` renders parent data, `InheritedTraitsGrid` manages trait interaction. Types live in `src/types/inheritance.ts` separate from logic. |
| **Open/Closed**           | `InheritanceSection.astro` accepts any `InheritanceStory` — new projects extend via data, not code changes. Override cards accept optional `proofMetric` and `codeSnippet` without requiring them.                                                                              |
| **Liskov Substitution**   | All trait/override items follow the same rendering interface. A trait with only a label substitutes cleanly for one with label + evidence + origin.                                                                                                                             |
| **Interface Segregation** | React components receive only the props they need: `InheritedTraitsGrid` gets `traits[]` + `labels`, not the full `InheritanceStory`. No prop drilling of unused data.                                                                                                          |
| **Dependency Inversion**  | Components depend on abstractions (`InheritanceStory` interface), not on concrete data sources. `getInheritanceStory()` utility abstracts data access so components don't import `projects.json` directly.                                                                      |
| **DRY**                   | Shared highlight logic between `InheritedTraitsGrid` and `OverrideCards`. Shared animation utilities in `inheritanceAnimation.ts`. i18n label structure follows existing `caseStudy.*` pattern.                                                                                 |
