# Stage 02 — Specification

Conventions for the Specification stage. Stage 02 transforms the falsifiable idea from stage 01 into a structured set of artifacts that downstream stages (UX, architecture) can build on without re-interviewing stakeholders.

Each artifact has its own template in this directory. Skills under `~/.claude/skills/` generate the artifacts; `pipeline/validators/check-spec.sh` enforces the templates before the gate.

## Templates

| File | Artifact it governs | Identifier prefix |
|---|---|---|
| `glossary-entry-template.md` | `glossary.md` entries | term (no prefix) |
| `persona-template.md` | `personas.md` entries | `P-NN` |
| `jtbd-template.md` | `jobs-to-be-done.md` entries | `JTBD-NN` |
| `journey-template.md` | `user-journeys.md` entries | `J-NN` |
| `requirement-template.md` | `functional-requirements.md` entries | `FR-NNN` |
| `nfr-categories.md` | `non-functional-requirements.md` content | category names |

## Required artifacts at the gate

Stage 02 passes when all six files exist under `<branch>/.pipeline/02-spec/` and conform to their templates:

1. `glossary.md`
2. `personas.md`
3. `jobs-to-be-done.md`
4. `user-journeys.md`
5. `functional-requirements.md`
6. `non-functional-requirements.md`

## Inputs directory

Source material (transcripts, research notes, support tickets) lives in `<branch>/.pipeline/02-spec/_inputs/`. Every claim in the artifacts above must trace to a file there or to `01-idea/idea.md`.
