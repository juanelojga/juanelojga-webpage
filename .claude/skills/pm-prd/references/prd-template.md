# PRD Template Reference

## PRD Confidence Score Table

| Signal                                                    | Points |
| --------------------------------------------------------- | ------ |
| Stage 1 complete (Problem Definition)                     | 1.5    |
| Stage 2 complete (Brainstorm)                             | 1.5    |
| Stage 3 complete (Research Synthesis)                     | 1.5    |
| Stage 4 complete (User Flows)                             | 1.5    |
| Stage 5 complete (UI Mocks)                               | 1.5    |
| Problem statement is specific (one sentence, no solution) | +1.0   |
| At least one measurable success metric defined            | +0.75  |
| Research has external evidence (not assumptions)          | +0.75  |
| **Maximum**                                               | **10** |

**Interpretation:**

- 8–10: Generate a complete PRD. Minimal placeholders needed.
- 5–7: Generate PRD with `[NEEDS INPUT]` placeholders. Flag gaps prominently.
- <5: Generate skeleton PRD. Embed interview questions. Recommend completing more stages first.

---

## Section-by-Section Writing Guide

### Section 1: Executive Summary

**Length:** 2–4 sentences
**Purpose:** Let a busy stakeholder understand the full PRD in 30 seconds
**Must include:** What we're building, who it's for, why, what success looks like
**Don't include:** Implementation details, edge cases

**Good example:**

> "We're adding a bulk export feature to the Reporting module that lets enterprise users download up to 10 reports simultaneously as a ZIP file. This addresses the top support request from Q3, which accounted for 23% of enterprise tickets. Success is defined as a 30% reduction in export-related support tickets within 60 days of launch."

**Bad example:**

> "This PRD describes the bulk export feature which will allow users to export reports."

---

### Section 2: Problem Statement & Why Now

**Length:** 1–3 paragraphs
**Purpose:** Make the case for why this problem deserves to be solved, now
**Must include:** Specific user pain, evidence of severity/frequency, timing rationale

**Why Now triggers (use whichever applies):**

- Data: "Support tickets up 40% QoQ"
- Strategic: "Key to enterprise expansion which is H1 OKR"
- Competitive: "Competitor X just launched this"
- User demand: "Top feature request with 200+ upvotes"
- Technical: "Now feasible since we built [dependency]"

---

### Section 3: Goals & Success Metrics

**OKR Format:**

```
Objective: [Qualitative direction]
Key Result 1: [Measurable outcome with baseline and target]
Key Result 2: [...]
```

**Counter-metrics (critical — often missed):**
These are metrics you're promising NOT to hurt. Shows you've thought through tradeoffs.

- "We will not increase page load time by more than 200ms"
- "Churn rate stays flat while we improve activation"

**Metric Types to Include:**

- Primary metric (the one that matters most)
- Secondary metrics (leading indicators)
- Guardrail metrics (counter-metrics)
- Measurement window ("within 30 days of launch")

---

### Section 4: User Research & Key Insights

**Structure for each insight:**

1. One-sentence insight statement
2. Supporting evidence (quote, data point, test result)
3. Product implication (what it means for design choices)
4. Confidence level (High / Medium / Low)

**"What We Chose Not to Do" section:**
This is a signal of good product thinking. List things that were considered and explicitly rejected, with brief rationale. Examples:

- "We considered adding real-time collaboration but deprioritized due to complexity and limited demand signal"
- "We considered a CSV-only export but research showed 60% of users need Excel format"

---

### Section 5: Proposed Solution

**Key elements:**

- One paragraph summary (jargon-free, could be read to a customer)
- Why this approach (link to research + hypothesis)
- What's explicitly out of scope (and why — prevents scope creep)

**Scope boundary examples:**

- "Out of scope v1: bulk scheduling, custom export templates, API access"
- "Out of scope: mobile — 92% of export usage is on desktop"

---

### Section 6: Detailed Requirements

**MoSCoW Priority Guidelines:**

