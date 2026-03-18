# Design Direction: Portfolio Redesign

## 1. Executive Intent

Replace the conventional portfolio shell with a narrative interface built around a persistent TODO rail and a developer-origin story. The site should feel immediately new, modern, and technically confident: a visitor lands on a bold Hello World moment, sees a checklist of meaningful tasks on the right edge, and experiences the page as a sequence they complete with you rather than a brochure they skim. The redesign should preserve Juan Almeida's positioning as a full-stack and AI engineer who can build automations, applications, and ambitious new products, while reinventing navigation, motion, theme behavior, and the visual relationship between content and portrait photography.

- Success criteria:
- Visitors understand who Juan is and what he builds within 10 seconds.
- The TODO rail clearly indicates progress and increases section-to-section continuation through the page.
- Desktop and mobile experiences retain the same concept without degrading SEO, crawlability, or accessibility.
- Theme switching feels memorable and premium, including portrait variation, without introducing layout shift or excessive runtime cost.
- The final experience feels differentiated from standard portfolio patterns and avoids the "template" look.

## 2. Assumptions and Constraints

- Known constraints:
- The site must remain performant, SEO-friendly, and easily readable by bots and LLM-driven tools.
- The first-release audiences are recruiters, potential clients, and technical peers.
- The first-release locales are English and Spanish.
- Current architecture is Astro-first with JSON-backed content and bilingual UI strings.
- The user wants to retire the traditional navbar and footer treatment.
- Strong animation and visual effects are required, but failure is defined as motion feeling weak or generic.

- Assumptions made due to missing context:
- The homepage remains a single long-form narrative page with optional internal links rather than multiple interactive app-like routes.
- The TODO items map to four major sections: Intro, Skills, Work, Contact.
- Resume access moves into the Contact section and stays visually secondary to the main narrative.
- Portrait assets can be produced as a coordinated sequence for light mode and dark mode, including a sunglasses variation for the dark-mode transformation.
- Browser support targets current evergreen browsers on desktop and mobile.

- Open questions that still need answers:
- TODO labels should use playful developer-language rather than plain imperative labels.
- The dark-mode portrait transformation should use a frame-by-frame sequence, constrained tightly enough to remain performant.
- Direct contact is sufficient for the first release; no lead-capture form is required on the homepage.
- Resume access should live inside the Contact section.

## 3. Experience Principles

- Build a narrative interface, not a brochure. Every section should feel like progressing through a meaningful sequence.
- Make developer culture the metaphor. Hello World, TODO states, command-like labels, and completion logic should feel native to engineering rather than gimmicky.
- Keep the right rail sacred. The TODO navigation is the main orientation system and must stay readable, useful, and responsive across breakpoints.
- Use motion to confirm progress. Animations should explain state changes, not merely decorate them.
- Let photography carry personality. Portraits should appear as authored editorial elements, not generic profile inserts.
- Preserve machine readability. Semantic HTML, source-order clarity, and content visibility must survive even if advanced effects fail.
- Reward exploration with layered detail. Fast scanners should get the pitch quickly, while deeper visitors discover richer transitions, hover states, and content reveals.
- Anti-principle: Do not recreate a futuristic portfolio cliche with random particles, vague neon noise, or motion that obscures the content.

## 4. Creative Direction

### 4.1 Visual Narrative

- Emotional arc:
- First impression: curious, sharp, unconventional.
- Mid-scroll: competent, multifaceted, credible.
- End state: confident that Juan can design, build, and ship technically sophisticated products.

- Mood descriptors and tone words:
- Editorial developer desktop.
- Precise but playful.
- High-agency.
- Technical without coldness.
- Cinematic in transitions, restrained in layout.

- Core concept:
- The page behaves like a personal execution board. Visitors are not browsing sections; they are watching work items resolve in real time as the story unfolds.
- The task labels should feel playful and native to developer culture, with examples such as Boot identity, Compile strengths, Unlock work log, and Open channel.

### 4.2 Typography System

