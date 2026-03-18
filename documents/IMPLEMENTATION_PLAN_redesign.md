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
- 21 existing test files must continue to pass or be updated alongside component changes

---

## Design Skill Integration Strategy

The project uses the **Impeccable** skill suite to enforce design quality at every phase. Each skill is invoked at specific points in the workflow — not ad hoc — to ensure systematic coverage.

### Skill-to-Phase Map

| Skill              | Primary Phase(s)   | Purpose in This Project                                                                               |
| ------------------ | ------------------ | ----------------------------------------------------------------------------------------------------- |
| `teach-impeccable` | Phase 0 (pre-work) | One-time setup: gather design context and save persistent design guidelines before any implementation |
| `extract`          | Phase 1            | Extract reusable design tokens, color palettes, and spacing scales into the Tailwind config           |
| `typeset`          | Phase 1            | Define the 5-level typography hierarchy with responsive clamp values and font pairing                 |
| `colorize`         | Phase 1            | Establish the dual-theme color system (Build Mode / After Hours) with signal and surface color roles  |
| `frontend-design`  | Phases 2–6         | Build each new component (TodoRail, HeroNarrative, BioChapter, SkillMatrix, WorkLog, ContactChapter)  |
| `arrange`          | Phases 2, 4, 5     | Layout composition for the split shell, skill matrix grouping, and work log cascade                   |
| `adapt`            | Phases 2, 4, 8     | Responsive adaptation: mobile rail, compact skill cards, breakpoint QA                                |
| `onboard`          | Phases 2, 3        | TODO rail as a first-time discovery guide; hero as initial orientation moment                         |
| `bolder`           | Phase 3            | Push the hero section beyond safe/generic into distinctive territory                                  |
| `clarify`          | Phases 3, 6        | Sharpen hero copy, bio narrative, CTA labels, and i18n microcopy                                      |
| `distill`          | Phases 3, 5        | Tighten the bio chapter (merge Philosophy + Vision); strip work log to essentials                     |
| `delight`          | Phases 6, 7        | Contact completion feedback, TODO rail checkmark moments, theme toggle surprise                       |
| `animate`          | Phase 7            | Implement all chapter-specific reveal families and micro-interactions                                 |
| `overdrive`        | Phase 7            | Technically ambitious effects: portrait frame sequence, TODO rail state machine choreography          |
| `quieter`          | Phase 7            | Dial back any animations that feel aggressive after implementation; ensure elegance over spectacle    |
| `harden`           | Phases 6, 8        | i18n edge cases (Spanish expansion), error states, text overflow, resilient interaction patterns      |
| `critique`         | Milestone gates    | Design effectiveness review at the end of each milestone before proceeding                            |
| `audit`            | Phase 8            | Comprehensive audit across accessibility, performance, theming, and responsive design                 |
| `optimize`         | Phase 8            | Performance pass: Lighthouse scores, image optimization, animation budget enforcement                 |
| `normalize`        | Phase 8            | Verify all components conform to the new design system tokens and patterns                            |
| `polish`           | Phase 8            | Final detail pass: alignment, spacing, consistency, and micro-adjustments before launch               |

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

**Phase 0 Total**: ~2h

---

## Milestones

| #   | Milestone             | Target     | Success Criteria                                                                                                              |
| --- | --------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | Foundation Complete   | End Week 2 | New theme system, design tokens, typography, and base layout shell with TODO rail skeleton rendering on desktop/tablet/mobile |
| 2   | Core Sections Built   | End Week 4 | Hero ("Hello World"), Bio, Skills, and Work Log sections implemented with i18n and content integration                        |
| 3   | Interactions & Motion | End Week 6 | TODO rail state machine, scroll-driven animations, theme toggle with portrait sequence, chapter-specific reveal families      |
| 4   | Polish & Launch       | End Week 8 | Responsive QA, accessibility audit, performance optimization, test suite updated, production deploy                           |

---

## Phase 1: Design Tokens & Theme Foundation (Week 1)

> Establish the new visual language before touching any components.
>
> **Skills**: `extract` (design token extraction) · `colorize` (dual-theme color system) · `typeset` (typography hierarchy)

