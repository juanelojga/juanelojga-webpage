---
name: pm-prd
description: Generates a complete Product Requirements Document (PRD). Use this skill when the user wants to write a PRD, product spec, requirements document, or feature spec. Also triggers for "draft the PRD", "finalize the spec", "generate PRD", "write the requirements", "write the spec", "turn this into a PRD", or "create a product document". This skill checks readiness using pm-context.md and generates either a full PRD (if well-prepared) or a gap-flagged draft (if preparation is incomplete). Activate even if the user hasn't explicitly said "PRD" — if they've been working through a product problem and seem ready to document it, offer to generate the PRD.
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
---

# PM PRD Generator

Your job is to produce a clear, structured, actionable PRD that a cross-functional team (design, engineering, data) can use to build and measure the right thing. The PRD is the culmination of the PM workflow — it synthesizes everything learned into a single source of truth.

## Step 1: Readiness Check

Read `pm-context.md` and run the confidence score calculation (see `references/prd-template.md` for scoring table):

```
## PRD Readiness Check

Stage 1 — Problem Definition:   [Done / Missing]
Stage 2 — Brainstorm:           [Done / Missing]
Stage 3 — Research Synthesis:   [Done / Missing]
Stage 4 — User Flows:           [Done / Missing]
Stage 5 — UI Mocks:             [Done / Missing]

PRD Confidence Score: X/10
```

**Based on score, choose a generation mode:**

| Score | Mode                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------- |
| 8–10  | **Full PRD** — generate the complete document                                                             |
| 5–7   | **Gap-flagged PRD** — generate full structure with `[NEEDS INPUT]` placeholders for missing sections      |
| <5    | **Skeleton PRD** — generate the structure with embedded interview questions; strongly recommend more prep |

Always state the mode and score before generating.

## Step 2: Announce Gaps

For any `[NEEDS INPUT]` sections, explain what's missing and how to fill it:

```
## What's Missing
- **User Research** (Stage 3 incomplete): The "User Research & Key Insights" section
  will have placeholders. Complete pm-research to fill these in.
- **UI Mocks** (Stage 5 incomplete): The wireframes section will reference flows
  but won't have visual links. Complete pm-mock to add these.
```

Offer to proceed or to fill gaps first.

## Step 3: Generate the PRD

Write the PRD to `documents/PRD.md` in the working directory. If the `documents` folder does not exist, create it first. Use the full template from `references/prd-template.md`. Pull content from `pm-context.md` for each section.

### PRD Structure

```markdown
# PRD: [Feature/Project Name]

**Author:** [PM name if known, otherwise leave blank]
**Status:** Draft
**Last Updated:** [date]
**PRD Confidence Score:** X/10

---

## 1. Executive Summary

[2–3 sentences: what we're building, why, and what success looks like]

## 2. Problem Statement & Why Now

**The Problem:**
[Clear statement of the user problem, from pm-context.md Problem Statement]

**Why Now:**
[Timing rationale — market opportunity, user demand signal, strategic priority]

**Who Has This Problem:**
[User segment, severity, frequency]

## 3. Goals & Success Metrics

**Primary Goal:**
[What outcome are we trying to achieve?]

**OKRs / KPIs:**
| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| [Metric 1] | [current] | [goal] | [date] |
| [Metric 2] | [current] | [goal] | [date] |

**Counter-metrics (what we won't sacrifice):**

- [e.g., don't hurt retention while improving activation]

## 4. User Research & Key Insights

[Pull from pm-context.md Research Synthesis]

**Key Insight 1:** [summary]

- Supporting evidence: [quote or data]
- Product implication: [what this means for design]

**Key Insight 2:** [summary]
...

**What We Explicitly Chose Not to Do (based on research):**
[This signals rigor and intentionality]

## 5. Proposed Solution

**Summary:**
[1 paragraph describing the solution approach]

**Why This Approach:**
[Reference the selected hypothesis from brainstorm + supporting research]

**What We're Not Building:**
[Scope boundaries — what's explicitly out of scope and why]

## 6. Detailed Requirements

### Functional Requirements

| #   | Requirement   | Priority     | Notes |
| --- | ------------- | ------------ | ----- |
| F1  | [requirement] | Must Have    |       |
| F2  | [requirement] | Should Have  |       |
| F3  | [requirement] | Nice to Have |       |

Use MoSCoW prioritization:

- **Must Have**: Core to the solution working
- **Should Have**: Important but workable without
- **Could Have**: Adds value if time permits
- **Won't Have (this release)**: Explicitly excluded

### Non-Functional Requirements

| #   | Requirement   | Target                         |
| --- | ------------- | ------------------------------ |
| NF1 | Performance   | [e.g., page load <2s]          |
| NF2 | Accessibility | [e.g., WCAG 2.1 AA]            |
| NF3 | Security      | [e.g., data encrypted at rest] |

## 7. User Flows & Wireframes

[Pull from pm-context.md User Flows and Mocks]

**Happy Path:**
[Mermaid diagram or description]

**Error / Edge Cases:**
[Mermaid diagram or description]

**Wireframes:**
[Link to .pen file or embed screenshots]

## 8. Technical Considerations

[Things engineers need to know — surface area, dependencies, gotchas]

- **API changes needed:** [list]
- **Data model changes:** [list]
- **Dependencies on other teams:** [list]
- **Performance implications:** [flag any]
- **Analytics / tracking requirements:** [events to instrument]

[If Stage 4 or 5 are incomplete: `[NEEDS INPUT — discuss with engineering]`]

## 9. Launch Plan & Phasing

**Phase 1 (MVP):** [what ships first]
**Phase 2:** [follow-on scope]

**Rollout Strategy:**

- [ ] Feature flag / % rollout
- [ ] Beta users first
- [ ] Full launch

**Launch Checklist:**

- [ ] Engineering complete
- [ ] QA signed off
- [ ] Analytics instrumented
- [ ] Support documentation updated
- [ ] Marketing / comms aligned (if external-facing)

## 10. Risks & Mitigations

| Risk   | Likelihood | Impact | Mitigation   |
| ------ | ---------- | ------ | ------------ |
| [risk] | H/M/L      | H/M/L  | [mitigation] |

## 11. Open Questions

| #   | Question   | Owner  | Due    |
| --- | ---------- | ------ | ------ |
| 1   | [question] | [name] | [date] |

---

_Generated by pm-prd skill. PRD Confidence Score: X/10._
```

## Step 4: `[NEEDS INPUT]` Handling

For any section where content is missing from `pm-context.md`, insert:

```
[NEEDS INPUT — Source: Complete [pm-skill-name] to fill this section]
```

Be specific: tell the user _which skill_ to run and _what it will generate_.

## Step 5: Update pm-context.md

- Set `## PRD → File: ./documents/PRD.md`
- Set `## PRD → Status: [x] Draft`
- Mark Stage 6 as `[x]` in Stage Progress
- Update `_Last updated:` date

## Step 6: Handoff

After writing the PRD:
"PRD written to `documents/PRD.md`. Confidence score: X/10.

[If gaps exist]: The following sections need input: [list]. Run [skill] to fill them in.

Recommended next steps:

1. Share with engineering for a feasibility check
2. Review open questions with stakeholders
3. Align on success metrics with your data team"

## Reference Files

- `references/prd-template.md` — Full PRD template with section-by-section guidance, confidence score table, common pitfalls, and example content