- Display strategy:
- Use an expressive monospace-forward display layer for system cues, TODO labels, checkpoints, and Hello World moments.
- Pair it with a more human editorial sans or serif-sans hybrid for long-form descriptive copy so the page does not feel like a code editor parody.

- Hierarchy rhythm:
- Level 0 hero display: 64-88px desktop, 42-56px tablet, 32-40px mobile, high contrast, tight line-height.
- Level 1 section titles: 36-48px desktop, 30-36px tablet, 26-30px mobile.
- Level 2 support labels and rail states: 14-18px uppercase or sentence case, strong letter spacing only for system metadata.
- Body copy: 18-20px desktop, 16-18px mobile with relaxed leading.
- Meta content: 13-15px monospace for timestamps, tags, and state labels.

- Weight rules:
- Use heavy weights sparingly for key claims and TODO completion states.
- Keep descriptive paragraphs at regular or medium to prevent visual fatigue.

### 4.3 Color and Surface System

- Theme strategy:
- Theme 1 "Normal Mode": bright, crisp, off-white and mineral neutrals with a vivid signal color.
- Theme 2 "Night Shift": deep carbon and smoked green-blue surfaces with selective bright accents and portrait sunglasses variant.
- Theme naming should be more expressive than plain Light and Dark. Recommended labels: Build Mode and After Hours.

- Suggested color roles:
- Primary signal: acid green or digital lime for completion, focus, and active rail states.
- Secondary signal: electric cyan for hover trails, info accents, and data annotations.
- Warm counter-accent: muted amber for warnings, timestamps, or selected detail moments.
- Light surfaces: chalk, concrete, and pale graphite rather than pure white.
- Dark surfaces: charcoal, ink, smoked teal, and near-black.

- Accessibility notes:
- Checked states must never rely on color alone; use icon, stroke, and text-decoration change.
- The active section state needs at least 4.5:1 contrast for text and a clearly visible focus ring.
- Portrait overlays must not reduce adjacent text contrast.

### 4.4 Composition and Spacing

- Grid strategy:
- Desktop uses a split composition: large content stage on the left and persistent TODO rail on the right.
- Tablet compresses the rail into a narrower sticky column.
- Mobile converts the rail into a sticky top progress module or bottom dock with a compact checklist summary.

- Section rhythm:
- Each major section should occupy roughly one narrative "chapter" with clear entry and exit transitions.
- Alternate density: one section can be text-led, the next image-led, the next card-led, to avoid repetitive scanning.

- Whitespace policy:
- Use generous vertical spacing around hero and work sections.
- Reserve tight spacing for system labels, stats, and supporting metadata.

- Asymmetry and emphasis:
- Allow portrait crops to break the grid edge.
- Use occasional overlaps between photo planes and copy containers.
- Keep overlap moments deliberate and limited to one emphasis move per section.

### 4.5 Personal Photo Art Direction

- Objective:
- Use photography as a core design material, not filler. The images should make the interface feel authored, personal, and unmistakable.

- Photo system structure:
- One primary hero portrait pair for theme switching.
- Two to three supporting editorial crops distributed across Intro, Skills, and Work.
- One optional close-up detail crop for texture, such as hands on keyboard, side profile, glasses detail, or silhouette.

- Recommended angles:
- Hero light-mode base: front three-quarter portrait, camera slightly above eye level, direct but relaxed posture.
- Hero dark-mode sequence: same crop and framing as light mode, with subtle step changes leading to sunglasses-on final frame.
- Supporting portrait 1: side-profile or over-the-shoulder angle to suggest focus and craft.
- Supporting portrait 2: medium shot seated or standing in workspace context, ideally with negative space for layout overlap.
- Supporting detail crop: hands, face crop, or desk interaction shot that can sit inside smaller modules.

- Recommended shot types:
- Clean studio-style portrait with controlled background for the hero.
- Environmental portrait in a real workspace for the bio or work chapter.
- Tight editorial crop for texture and section transitions.
- Optional motion-strip sequence for the frame-by-frame dark-mode transition.

