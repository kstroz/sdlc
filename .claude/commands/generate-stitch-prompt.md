# Generate Stitch prompt

Produces a Google Stitch-ready UI description for every screen derived from the PRD.
Run this before `/stage-03`. The output is a prompt the user pastes into Stitch to
generate visual mockups. Stitch exports then go into `.pipeline/03-ux/_inputs/` so
`/stage-03` can read them as visual reference.

## What to read first

1. `.pipeline/02-spec/prd.md` — epics, stories, acceptance criteria (required).
   If missing, run `/stage-02` first and stop.
2. `PRODUCT.md` — personas for user context in each screen description.

## What to produce

Print a single Stitch prompt block. Do NOT write any files — the user copies this output
into Stitch manually.

Structure the output as follows:

```
# Stitch prompt — <Product name>

## App context
<2–3 sentences: what the app is, who uses it, the primary use environment
(e.g. field work, outdoors, gloved hands, low connectivity). This gives Stitch
the design register: functional, high-contrast, large touch targets.>

## Design direction
<4–6 bullet points covering: colour register, typography scale, component density,
iconography style, key accessibility constraints. Derive from persona frustrations
and NFRs — do not invent aesthetic preferences not grounded in the PRD.>

## Screens

### Screen N — <Screen name>
**User**: <P-NN persona role>
**Goal**: <one sentence — what the user is trying to accomplish on this screen>
**Key components**:
- <component name> — <one-line description of what it shows or does>
- ...
**States to show**: <comma list: default, empty, loading, error, offline — only those relevant>
**Critical UX rules**:
- <constraint derived from acceptance criteria or NFR — e.g. "No text input required", "Primary action ≥ 64pt height">
- ...

Repeat per screen. Derive screens directly from story acceptance criteria —
every distinct surface a user interacts with becomes a screen.
```

## Rules for writing screen descriptions

- Name components using PRODUCT.md Glossary terms where they exist.
- Every "Critical UX rule" must trace to an acceptance criterion or NFR — no invented constraints.
- Include offline/sync states only on screens where US-007 or US-008 apply.
- Order screens by the user's natural flow through the app (login → home → task → completion).
- Keep each screen description under 120 words — Stitch works best with focused prompts.