| Priority    | Definition                             | Rule of thumb                    |
| ----------- | -------------------------------------- | -------------------------------- |
| Must Have   | Without this, the feature doesn't work | If removed, you can't ship       |
| Should Have | Important but can work around          | Would significantly reduce value |
| Could Have  | Adds polish or edge case coverage      | Nice to have, time-permitting    |
| Won't Have  | Explicitly excluded this release       | Acknowledged and deferred        |

**Writing good requirements:**

- Start with the user: "User can [action]" not "The system shall [behavior]"
- Be testable: Someone should be able to write a test case from it
- Avoid "should" — use "must" or "can" for clarity
- One requirement per line

**Bad requirement:** "The export should be fast and handle lots of files"
**Good requirement:** "User can export up to 10 reports simultaneously; export completes within 30 seconds for <100MB total"

---

### Section 7: User Flows & Wireframes

**Content to include:**

- Mermaid diagram for happy path
- Mermaid diagram for primary error case
- Link or embed to .pen wireframe file
- List of screens covered
- Annotation summary (key design decisions)

**If wireframes are missing:**
`[NEEDS INPUT — run pm-mock to generate wireframes for this section]`

---

### Section 8: Technical Considerations

**What to include (not technical specs — that's engineering's job):**

- Surface area: "This touches the export pipeline and the notifications system"
- New data needed: "We'll need to store export job status and history"
- Dependencies: "Requires completion of the new file storage service (ETA: Q2)"
- Analytics: "We need to instrument: export started, export completed, export failed, format selected"
- Performance flags: "Bulk export for large reports may require async processing"

**What NOT to include:**

- Implementation details (how the backend works)
- Database schema design
- Anything that constrains engineering's choices unnecessarily

---

### Section 9: Launch Plan & Phasing

**Phase structure template:**

```
Phase 1 — MVP (Target: [date])
Scope: [list of Must Have requirements]
Success gate: [what must be true to ship]

Phase 2 — Follow-on (Target: [date])
Scope: [Should Have requirements]

Future Consideration (unscheduled)
Scope: [Could Have / Won't Have this release]
```

**Rollout strategy (pick one or combine):**

- Feature flag: Ship to 0%, ramp up over days/weeks
- Beta group: Ship to named users first, gather feedback
- Internal dogfood: Ship to your own company first
- Full launch: Ship to all users simultaneously (only for low-risk changes)

---

### Section 10: Risks & Mitigations

**Risk taxonomy:**

| Risk Category | Examples                                                |
| ------------- | ------------------------------------------------------- |
| Technical     | Performance issues, infrastructure cost, data migration |
| Product       | Low adoption, wrong problem, feature cannibalization    |
| Business      | Legal/compliance, support load, pricing impact          |
| Timeline      | Dependency slips, scope creep, resource constraints     |

**Risk rating:**

- Likelihood: H (likely to happen), M (possible), L (unlikely)
- Impact: H (blocks launch or major metric harm), M (degraded experience), L (minor)

**Mitigation types:**

- Prevent: Change the plan to avoid the risk
- Monitor: Set up alerts to detect early
- Respond: Have a plan ready if it happens
- Accept: Knowingly take the risk (document why)

---

### Section 11: Open Questions

**Good open questions:**

- Have a clear owner (person responsible for answering)
- Have a deadline (needed by when)
- Are actually open (not rhetorical)

**Categorize by type:**

- Product decision questions: "Should this be a modal or a full page?"
- Business questions: "Does this change pricing for free tier users?"
- Technical questions: "Can we support async export with current infrastructure?"
- Legal/compliance: "Does bulk download of user data require consent flow?"

---

## Common PRD Pitfalls

1. **Solutioning in the problem statement**: "Users need a dashboard" vs. "Users can't find their active projects"
2. **Missing counter-metrics**: What are you promising not to break?
3. **Vague success criteria**: "Users will be happier" — how will you know?
4. **Requirements that can't be tested**: "The system should be intuitive"
5. **No explicit out-of-scope section**: Engineers will build what's not said
6. **Missing analytics requirements**: If you can't measure it, you don't know if you built the right thing
7. **No phasing**: Everything at once = never ships
8. **Open questions without owners**: Questions without owners don't get answered