- Recommended expressions and attitude:
- Light mode: calm, confident, approachable, attentive.
- Dark mode: sharper, more playful, slightly more self-aware, with the sunglasses reveal acting as the personality shift.
- Avoid exaggerated smiles, overly serious intimidation poses, or stock-photo confidence gestures.

- Styling notes:
- Keep wardrobe simple and timeless so the interface, not the clothes, carries the concept.
- Use one consistent silhouette between the hero's light and dark image sequence so the transformation reads clearly.
- If sunglasses are used, choose a shape that reads instantly at small sizes and does not obscure the face too heavily.

- Background and lighting guidance:
- Light mode should use soft, directional light with subtle shadow definition and a clean, low-distraction background.
- Dark mode frames should use stronger contrast and a slightly more dramatic key light, but preserve recognizable facial structure.
- Avoid busy environments that compete with the typography or TODO rail.

- Implementation notes:
- Keep all hero sequence frames identical in dimensions, crop, and alignment.
- Limit the frame sequence to a short burst, ideally 4 to 8 frames, triggered only on explicit theme change.
- Provide WebP or AVIF assets and a non-animated fallback final frame for reduced motion or low-power scenarios.

## 5. Interaction and Motion Spec

### 5.1 Motion Philosophy

- Motion should communicate progression, activation, and authored intent.
- Every animation must answer one of three questions: Where am I now, what changed, or why should I care?
- The overall motion language should feel like tasks resolving, terminals waking, and layers sliding into focus, not like generic fade-ins.

### 5.2 Key Animation Behaviors

- Page load choreography:
- The TODO rail appears first as an incomplete checklist.
- The Hello World line types or resolves in a controlled sequence, followed by a short system acknowledgment pulse.
- Portrait imagery enters on a slight delay via masked reveal or parallax crop, not a raw fade.
- The first TODO item should visibly move through pending, active, and completed states so the interaction model is learned immediately.

- Section reveal behavior:
- As a section becomes active, the corresponding TODO item animates from pending to in-progress to completed.
- The active line should receive a cursor-like sweep, then a checkmark draw, then a subtle strike-through settle once the section threshold is crossed.
- Content panels should use distinct reveal families per chapter: hero types in, intro wipes on, skills assemble, work cascades, contact resolves.
- The previous and current chapter should be visually connected by a subtle trace or field highlight so the rail never feels detached from the content stage.

- Hover and focus states:
- TODO items should respond to hover with preview emphasis, not full activation.
- Cards and links should have directional motion tied to pointer entry, with strong keyboard-visible focus states that mirror the same intent.

- Scroll-linked moments:
- The hero can pin briefly while the first TODO item resolves.
- Portrait layers may shift subtly with scroll, but limit transforms to opacity and translate for performance.
- Work section transitions can stage project cards as a cascade tied to scroll progress.
- On mobile, the same progression logic should survive through a compact mission-tracker bar rather than a reduced desktop imitation.

- Reduced-motion fallback behavior:
- Replace typing, parallax, and masked morphs with instant state changes plus short opacity transitions.
- Preserve checklist logic and theme change semantics without animated transforms.

### 5.3 Micro-interactions Worth Shipping

- TODO item activation sweep that simulates a cursor selecting the next task.
- Three-state TODO logic with a distinct active state before completion.
- Checkmark draw animation with a slight overshoot when a section is completed.
- Strike-through line that grows left-to-right once completion is confirmed.
- Theme toggle that triggers a short frame-by-frame portrait sequence while changing copy tone and surface palette.
- Hello World line that resolves with a subtle syntax-highlight effect.
- Project card hover that expands a metadata tray instead of only lifting the card.
- Skills section chips that pulse or align into clusters based on category hover.
- Contact action that copies email or opens contact channels with a completion-state feedback toast.
- Locale switch that preserves the current section and replays only lightweight contextual transitions.

## 6. Component-Level Redesign Plan

### Global Page Shell

- Current issue:
- The current shell relies on a standard sticky navbar and a footer, which signals a conventional portfolio pattern immediately.