| Task                                                                                         | Effort | Depends On | Skill                | Done Criteria                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------- | ------ | ---------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 Define design token system (colors, spacing, typography scales) in `tailwind.config.mjs` | 6h     | —          | `extract` `colorize` | Tailwind config has `buildMode` and `afterHours` color palettes, signal colors (acid green, electric cyan, muted amber), surface colors (chalk, carbon, ink, smoked teal), font families (monospace display + editorial sans) |
| 1.2 Create CSS custom property layer for theme switching in `global.css`                     | 4h     | 1.1        | `colorize`           | CSS variables for all color roles toggle via `[data-theme="build"]` / `[data-theme="after-hours"]` class on `<html>`                                                                                                          |
| 1.3 Set up typography scale (Level 0–Body–Meta) with responsive clamp values                 | 4h     | 1.1        | `typeset`            | Tailwind utility classes or CSS for all 5 hierarchy levels from the design direction                                                                                                                                          |
| 1.4 Add font assets (monospace display + editorial sans-serif)                               | 2h     | —          | `typeset`            | Fonts loaded via `<link>` or `@font-face` with `font-display: swap`; fallbacks defined                                                                                                                                        |
| 1.5 Update `design-tokens.test.ts` to validate new token structure                           | 2h     | 1.1, 1.2   | —                    | Test passes confirming token keys, contrast ratios, and theme variable presence                                                                                                                                               |
| 1.6 Create theme persistence utility (localStorage + system preference detection)            | 3h     | 1.2        | —                    | Utility reads `prefers-color-scheme`, checks localStorage override, applies `data-theme` attribute before first paint (inline script in `<head>`)                                                                             |

**Phase 1 Total**: ~21h

---

## Phase 2: Layout Shell & TODO Rail (Weeks 1–2)

> Build the new page shell that replaces navbar + footer with the TODO rail navigation system.
>
> **Skills**: `frontend-design` (component builds) · `arrange` (split layout composition) · `adapt` (mobile rail) · `onboard` (rail as discovery UX)

| Task                                                                                                                     | Effort | Depends On    | Skill                     | Done Criteria                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------ | ------ | ------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.1 Design TODO rail data model and state machine (pending → active → completed)                                         | 3h     | —             | `onboard`                 | TypeScript interface for rail items with id, label (en/es), state, sectionId; state transition logic                                                                                       |
| 2.2 Build `TodoRail.tsx` React component (desktop: right sticky column)                                                  | 8h     | 2.1, 1.2      | `frontend-design`         | Renders 4 items ("Boot identity", "Compile strengths", "Unlock work log", "Open channel") with 3-state visuals; sticky positioning; WAI-ARIA nav landmark with current/completed semantics |
| 2.3 Build `TodoRailMobile.tsx` (sticky top progress strip / bottom dock)                                                 | 6h     | 2.2           | `frontend-design` `adapt` | Compact horizontal progress bar that expands to show full checklist on tap; same state machine                                                                                             |
| 2.4 Update `Layout.astro` to new shell: remove navbar/footer wrapper, add split layout (content stage left + rail right) | 6h     | 2.2, 2.3, 1.2 | `arrange`                 | Layout renders correctly at desktop/tablet/mobile breakpoints; no navbar or footer on homepage                                                                                             |
| 2.5 Add TODO rail i18n keys to `en.json` and `es.json`                                                                   | 2h     | 2.1           | `clarify`                 | Both translation files have `todoRail.*` keys with playful developer labels in both languages                                                                                              |
| 2.6 Wire IntersectionObserver to drive rail state from scroll position                                                   | 4h     | 2.2, 2.4      | —                         | Scrolling through sections updates rail items through pending → active → completed states; clicking rail items scrolls to corresponding section                                            |
| 2.7 Build theme toggle component (compact utility strip)                                                                 | 4h     | 1.6, 1.2      | `frontend-design`         | Toggle switches between "Build Mode" and "After Hours" with CSS variable swap; respects reduced motion; includes locale switcher                                                           |
| 2.8 Build locale switcher (integrated into utility strip)                                                                | 2h     | 2.7           | —                         | Language switch preserves current section and theme state                                                                                                                                  |
| 2.9 Write tests for TodoRail and Layout changes                                                                          | 4h     | 2.2, 2.3, 2.4 | —                         | Unit tests for state machine logic, i18n key parity, and component rendering                                                                                                               |
| 2.10 **Milestone 1 gate**: Run `critique` on foundation + layout shell                                                   | 2h     | 2.9           | `critique`                | Design effectiveness review covers: rail readability, layout balance, theme coherence, mobile adaptation; issues logged and addressed before Phase 3                                       |

