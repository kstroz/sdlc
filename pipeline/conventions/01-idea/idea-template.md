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

## Platforms
<Bullet list. Pick at least one. Each line follows the shape `- <platform>: <yes|no|deferred>` plus a one-sentence why.
Used downstream by Stage 04 to decide which layers of tech-stack.md need a Choice
vs. `Not applicable`. If unclear from inputs, the agent MUST pause via
`requesting-customer-input` and not guess.>

- mobile-ios: yes — primary technician device
- mobile-android: yes — coexists with iOS in the field fleet
- web: no — manager UI is a separate ticket
- backend: existing — reuse current GitLab service; no new backend in this branch
- cli / desktop / other: no

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

## Platforms section rules

- At least one bullet must end with `: yes` or `: existing`. A document where every platform is `no` or `deferred` does not justify a project.
- Allowed platform keys: `mobile-ios`, `mobile-android`, `mobile-cross-platform`, `web`, `desktop`, `backend`, `cli`, `other`.
- Allowed states: `yes` (we build it on this branch), `no` (explicitly out of scope), `existing` (we integrate with one already deployed), `deferred` (planned for a later branch — reference the JIRA / ticket).
- Tech stack inside a `yes` platform is decided in **Stage 04** (`tech-stack.md` + ADRs), not here. Idea-stage records WHAT, architecture-stage records HOW.
- Forker can also drop a `_inputs/stack-preferences.md` (see `pipeline/conventions/01-idea/stack-preferences-template.md`) to bias the Stage-04 decision; the idea.md still records platform scope only.

## Validation rules

The validator FAILS the gate if any of these is missing:

1. **Frontmatter present** with `id`, `jira`, `created`, `version`.
2. **All required H2 sections present**: `Problem`, `Hypothesis`, `Target user (high-level)`, `Platforms`, `Success criteria`, `Out-of-scope`, `Sources`. (Plus the H1 title.)
3. **Hypothesis** is a single sentence containing the words "We believe", "for", "result in", and "measured by".
4. **Platforms** has at least 1 bullet whose state is `yes` or `existing`.
5. **Success criteria** has at least 3 bullet items, each containing at least one numeric value (digit).
6. **Out-of-scope** has at least 1 bullet item.
7. **Sources** has at least 1 bullet item (or the literal string `Initial brief only.`).

## Why these rules

- **Hypothesis format** prevents the most common failure mode of stage 01: writing a "vision statement" that cannot be tested. A hypothesis without a measurable outcome is a wish.
- **Platforms section** kills the most common Stage 04 surprise — discovering that no one ever wrote down whether the project ships a backend, a web client, or only a mobile app. Capturing it in idea.md means UX (Stage 03) and architecture (Stage 04) start with one less guess.
- **Numeric success criteria** force commitment. "Users will be satisfied" passes a vibe check; "NPS ≥ 50" forces measurement.
- **Out-of-scope is required** — listing what we are NOT doing kills 80% of stage 02 disputes.
- **Sources** make the artifact auditable. A reviewer should be able to trace every claim to a transcript or document.