- New direction:
- Replace the navbar with a persistent TODO rail and a compact utility strip containing theme and locale controls.
- Retire the traditional footer on the homepage; instead, end with a strong final contact chapter that acts as the closing state.
- Treat the TODO labels as playful system prompts rather than literal nav labels.

- Behavior details:
- The TODO rail remains pinned on desktop and tablet.
- On mobile, it condenses into a sticky progress dock with expandable checklist detail.

- Content guidance:
- Rail labels should read like playful developer actions. Recommended first-pass labels:
- Boot identity
- Compile strengths
- Unlock work log
- Open channel

- Accessibility notes:
- Mark the rail as a navigation landmark with clear current-state semantics.
- Ensure the visible order matches DOM order or provide explicit skip links.

- Implementation notes:
- Use IntersectionObserver to drive the active and completed states.
- Keep section source order semantic for bots and assistive tech.

### Hero / Intro

- Current issue:
- The current hero communicates capability but looks like a familiar developer landing page.

- New direction:
- Introduce a high-impact Hello World headline paired with a supporting line that translates the metaphor into real value: building AI systems, automations, and applications that ship.

- Behavior details:
- Hello World loads first.
- Supporting copy and CTA appear as if the first task has been opened.
- Portrait imagery should feel integrated into the system frame rather than placed beside it.
- The hero should teach the three-state TODO system by resolving Boot identity within the opening interaction.

- Content guidance:
- Keep the intro concise: who Juan is, what he builds, and why that matters.
- Use one primary CTA and one secondary CTA only.

- Accessibility notes:
- Typing effects must remain readable if JavaScript fails.
- Avoid ARIA live announcements for purely decorative sequencing.

- Implementation notes:
- Keep headline text in static HTML.
- Animate by splitting spans client-side only after first paint.

### Bio / Intro Section

- Current issue:
- Personal context is scattered across existing sections and lacks a single compelling narrative block.

- New direction:
- Create a short editorial bio chapter that connects engineering depth, product thinking, and a bias for building useful things.

- Behavior details:
- Reveal copy in stacked blocks as the TODO item completes.
- Allow one portrait crop or supporting lifestyle image to anchor the section.
- Use the photo here as the first editorial interruption so the page does not feel like text followed by more text.

- Content guidance:
- Emphasize developer identity, automation expertise, and ability to create new products end-to-end.
- Avoid generic self-description paragraphs.

- Accessibility notes:
- Maintain readable line lengths and no justified text.

- Implementation notes:
- This can absorb current Philosophy and Vision content into a tighter narrative.

### Skills Section

- Current issue:
- Current skills and timeline content appear in a standard grid, which undersells expertise.

- New direction:
- Present skills as an interactive competency matrix or modular "toolbelt" board with grouped clusters: Build, Scale, AI, and Ship.
- On mobile, reframe this as a compact mission tracker card stack rather than shrinking the desktop matrix.

- Behavior details:
- Category focus changes nearby supporting proof points.
- Chips can animate into place from different vectors, then settle into a clean structure.

- Content guidance:
- Prioritize outcomes and categories over long undifferentiated lists.
- Surface a few signature strengths first.

- Accessibility notes:
- Hover-only details must also be available on focus and touch.

- Implementation notes:
- Existing JSON skill data can feed grouped views without changing the content source.

### Projects and Experience Section

- Current issue:
- Projects and timeline currently read like separate portfolio blocks instead of one proof-of-work chapter.

- New direction:
- Merge featured projects and experience into a single Work Log chapter where project cards and role milestones reinforce each other.

- Behavior details:
- As the TODO item activates, projects can cascade in while experience markers lock into place like completed milestones.
- Allow one highlighted case study to expand more deeply than the others.
- Add a connector treatment from the active TODO item into the highlighted work area to reinforce that the rail is driving the narrative.

- Content guidance:
- Lead with outcomes, architecture complexity, and measurable impact.
- Keep case-study entry points visible but secondary to the narrative.

- Accessibility notes:
- Preserve standard links for each case study.
- Avoid timeline-only communication without textual dates and labels.