**Phase 2 Total**: ~41h

---

## Phase 3: Hero & Bio Sections (Week 3)

> Replace the current hero with the narrative "Hello World" opening and create the bio chapter.
>
> **Skills**: `frontend-design` (component builds) · `bolder` (hero impact) · `clarify` (copy quality) · `distill` (bio tightening) · `onboard` (hero as orientation)

| Task                                                                                                                    | Effort | Depends On    | Skill                       | Done Criteria                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------- | ------ | ------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 Build new `HeroNarrative.astro` with "Hello World" headline + translator line                                       | 6h     | Phase 1, 2.4  | `frontend-design` `bolder`  | Static HTML headline that renders without JS; monospace display type; supporting value proposition line; primary + secondary CTA                        |
| 3.2 Add hero typing/resolve animation (client-side span splitting)                                                      | 4h     | 3.1           | —                           | "Hello World" text animates with syntax-highlight effect on load; falls back to static text if JS disabled; respects `prefers-reduced-motion`           |
| 3.3 Integrate portrait imagery into hero (light-mode base)                                                              | 4h     | 3.1           | —                           | Hero portrait renders via `astro:assets` `Image` with `loading="eager"`, masked reveal entry; placeholder for dark-mode variant                         |
| 3.4 Implement hero TODO teaching moment (Boot identity resolves on load)                                                | 3h     | 3.2, 2.6      | `onboard`                   | First TODO item visibly transitions pending → active → completed during hero load choreography                                                          |
| 3.5 Create `BioChapter.astro` (editorial narrative block)                                                               | 6h     | 2.4, Phase 1  | `frontend-design` `distill` | Short editorial bio combining current Philosophy + Vision content into tighter narrative; one portrait crop anchoring the section; stacked block reveal |
| 3.6 Retire `HeroContent.astro`, `HeroImageCollage.astro`, `HeroSvgBackground.astro`, `Philosophy.astro`, `Vision.astro` | 2h     | 3.1, 3.5      | —                           | Old components removed or archived; no dead imports                                                                                                     |
| 3.7 Update hero and bio i18n keys in `en.json` / `es.json`                                                              | 3h     | 3.1, 3.5      | `clarify`                   | New `heroNarrative.*` and `bio.*` keys in both files; old `hero.*`, `philosophy.*`, `vision.*` keys cleaned up; copy is sharp and recruiter-friendly    |
| 3.8 Update/write tests for new hero and bio components                                                                  | 4h     | 3.1, 3.5, 3.7 | —                           | Tests validate i18n key parity, content rendering, animation fallbacks                                                                                  |

**Phase 3 Total**: ~32h

---

## Phase 4: Skills Section (Week 4)

> Replace the flat skill grid with an interactive competency matrix / toolbelt board.
>
> **Skills**: `frontend-design` (component build) · `arrange` (matrix grouping layout) · `adapt` (mobile card stack)

