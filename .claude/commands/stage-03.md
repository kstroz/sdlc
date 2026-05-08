# Stage 03 — UX Design

Read `pipeline/conventions/03-ux/README.md` and all files under `pipeline/conventions/03-ux/`
before writing anything.

## What to read as source material

1. `.pipeline/02-spec/prd.md` — epics, user stories, acceptance criteria (required).
   If missing, run `/stage-02` first and stop.
2. `PRODUCT.md` — personas for naming and context.
3. `.pipeline/03-ux/_inputs/` — any wireframes, Figma exports, or UX notes if present.

## What to produce

Four artifacts under `.pipeline/03-ux/`, in this order:

### 1. screens.md
One `## S-NN — <Screen name>` block per screen. Derive screens from user story acceptance
criteria — every distinct surface a user interacts with becomes a screen.

Each block requires: `Role`, `Source journey steps` (reference US-NNN story IDs),
`Components` (bullet list, names from PRODUCT.md Glossary where domain terms exist),
`Required states` (note: detail in interactions.md), `Navigation` (Entry points + Exit points).

### 2. ux-flows.md
One `## F-NN — <Flow name> (story: US-NNN)` per flow. Map each flow to one user story.
Follow the text notation from `pipeline/conventions/03-ux/flow-notation.md`:
- Happy path: `[S-NN:Name] --<trigger>--> [S-NN:Name]`
- Branches: one bullet per error/empty/offline path using `#empty`, `#error`, `#loading` suffixes.

### 3. interactions.md
One `## S-NN — <Screen name>` block per screen from screens.md.
Each block must document the 5 required states from `pipeline/conventions/03-ux/required-states.md`:
`Default`, `Loading`, `Empty`, `Error`, `Disabled`. One-line description per state.

### 4. design-tokens.md
Six `## ` sections in order: `Color`, `Typography`, `Spacing`, `Radius`, `Shadow`, `Motion`.
Follow `pipeline/conventions/03-ux/design-tokens-schema.md`. Color must have `### Raw palette`
and `### Semantic` subsections. Every token row needs a `Name | Value | Use` column.

## After writing

Run:

```bash
bash pipeline/validators/check-ux.sh .pipeline/03-ux
```

Fix every failure. Re-run until the validator exits 0, then show the user a summary of
screens and flows produced.