- Implementation notes:
- Reuse current project and experience JSON, but present them in a combined sectional layout.

### Contact Section

- Current issue:
- The current contact block is functional but visually generic.

- New direction:
- Turn contact into the final unresolved task, then complete it only when the user engages with a CTA or reaches the final viewport threshold.

- Behavior details:
- The last TODO item should feel slightly different: less "done" and more "ready to start."
- Social actions and email copy should provide strong completion feedback.

- Content guidance:
- Offer one clear primary direct-contact action, one concise supporting sentence, secondary social links, and a visible resume entry point inside this section.

- Accessibility notes:
- Any success message must be announced accessibly.
- Touch targets should be generous.

- Implementation notes:
- Do not include lead capture on the homepage in the first release. Keep the path direct: email, socials, and resume.

### Theme Toggle and Portrait System

- Current issue:
- The current visual system does not use theme as a narrative device.

- New direction:
- Make theme switching a character moment: normal mode presents the core identity, while dark mode reveals an alternate portrait styling such as sunglasses and a more nocturnal palette.

- Behavior details:
- The switch should animate surfaces, accent roles, and portrait imagery in one choreographed moment under 650ms.
- Use a short frame-by-frame sequence for the portrait transformation, ending on the sunglasses frame in dark mode and reversing cleanly on return.
- Do not animate every element independently; use layered CSS variables plus one image-plane transition.

- Content guidance:
- Theme names can be more expressive than "light" and "dark," as long as labels remain understandable.

- Accessibility notes:
- Respect persisted user preference and system preference on first load.
- Maintain fully legible text in both themes.

- Implementation notes:
- Use paired optimized images with the same crop and dimensions to prevent layout shift.
- Keep the sequence opt-in on theme toggle only; do not replay it on every navigation or scroll event.

## 7. Responsive Behavior Matrix

- Desktop strategy:
- Fixed or sticky TODO rail on the right, wide content stage on the left, large editorial hero, layered portrait treatments, and richer scroll choreography.

- Tablet strategy:
- Narrower right rail with shorter labels or icon-plus-label format.
- Reduce layered overlaps and keep section transitions simpler to protect readability.

- Mobile strategy:
- Treat mobile as a first-class mission tracker mode, not a fallback.
- Convert the right rail into a sticky top progress strip or bottom task dock.
- Use horizontal progress summaries and reveal the full playful checklist on demand.
- Collapse multi-column layouts into clear sequential chapters with shorter text blocks and task-linked content cards.

- Touch and pointer behavior differences:
- Hover previews become tap-to-preview or are removed on touch devices.
- Swipe or scroll should not accidentally trigger complex motion states.
- Maintain visible affordances for tappable TODO items and cards.

## 8. Accessibility and Inclusion Requirements

- Keyboard and focus behavior:
- Every interactive item in the rail, theme switcher, locale switcher, cards, and contact actions must be reachable by keyboard.
- Focus indicators should be stylistically aligned with the design, high-contrast, and never suppressed.

- Screen reader expectations:
- Use semantic headings in content order.
- Expose the TODO rail as navigation with stateful language such as current, completed, or upcoming.
- Decorative portrait transitions must remain hidden from assistive tech.

- Contrast and type sizing requirements:
- Target at least WCAG AA contrast for all text and controls.
- Maintain body copy at readable sizes across breakpoints, especially in dark mode.

- Motion and cognitive load considerations:
- Support reduced motion fully.
- Keep only one high-attention animation active at a time per viewport region.
- Avoid continuous pulsing loops that compete with reading.

- Locale and content expansion handling:
- Spanish strings are longer in several current sections, so TODO labels and CTA containers must handle expansion cleanly.
- Avoid rigid widths that break when translated.

## 9. Performance and Feasibility Guardrails

- Animation budget guidance:
- Prefer opacity, transform, clip-path in limited use, and CSS variable transitions.
- Avoid scroll handlers that mutate layout on every frame; use IntersectionObserver and requestAnimationFrame only when necessary.