| Task                                                                    | Effort | Depends On   | Skill                       | Done Criteria                                                                                                                          |
| ----------------------------------------------------------------------- | ------ | ------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 Design skill cluster data model (Build, Scale, AI, Ship categories) | 3h     | —            | —                           | Restructure or map existing `skills.json` + `core-technologies.json` into 4 grouped clusters with display order                        |
| 4.2 Build `SkillMatrix.astro` (desktop: interactive competency board)   | 8h     | 4.1, Phase 1 | `frontend-design` `arrange` | Grouped clusters with category hover/focus revealing supporting proof points; chips animate into position; keyboard + touch accessible |
| 4.3 Build mobile skill layout (compact mission tracker card stack)      | 4h     | 4.2          | `adapt`                     | Stacked category cards with expandable detail; touch-friendly affordances                                                              |
| 4.4 Add skills section i18n keys                                        | 2h     | 4.1          | `clarify`                   | `skills.*` keys updated for new category labels and proof point text in both locales                                                   |
| 4.5 Retire `SkillGrid.astro` and `Timeline.astro` from homepage         | 1h     | 4.2          | —                           | Old components removed from page; timeline content absorbed into Work Log (Phase 5)                                                    |
| 4.6 Write tests for SkillMatrix                                         | 3h     | 4.2, 4.4     | —                           | Tests for rendering, category filtering, i18n parity                                                                                   |

**Phase 4 Total**: ~21h

---

## Phase 5: Work Log Section (Weeks 4–5)

> Merge FeaturedProjects + Timeline into a unified Work Log chapter.
>
> **Skills**: `frontend-design` (component builds) · `arrange` (cascade layout) · `distill` (strip to essentials)

| Task                                                                      | Effort | Depends On    | Skill                       | Done Criteria                                                                                                                                                |
| ------------------------------------------------------------------------- | ------ | ------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 5.1 Design Work Log data model (merged projects + experience milestones)  | 3h     | —             | `distill`                   | Interface combining `projects.json` entries with `experience.json` roles into chronological or narrative order; one highlighted case study                   |
| 5.2 Build `WorkLog.astro` section with cascade layout                     | 8h     | 5.1, Phase 1  | `frontend-design` `arrange` | Project cards + role milestone markers in combined sectional layout; cascade reveal tied to scroll; connector from active TODO item to highlighted work area |
| 5.3 Redesign `ProjectCard.astro` with metadata tray hover                 | 4h     | 5.2           | `frontend-design`           | Card hover expands metadata tray (role, duration, tech stack) instead of simple lift; directional motion tied to pointer entry                               |
| 5.4 Ensure case study links remain functional (`/[lang]/projects/[slug]`) | 2h     | 5.2           | —                           | Case study pages still accessible via standard links from Work Log cards                                                                                     |
| 5.5 Add Work Log i18n keys                                                | 2h     | 5.1           | `clarify`                   | `workLog.*` keys in both locales                                                                                                                             |
| 5.6 Retire `FeaturedProjects.astro` from homepage                         | 1h     | 5.2           | —                           | Component removed from homepage index; available for case study pages if needed                                                                              |
| 5.7 Write tests for WorkLog and updated ProjectCard                       | 3h     | 5.2, 5.3, 5.5 | —                           | Tests validate rendering, data integration, i18n parity                                                                                                      |
| 5.8 **Milestone 2 gate**: Run `critique` on all core sections             | 2h     | 5.7, 4.6, 3.8 | `critique`                  | Design effectiveness review covers: hero impact, bio readability, skill matrix usability, work log information density; issues addressed before Phase 6      |

**Phase 5 Total**: ~25h

---

## Phase 6: Contact Section & Page Completion (Week 5)

> Rebuild Contact as the final narrative chapter and wire up the full page.
>
> **Skills**: `frontend-design` (component build) · `clarify` (CTA copy) · `delight` (completion feedback) · `harden` (i18n edge cases)

