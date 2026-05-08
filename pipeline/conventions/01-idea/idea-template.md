# Idea Template (Stage 01)

Defines the required structure of `01-idea/idea.md`. Skills generating this artifact MUST produce a file matching this template exactly. The validator `pipeline/validators/check-idea.sh` enforces it before the gate.

## Required structure

```markdown
---
id: I-001                         # idea identifier, format: I-NNN
jira: <TICKET-ID>                 # source ticket, e.g. BAJ-123
created: YYYY-MM-DD
version: 1                        # bump on every revision
---

# <Idea title — short, action-oriented>

## Problem
<2–4 sentences. WHO has the problem and WHAT is going wrong today.
NOT solution language. NOT product features. Pain only.>

## Hypothesis
<One sentence in the form: "We believe that <change> for <user> will result
in <outcome>, measured by <metric>." This is the falsifiable claim.>

## Target user (high-level)
<2–3 sentences describing the person we are building for. Personas come later
in stage 02 — here we name the segment, not individuals. Example: "Parents of
children aged 3–7 who use audio content as part of bedtime routine.">

## Success criteria
<Bullet list of 3–5 measurable outcomes. Each MUST be a metric with target.
Example: "DAU > 5,000 within 90 days post-launch", "Crash-free sessions ≥ 99.5%",
"30-day retention ≥ 25%". No vague goals like "users are happy".>

- ...
- ...
- ...

## Out-of-scope
<Bullet list of what we are NOT doing. Forces explicit boundary-drawing.
Anything not listed here is fair game for stage 02.>

- ...
- ...

## Sources
<Every claim above must be traceable to source material. List inputs that
informed this idea. If no _inputs/ exist yet, write "Initial brief only."
Each source line: <relative path> [<short reason it was used>].>

- _inputs/2026-05-08-product-brief.md [primary source]
- _inputs/2026-05-08-stakeholder-call-recording.md [stakeholder context]
```

## Validation rules

The validator FAILS the gate if any of these is missing:

1. **Frontmatter present** with `id`, `jira`, `created`, `version`.
2. **All seven H2 sections present**: `Problem`, `Hypothesis`, `Target user (high-level)`, `Success criteria`, `Out-of-scope`, `Sources`. (Plus the H1 title.)
3. **Hypothesis** is a single sentence containing the words "We believe", "for", "result in", and "measured by".
4. **Success criteria** has at least 3 bullet items, each containing at least one numeric value (digit).
5. **Out-of-scope** has at least 1 bullet item.
6. **Sources** has at least 1 bullet item (or the literal string `Initial brief only.`).

## Why these rules

- **Hypothesis format** prevents the most common failure mode of stage 01: writing a "vision statement" that cannot be tested. A hypothesis without a measurable outcome is a wish.
- **Numeric success criteria** force commitment. "Users will be satisfied" passes a vibe check; "NPS ≥ 50" forces measurement.
- **Out-of-scope is required** — listing what we are NOT doing kills 80% of stage 02 disputes.
- **Sources** make the artifact auditable. A reviewer should be able to trace every claim to a transcript or document.