- Image and media loading strategy:
- Use optimized portrait pairs per theme with consistent dimensions and a short frame sequence for theme transformation.
- Preload only the hero portrait used on initial theme.
- Lazy-load supplemental photos deeper in the page.
- Load dark-mode transition frames only after idle or on first explicit theme interaction.

- CPU and GPU risk points and mitigations:
- Large blur fields, excessive box shadows, and layered parallax can become expensive; keep them localized.
- Mask animations and clip-path reveals should be limited to hero and one supporting chapter.
- Use low-frequency motion in the persistent rail to avoid continuous repaint cost.
- The frame-by-frame portrait sequence must be short, image-optimized, and disabled for reduced motion.

- Priority order if tradeoffs are needed:
- Preserve content readability and checklist clarity first.
- Preserve theme quality second.
- Preserve one or two signature transitions third.
- Remove low-value decorative effects before compromising speed.

## 10. Improvement Proposals (Beyond Brief)

- Prioritized for first implementation pass: Proposals 1, 3, 4, 9, and 10.
- Secondary proposals can support polish, but the initial build should protect the concept strength of the TODO system, the Work Log merge, the theme transformation, the mobile mission-tracker mode, and the chapter-specific motion language.

### Proposal 1

- Problem: The TODO concept can become a novelty if it only mirrors section changes.
- Proposal: Add three task states instead of two: pending, active, completed.
- Why it helps: This makes the rail feel like a living progress system rather than a static checklist and improves orientation while scrolling.
- Complexity: low
- Risk: Requires careful state thresholds to avoid flicker.

### Proposal 2

- Problem: "Hello World" alone is memorable but does not explain value fast enough for recruiters or clients.
- Proposal: Pair it with a concise translator line that states Juan builds AI systems, automations, and applications.
- Why it helps: The page keeps its creative hook while still making the value proposition legible within seconds.
- Complexity: low
- Risk: Weak copy could dilute the punch of the concept.

### Proposal 3

- Problem: Separate Skills, Projects, and Experience sections can feel repetitive and disconnected.
- Proposal: Merge Projects and Experience into a single Work Log chapter, while keeping Skills as its own proof layer.
- Why it helps: This creates stronger story flow and reduces section fatigue.
- Complexity: medium
- Risk: Requires careful curation so neither projects nor experience feels buried.

### Proposal 4

- Problem: Theme switching is often superficial and forgettable.
- Proposal: Make the theme switch a narrative transformation with alternate portrait styling, accent remapping, and light copy tone changes.
- Why it helps: It gives dark mode a real reason to exist and creates a memorable identity moment.
- Complexity: medium
- Risk: Asset production and transition timing need discipline to avoid gimmick territory.

### Proposal 5

- Problem: A right-side rail can become visually detached from the content.
- Proposal: Add subtle connector logic between the active TODO item and the active content chapter using line traces, highlight fields, or localized background shifts.
- Why it helps: The content and navigation feel structurally linked, making the layout more coherent.
- Complexity: medium
- Risk: Overuse could clutter the composition.

### Proposal 6

- Problem: Relying only on personal photos risks feeling static once the initial surprise is gone.
- Proposal: Use photos as editorial fragments: cropped details, layered portrait slices, and one transformed dark-mode variant.
- Why it helps: This adds personality while keeping the composition dynamic and reusable across sections.
- Complexity: medium
- Risk: Requires strong art direction and asset consistency.

### Proposal 7

- Problem: The site currently lacks a strong CTA strategy beyond basic contact prompts.
- Proposal: Introduce one dominant CTA language system, such as "Start a build" or "Open a conversation," and repeat it sparingly across the experience.
- Why it helps: Repetition of a strong action phrase improves recall and conversion clarity.
- Complexity: low
- Risk: If the phrasing is too clever, it may reduce clarity.

### Proposal 8

- Problem: Bots and LLM readers can miss meaning when too much identity is hidden in interaction layers.
- Proposal: Ensure every key message, headline, and proof point exists in semantic HTML before enhancement.
- Why it helps: This protects SEO, AI discoverability, and resilience when scripts or animations fail.
- Complexity: low
- Risk: Requires restraint when implementing animated text effects.