| Task                                                                   | Effort | Depends On              | Skill                       | Done Criteria                                                                                                                                                              |
| ---------------------------------------------------------------------- | ------ | ----------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 Build new `ContactChapter.astro` (final unresolved task narrative) | 6h     | Phase 1, 2.4            | `frontend-design` `delight` | Last TODO item ("Open channel") feels like "ready to start"; direct email CTA, social links, resume entry point; completion feedback toast on email copy                   |
| 6.2 Integrate resume access into Contact section                       | 2h     | 6.1                     | —                           | Resume link/download visible within Contact chapter; links to existing `/[lang]/resume` page                                                                               |
| 6.3 Retire old `Contact.astro` from homepage                           | 1h     | 6.1                     | —                           | Old component removed from homepage                                                                                                                                        |
| 6.4 Wire full page section order in `[lang]/index.astro`               | 4h     | 3.1, 3.5, 4.2, 5.2, 6.1 | —                           | Homepage renders: HeroNarrative → BioChapter → SkillMatrix → WorkLog → ContactChapter; all sections have `class="fade-section"` and unique `id` matching TODO rail targets |
| 6.5 Add Contact i18n keys and clean up retired keys                    | 2h     | 6.1                     | `clarify`                   | `contact.*` keys updated; orphaned keys from retired components removed from both locales; CTA microcopy is action-oriented and clear                                      |
| 6.6 Ensure non-homepage pages still work (resume, case studies)        | 3h     | 6.4                     | `harden`                    | `/[lang]/resume` and `/[lang]/projects/[slug]` render correctly; may use a simplified layout without TODO rail (or rail disabled); Spanish text expansion tested           |
| 6.7 Write tests for ContactChapter                                     | 2h     | 6.1, 6.5                | —                           | Tests validate rendering, CTA functionality, i18n parity                                                                                                                   |
| 6.8 **Milestone 3 gate**: Run `critique` on complete page assembly     | 2h     | 6.7                     | `critique`                  | Full-page design review: section flow, visual rhythm, narrative coherence, TODO rail pacing; issues addressed before animation work begins                                 |

**Phase 6 Total**: ~22h

---

## Phase 7: Animation & Interaction Polish (Week 6)

> Implement chapter-specific motion families and micro-interactions.
>
> **Skills**: `animate` (motion implementation) · `overdrive` (ambitious effects) · `delight` (micro-interaction joy) · `quieter` (tone down if overcorrected)

| Task                                                                                                            | Effort | Depends On    | Skill               | Done Criteria                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------- | ------ | ------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 Hero load choreography (TODO rail appears → Hello World types → portrait reveals → Boot identity completes) | 6h     | 3.2, 3.4, 2.6 | `animate`           | Load sequence executes in order; no layout shift; reduced-motion fallback shows instant states                                                                                                  |
| 7.2 TODO rail micro-interactions (cursor sweep, checkmark draw, strike-through)                                 | 6h     | 2.2, 2.6      | `delight` `animate` | Active item gets cursor-like sweep; check draws with overshoot; completed items get left-to-right strike-through; all CSS/SVG based                                                             |
| 7.3 Chapter-specific reveal families                                                                            | 8h     | 6.4           | `animate`           | Hero types in; Bio wipes on; Skills assemble; Work cascades; Contact resolves — each distinct but within one system                                                                             |
| 7.4 Theme toggle portrait sequence (frame-by-frame transformation)                                              | 6h     | 2.7, 3.3      | `overdrive`         | Switching to "After Hours" triggers short (4–8 frame) image sequence ending on sunglasses; reverse on return; falls back to instant swap for reduced motion; frames lazy-loaded on first toggle |
| 7.5 Theme toggle surface choreography (palette + accent swap in ≤650ms)                                         | 4h     | 2.7, 1.2      | `animate`           | CSS variable transitions animate surfaces, accents, and text in one coordinated moment; no layout shift                                                                                         |
| 7.6 Project card directional hover + metadata tray expand                                                       | 3h     | 5.3           | `delight`           | Pointer-entry-aware motion; keyboard focus mirrors intent                                                                                                                                       |
| 7.7 Skills chip pulse/align on category hover                                                                   | 3h     | 4.2           | `animate`           | Chips respond to category focus with subtle alignment animation                                                                                                                                 |
| 7.8 Contact completion feedback (email copy toast, CTA states)                                                  | 2h     | 6.1           | `delight`           | Copy email action shows accessible toast; CTA has pressed/success state                                                                                                                         |
| 7.9 `prefers-reduced-motion` full pass                                                                          | 3h     | 7.1–7.8       | `animate`           | Every animation replaced with instant state + short opacity transition; checklist logic and theme semantics preserved                                                                           |
| 7.10 Run `quieter` to calibrate animation intensity                                                             | 2h     | 7.9           | `quieter`           | Review all animations for aggressiveness; tone down any that feel overwhelming while preserving delight; elegance over spectacle                                                                |

