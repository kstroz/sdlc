# Stage 02 — PRD

Read `pipeline/conventions/02-spec/prd-template.md`, `pipeline/conventions/_global/writing-style.md`,
and `pipeline/conventions/_global/markdown-rules.md` before writing anything.

## What to read as source material

1. `.pipeline/01-idea/idea.md` — problem, hypothesis, success criteria, out-of-scope (required).
   If missing, tell the user to run `/stage-01` first and stop.
2. `PRODUCT.md` at the repo root — personas (`P-NN`) and glossary. If missing, tell the
   user to run `/generate-product` first and stop.
3. Every file under `.pipeline/02-spec/_inputs/` — client transcripts, research notes,
   support tickets. If empty, tell the user to drop research material there and stop.

## What to produce

Generate `.pipeline/02-spec/prd.md` following `prd-template.md` exactly.

**Frontmatter** — `id: PRD-001`, `jira` (from idea.md or ask the user), `created: <today>`, `version: 1`.

**## Overview** — 3–5 sentences. Recap problem and hypothesis from idea.md in plain language.
Must include a link to the idea: `[I-001](.pipeline/01-idea/idea.md)`.

**## Epics** — group related stories into named epics (`### E-01`, `### E-02` …).
Each epic represents a deliverable module — a coherent chunk of value a user can experience.
Derive epics from the major capability areas in the inputs (e.g. "Offline task execution",
"Photo confirmation", "E-inspection sync"). Aim for 3–6 epics.

**User stories** — under each epic, write one `#### US-NNN` block per story.
Stories are numbered globally (US-001, US-002 …), not reset per epic.
Each story requires:
- Statement: `**As a** P-NN (<role>), **I want to** <capability>, **so that** <outcome>.`
  Reference personas from PRODUCT.md using their P-NN IDs.
- `**Priority**: MUST | SHOULD | COULD`
- `**Acceptance criteria**:` — at least 1 Given/when/then bullet per story.
  Write acceptance criteria that are testable: observable inputs and outputs, not vibes.
- `**Source**: _inputs/<file>.md:L<line>` — trace each story to a specific line in the transcripts.

**## Non-functional requirements** — table with at least 3 rows. Categories to cover:
performance, reliability, offline behaviour, accessibility. Every row must have a numeric target.

**## Out of scope** — at least 1 bullet. Pull from idea.md out-of-scope and any scope
boundaries stated in the transcripts.

All prose in English. Domain terms use the exact spelling from PRODUCT.md Glossary.

## After writing

Run:

```bash
bash pipeline/validators/check-spec.sh .pipeline/02-spec
```

Fix every failure. Re-run until the validator exits 0, then show the user the final prd.md.