### Proposal 9

- Problem: Mobile versions of concept-heavy desktop layouts often collapse into watered-down versions.
- Proposal: Treat mobile as a first-class "mission tracker" mode with a compact sticky task bar and chapter cards.
- Why it helps: The concept survives intact instead of becoming a plain stacked page.
- Complexity: medium
- Risk: Needs deliberate responsive planning, not just CSS collapse.

### Proposal 10

- Problem: Strong animations can still feel generic if every section uses the same reveal pattern.
- Proposal: Give each chapter its own reveal family within one system: hero types in, bio wipes on, skills assemble, work cascades, contact resolves.
- Why it helps: The page feels authored and memorable without becoming visually chaotic.
- Complexity: high
- Risk: Requires tight motion direction and disciplined timing tokens.

## 11. Implementation Roadmap

### Phase 1: Foundations

- Deliverables:
- Theme tokens for both modes.
- Typography scale and font pair selection.
- Section map reduced to Intro, Skills, Work, Contact.
- TODO rail layout primitive and active-state logic.

- Dependencies:
- Final naming for TODO labels.
- Selected portrait assets and theme image pairs.

- Risks:
- Overcommitting to motion before the layout and copy hierarchy are solved.

- Exit criteria:
- Static desktop and mobile layouts exist with semantic content order, dual-theme tokens, and a functioning sticky progress system.

### Phase 2: Core Sections

- Deliverables:
- New Hero and Intro chapter.
- Reworked Skills chapter.
- Combined Work Log chapter.
- Final Contact chapter.

- Dependencies:
- Approved content hierarchy and CTA language.
- Existing JSON sources mapped to new layouts.

- Risks:
- Work chapter can become too dense if case-study depth is not curated.

- Exit criteria:
- All major sections render in both locales, support both themes, and communicate the story without advanced motion.
- The Contact section includes the resume entry point and works as the only conversion zone needed for the first release.

### Phase 3: Motion and Personality Layer

- Deliverables:
- Hello World choreography.
- TODO progression animations.
- Section-specific reveal patterns.
- Theme transformation sequence with portrait swap.
- Connector treatment between active TODO item and active content chapter.

- Dependencies:
- Stable structural layout from Phase 2.
- Finalized reduced-motion strategy.
- Final portrait sequence assets and crop alignment.

- Risks:
- Motion inconsistency or performance regressions.

- Exit criteria:
- The signature interactions feel premium, remain comprehensible, and degrade cleanly under reduced motion.
- The five prioritized proposals are implemented without introducing scroll jank or mobile concept loss.

### Phase 4: Hardening and Optimization

- Deliverables:
- Accessibility pass.
- Performance pass.
- i18n overflow verification.
- SEO and bot-readability review.

- Dependencies:
- Completed motion layer and content copy.

- Risks:
- Late-stage fixes may expose layout assumptions, especially on mobile and in Spanish.

- Exit criteria:
- Lighthouse and manual review confirm acceptable performance, accessible navigation, stable theme behavior, and readable localized content.

## 12. Acceptance Checklist

- The page explains who Juan is and what he builds within the first viewport.
- The TODO rail is always understandable and accurately reflects the active section.
- Completed states use more than color alone.
- The homepage works without a traditional navbar or footer and does not feel structurally broken.
- The Hello World moment is memorable but does not hide the real value proposition.
- Theme switching updates palette, surfaces, and portrait treatment without layout shift.
- Both English and Spanish versions remain readable and visually stable.
- Reduced-motion users still get clear state changes and complete content access.
- Keyboard users can operate the rail, theme switcher, locale switcher, and all CTAs.
- Semantic HTML preserves headings, landmarks, links, and crawlable content.
- Desktop, tablet, and mobile each feel intentionally designed rather than collapsed from one layout.
- Animation performance remains smooth on modern devices, with expensive effects trimmed where needed.