**Phase 7 Total**: ~43h

---

## Phase 8: Responsive QA, Accessibility & Performance (Weeks 7–8)

> Validate across breakpoints, audit accessibility, optimize for production.
>
> **Skills**: `audit` (comprehensive audit) · `adapt` (responsive QA) · `optimize` (performance) · `normalize` (design system consistency) · `polish` (final detail pass) · `harden` (resilience)

| Task                                                                                | Effort | Depends On | Skill            | Done Criteria                                                                                                                                 |
| ----------------------------------------------------------------------------------- | ------ | ---------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.1 Desktop QA (≥1024px) — all sections, both themes, both locales                  | 4h     | Phase 7    | `adapt`          | No layout breaks, TODO rail functional, animations smooth, both themes render correctly in en + es                                            |
| 8.2 Tablet QA (768–1023px) — compressed rail, simplified overlaps                   | 4h     | Phase 7    | `adapt`          | Narrower rail readable; section transitions simpler; no horizontal overflow                                                                   |
| 8.3 Mobile QA (320–767px) — mission tracker mode, chapter cards                     | 4h     | Phase 7    | `adapt` `harden` | Sticky progress dock works; all content accessible; touch targets ≥44px; Spanish expansion doesn't break layout                               |
| 8.4 Accessibility audit (keyboard nav, screen reader, contrast, focus rings)        | 6h     | Phase 7    | `audit`          | All interactive elements keyboard-reachable; focus indicators visible and styled; ARIA landmarks correct; WCAG AA contrast met in both themes |
| 8.5 Performance optimization (Lighthouse ≥90, image optimization, animation budget) | 6h     | Phase 7    | `optimize`       | Lighthouse Performance/Accessibility/SEO ≥90; hero portrait preloaded; supplemental photos lazy-loaded; no scroll jank                        |
| 8.6 SEO validation (semantic HTML, JSON-LD, OG tags, sitemap)                       | 3h     | 6.4        | —                | Heading hierarchy correct; JSON-LD still present; OG tags updated for new content; sitemap generates cleanly                                  |
| 8.7 Cross-browser testing (Chrome, Firefox, Safari, Edge)                           | 4h     | 8.1–8.3    | —                | No critical visual or functional differences across evergreen browsers                                                                        |
| 8.8 Run `normalize` to verify design system consistency                             | 3h     | 8.1–8.3    | `normalize`      | All components use design tokens consistently; no hardcoded colors/spacing outside token system; theme switching uniform across sections      |
| 8.9 Update/fix all broken tests from component changes                              | 6h     | Phases 3–7 | —                | All 21+ test files pass; new tests added for new components; `npm run build` succeeds cleanly                                                 |
| 8.10 Run `polish` for final detail pass                                             | 3h     | 8.8, 8.9   | `polish`         | Alignment, spacing, consistency, and micro-detail issues fixed; pixel-level refinements; production-ready quality                             |
| 8.11 Final lint + format pass                                                       | 1h     | 8.10       | —                | `npm run lint` and `npm run format` pass with no errors                                                                                       |
| 8.12 **Milestone 4 gate**: Final `critique` before production deploy                | 2h     | 8.10       | `critique`       | Final design review: overall experience quality, narrative flow, theme coherence, interaction delight; sign-off for launch                    |
| 8.13 Production deploy to Netlify                                                   | 2h     | 8.1–8.12   | —                | Site live at juanelojga.com; cache headers correct; redirects working; no console errors                                                      |

**Phase 8 Total**: ~48h

---

## Dependencies Map

