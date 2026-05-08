# Stage 02 — Specification

Read `pipeline/conventions/02-spec/prd-template.md`, `pipeline/conventions/02-spec/story-template.md`,
`pipeline/conventions/_global/writing-style.md`, and `pipeline/conventions/_global/markdown-rules.md`
before writing anything.

## What to read as source material

1. `.pipeline/01-idea/idea.md` — problem, hypothesis, success criteria, out-of-scope (required).
   If missing, run `/stage-01` first and stop.
2. `PRODUCT.md` at the repo root — personas (`P-NN`) and glossary (required).
   If missing, run `/generate-product` first and stop.
3. Every file under `.pipeline/02-spec/_inputs/` — client transcripts, research notes.
   If empty, tell the user to drop research material there and stop.

## What to produce

### 1. `.pipeline/02-spec/prd.md`

Follow `prd-template.md` exactly.

- **Frontmatter**: `id: PRD-001`, `jira` (from idea.md or ask the user), `created: <today>`, `version: 1`.
- **## Overview**: 3–5 sentences recapping the problem and hypothesis. Link to `[I-001](.pipeline/01-idea/idea.md)`.
- **## Epics**: one table row per epic (`E-01`, `E-02` …). Each row lists the US-NNN story IDs that belong to it. Derive epics from the major capability areas in the inputs — aim for 3–6 epics.
- **## Non-functional requirements**: table, ≥ 3 rows, each with a numeric target and `_inputs/` source.
- **## Out of scope**: ≥ 1 bullet. Pull from idea.md and transcript scope boundaries.

### 2. `.pipeline/02-spec/stories/US-NNN-<slug>.md` — one file per story

Follow `story-template.md` exactly. Stories are numbered globally (`US-001`, `US-002` …), not per-epic.
Filename: `US-NNN-<kebab-slug>.md` where slug is the story title lowercased, dashes, no stopwords.

Each file requires:
- **Frontmatter**: `id`, `epic` (E-NN), `jira`, `created: <today>`, `version: 1`, `priority` (MUST/SHOULD/COULD), `status: todo`.
- **## Statement**: `**As a** P-NN (<role>), **I want to** <capability>, **so that** <outcome>.` — reference personas from PRODUCT.md.
- **## Acceptance criteria**: ≥ 1 Given/when/then bullet. Write testable criteria — observable inputs and outputs.
- **## Source**: `_inputs/<file>.md:L<line>` — trace each story to a specific transcript line.

All prose in English. Domain terms use exact spelling from PRODUCT.md Glossary.

## After writing

Run:

```bash
bash pipeline/validators/check-spec.sh .pipeline/02-spec
```

Fix every failure. Re-run until the validator exits 0, then show the user:
- The prd.md epics table
- A summary list of all story files created with their priority and status
