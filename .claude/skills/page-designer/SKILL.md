---
name: page-designer
description: Create a deep, implementation-ready design direction document for website or app redesign work. Use this skill whenever the user asks to define design ideas, collect visual direction, describe behavior/animations, propose UX or UI improvements, write redesign specs, align on component changes, or turn scattered design thoughts into an actionable document, even if they do not explicitly ask for a "skill" or a "spec".
---

This skill transforms vague design intent into a concrete, creative, and execution-ready document.

Use this skill to produce a single source of truth for redesign work, including:

- creative direction and concept narratives
- behavior and animation design
- responsive behavior by breakpoint
- component-level changes
- accessibility and performance guardrails
- i18n/content implications
- phased implementation plan with acceptance criteria

The goal is not only to document what the user asked for, but also to actively improve it with high-quality suggestions.

## Core Behavior

1. Start with discovery questions before writing the document.
2. Synthesize the answers into a bold but coherent design direction.
3. Challenge weak or generic decisions and suggest stronger alternatives.
4. Produce a deep spec in `documents/` as Markdown.
5. Include implementation details that engineers and designers can execute directly.

## Discovery First (Required)

Before drafting, ask a focused questionnaire.

Ask at least these questions:

1. What experience should users feel in the first 10 seconds?
2. What should stay from the current identity, and what can be reinvented?
3. Which sections or flows matter most to business impact?
4. Which interactions should feel premium or surprising?
5. What are strict constraints (brand, deadlines, performance, accessibility)?
6. Which audiences and locales must this support first?
7. What does failure look like for this redesign?

If the user provides partial answers, proceed with explicit assumptions and mark them clearly in the document.

## Use the Impeccable Skill Set

When forming recommendations, apply the following lenses to improve output quality:

- `typeset`: strengthen typography hierarchy and rhythm.
- `colorize`: define richer, intentional color systems.
- `arrange`: improve layout structure and visual flow.
- `animate`: design meaningful motion, not decorative noise.
- `adapt`: ensure robust behavior across desktop, tablet, and mobile.
- `harden`: add resilience for edge cases, overflow, and missing content.
- `optimize`: improve performance and reduce rendering or asset cost.
- `polish`: refine details that elevate final perceived quality.
- `critique`: identify weaknesses and tradeoffs early.
- `bolder` or `quieter`: tune visual intensity based on user direction.

Do not mention these internal lenses unless the user asks. Use them to improve the document quality.

## Suggest Better Specs (Required)

Always include at least 8 concrete improvement proposals beyond the user's initial brief.

Each proposal must include:

- `Problem`: what is weak or missing now.
- `Proposal`: the new design decision.
- `Why it helps`: user and product impact.
- `Complexity`: low, medium, high.
- `Risk`: key downside or dependency.

Favor high-leverage ideas:

- better information hierarchy
- stronger narrative flow across sections
- differentiated visual language
- clearer CTA strategy
- improved motion choreography
- accessibility upgrades that improve everyone’s experience
- performance-conscious visual richness

## Output File Rules

Write output to:

- `documents/DESIGN_DIRECTION_<project-or-feature>.md`

If no project name is provided, use:

- `documents/DESIGN_DIRECTION_redesign.md`

Use Markdown only.

## Document Template

Use this exact structure:

```markdown
# Design Direction: <Project/Feature Name>

## 1. Executive Intent

- One-paragraph vision statement.
- Success criteria (3-5 measurable outcomes).

## 2. Assumptions and Constraints

- Known constraints.
- Assumptions made due to missing context.
- Open questions that still need answers.

## 3. Experience Principles

- 5-7 principles that guide all UI decisions.
- Include one anti-principle (what we will explicitly avoid).

## 4. Creative Direction

### 4.1 Visual Narrative

- Desired emotional arc from first impression to conversion.
- Mood descriptors and tone words.

### 4.2 Typography System

- Heading/body/display strategy.
- Size and weight rhythm by hierarchy level.

### 4.3 Color and Surface System

- Primary, secondary, accent, and semantic roles.
- Contrast and accessibility notes.

### 4.4 Composition and Spacing

- Grid strategy, section rhythm, whitespace policy.
- Rules for asymmetry, overlap, and emphasis moments.

## 5. Interaction and Motion Spec

### 5.1 Motion Philosophy

- What motion should communicate in this product.

### 5.2 Key Animation Behaviors

- Page load choreography.
- Section reveal behavior.
- Hover/focus states.
- Scroll-linked moments.
- Reduced-motion fallback behavior.

### 5.3 Micro-interactions Worth Shipping

- 5-10 interactions with purpose and expected user impact.

## 6. Component-Level Redesign Plan

For each major component/section:

- Current issue
- New direction
- Behavior details
- Content guidance
- Accessibility notes
- Implementation notes

## 7. Responsive Behavior Matrix

- Desktop strategy
- Tablet strategy
- Mobile strategy
- Touch and pointer behavior differences

## 8. Accessibility and Inclusion Requirements

- Keyboard and focus behavior
- Screen reader expectations
- Contrast and type sizing requirements
- Motion and cognitive load considerations
- Locale and content expansion handling

## 9. Performance and Feasibility Guardrails

- Animation budget guidance
- Image/media loading strategy
- CPU/GPU risk points and mitigations
- Priority order if tradeoffs are needed

## 10. Improvement Proposals (Beyond Brief)

- At least 8 proposals in Problem -> Proposal -> Why -> Complexity -> Risk format.

## 11. Implementation Roadmap

### Phase 1: Foundations

- tokens, layout primitives, typography, color roles

### Phase 2: Core Sections

- critical path sections and interactions

### Phase 3: Motion and Personality Layer

- choreography and micro-interactions

### Phase 4: Hardening and Optimization

- accessibility pass, performance pass, i18n verification

For each phase include:

- Deliverables
- Dependencies
- Risks
- Exit criteria

## 12. Acceptance Checklist

- A practical checklist to validate visual quality, behavior, accessibility, and performance before release.
```

## Quality Bar

The document must be:

- specific enough for implementation
- creative enough to inspire better design decisions
- critical enough to catch weak assumptions
- structured enough for planning and handoff

Avoid generic advice such as "improve spacing" without concrete direction.

## Collaboration Mode

After generating the document:

1. Ask the user which 3 proposals they want to prioritize.
2. Offer a revised version focused on those priorities.
3. If requested, convert the roadmap section into an implementation plan document.

## Optional Extension

If the user asks for visual validation, suggest creating a quick prototype pass for desktop and mobile to verify:

- hierarchy
- readability
- motion comfort
- section pacing