```
Phase 0 (teach-impeccable) ──> Phase 1 (Tokens/Theme) ──────────────────────────┐
  ├── 1.1 Tokens ──> 1.2 CSS Vars ──> 1.6 Theme Persistence                     │
  ├── 1.1 ──> 1.3 Typography ──> 1.5 Token Tests                                │
  └── 1.4 Fonts (parallel)                                                       │
                                                                                 │
Phase 2 (Layout/Rail) ───────────────────────────────────────────────────────────┐│
  ├── 2.1 Data Model ──> 2.2 TodoRail ──> 2.3 Mobile Rail                       ││
  ├── 2.2 + 1.2 ──> 2.4 Layout Shell ──> 2.6 IntersectionObserver              ││
  ├── 1.6 ──> 2.7 Theme Toggle ──> 2.8 Locale Switcher                         ││
  └── 2.9 Tests ──> 2.10 critique gate (Milestone 1)                            ││
                                                                                ││
Phase 3 (Hero/Bio) ──────────────────────────────────────────────────────┐      ││
  ├── 3.1 HeroNarrative ──> 3.2 Typing Anim ──> 3.4 TODO Teaching      │      ││
  ├── 3.1 ──> 3.3 Portrait ────────────────────────────────────────┐    │      ││
  ├── 3.5 BioChapter ──> 3.6 Retire old ──> 3.7 i18n ──> 3.8 Tests│    │      ││
  └────────────────────────────────────────────────────────────────┘    │      ││
                                                                       │      ││
Phase 4 (Skills) & Phase 5 (Work Log) — can run in partial parallel    │      ││
  ├── 4.1–4.6 (Skills) ──────────────────────────────────>─┐           │      ││
  ├── 5.1–5.7 (Work Log) ──> 5.8 critique gate (M2) ─────>├─> 6.4    │      ││
  └────────────────────────────────────────────────────────┘           │      ││
                                                                       │      ││
Phase 6 (Contact + Page Wiring) ──> 6.8 critique gate (M3)                    ││
  ──────> Phase 7 (Animation) ──> 7.10 quieter calibration                     ││
  ──────> Phase 8 (QA) ──> 8.8 normalize ──> 8.10 polish ──> 8.12 critique (M4)││
```

**Critical Path**: Phase 0 → Phase 1 → Phase 2 (Layout + critique gate) → Phase 3 (Hero) → Phase 6.4 (Page wiring) → Phase 6.8 (critique gate) → Phase 7 (Animation + quieter calibration) → Phase 8 (audit → normalize → optimize → polish → critique gate → deploy)

Phases 4 and 5 can proceed in parallel once Phase 2 is complete, but must finish before Phase 6.4 (page assembly).

---

## Risks & Mitigation

| Risk                                                  | Impact | Probability | Mitigation                                                                                                                                                         |
| ----------------------------------------------------- | ------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Portrait photography assets not ready                 | High   | Medium      | Use placeholder images for development; design portrait containers to accept any same-dimension image pair; block only Phase 7.4 (frame sequence) on actual assets |
| TODO rail feels gimmicky instead of useful            | High   | Medium      | Implement 3-state logic early (Proposal 1) and user-test with real scrolling; simplify labels if playful phrasing confuses recruiters                              |
| Animation performance issues on low-end devices       | Medium | Medium      | Set strict animation budget (opacity + transform only); test on throttled CPU early in Phase 7; have reduced-motion as full fallback                               |
| Spanish text expansion breaks layouts                 | Medium | High        | Test with Spanish locale from Phase 2 onward; use flexible containers (`min-width` not fixed `width`) for TODO labels and CTAs                                     |
| Scope creep from design direction proposals           | High   | High        | Prioritize Proposals 1, 3, 4, 9, 10 per design doc; defer Proposals 2, 5, 6, 7, 8 to post-launch iteration                                                         |
| Existing tests break during component retirement      | Low    | High        | Update tests alongside component changes in each phase (not deferred to Phase 8); run `npm test` after each phase                                                  |
| Theme toggle portrait sequence too heavy              | Medium | Medium      | Limit to 4–8 optimized WebP frames; lazy-load on first toggle; disable for reduced motion; measure transfer size                                                   |
| Case study and resume pages break from layout changes | Medium | Medium      | Keep sub-pages on a simplified layout variant without TODO rail; test in Phase 6.6                                                                                 |

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
