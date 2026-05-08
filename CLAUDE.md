# CLAUDE.md — Agent Instructions for the SDLC Pipeline

Re-read this file at the start of every session before touching any artifact.

## 1. What this repo is

This repo is a forkable SDLC pipeline that takes a feature from raw client input through to merge-ready code. It is organised in five stages — `01-idea`, `02-spec`, `03-ux`, `04-architecture`, `05-dev` — each producing artifacts under `.pipeline/<stage>/` of a feature branch. Stages 01–04 generate specifications; stage 05 plans, implements, and ships code under TDD with quality gates. The full workflow, prerequisites, and slash commands are documented in `README.md` — read it before doing anything else.

## 2. The ID system

IDs are stable, globally unique within their type, and never renumbered. Once an ID is assigned to an artifact, it stays with that artifact for the life of the branch even if the artifact is renamed or rewritten.

| Prefix | Defined in | Referenced by |
|---|---|---|
| `I-NN` | `.pipeline/01-idea/idea.md` | `prd.md` overview |
| `P-NN` | `PRODUCT.md` personas | story statements |
| `E-NN` | `prd.md` epics table | story frontmatter `epic:` |
| `US-NNN` | `.pipeline/02-spec/stories/` | plan tasks, tests-plan, data-model |
| `NFR-NN` | `prd.md` NFR table | tech-stack, ADR `related-nfrs` |
| `S-NN` | `.pipeline/03-ux/screens.md` | `api-contracts.md` endpoints |
| `ADR-NNN` | `.pipeline/04-architecture/adr/` | tech-stack `ADR:` rows |
| `T-NNN` | `.pipeline/05-dev/tasks/` | `plan.md` detail link |

Do NOT renumber. Do NOT reuse a retired ID. New version of an artifact keeps the same ID and bumps `version:` in frontmatter.

## 3. Gate model

Every stage ends at a gate. The gate is a JSON approval file committed to the branch:

- `_approval.json` for stages 01–04
- `_approval-plan.json` after `05.1`
- `_approval-merge.json` after `05.8`

The agent who produced a stage MUST NOT write its own approval JSON. The validators are the gate, not the agent's confidence. An agent declaring "looks good" without a green validator and a committed approval file is an error, not a completion.

## 4. Where conventions live

`pipeline/conventions/<stage>/*.md` is the source of truth for the shape of every artifact in that stage. `pipeline/conventions/_global/` defines repo-wide rules (`writing-style.md`, `markdown-rules.md`, `traceability.md`, `cross-references.md`).

Before writing or editing any artifact, ALWAYS open the matching convention file. Match its required H2s in order, its frontmatter fields, and its required cross-references. Do not invent sections; do not reorder, rename, or omit required H2s.

## 5. Validator-driven completion

After generating any artifact, run the validator from `pipeline/validators/`. Fix every failure. Re-run. Do NOT declare the stage done until the validator exits 0.

```bash
bash pipeline/validators/check-idea.sh .pipeline/01-idea/idea.md
bash pipeline/validators/check-spec.sh .pipeline/02-spec
bash pipeline/validators/check-ux.sh .pipeline/03-ux
bash pipeline/validators/check-arch.sh .pipeline/04-architecture
bash pipeline/validators/check-plan.sh .pipeline/05-dev/plan.md
bash pipeline/validators/check-traceability.sh .pipeline
```

Validator output is the truth. Agent self-assessment is not.

## 6. Forward references are forbidden

Links flow downstream → upstream only. A stage-02 artifact MUST NOT link to a stage-04 ADR. A story MUST NOT cite a screen. A PRD MUST NOT cite a tech-stack row. If you find yourself wanting a forward link, the upstream artifact is incomplete — fix it there, then re-run the affected stage.

External links (Jira, Figma, Confluence) are allowed for reference but do NOT count toward traceability — only `.pipeline/` paths satisfy `check-traceability.sh`.

## 7. Never invent IDs

Only reference IDs that already exist in upstream artifacts on the same branch (or in `PRODUCT.md`). Dangling references fail traceability. If a needed upstream ID does not exist, stop, return to the upstream stage, add the artifact, re-validate, then continue. Do NOT fabricate `US-`, `NFR-`, `S-`, or `ADR-` IDs to fill a gap.

## 8. Stage 05 specifics

Stage 05 has a manual plan gate followed by an autonomous implementation loop:

```text
05.0 bootstrap → 05.1 plan → [PLAN GATE] → 05.2 tests → 05.3 impl → 05.4 quality → 05.8 changelog → [MERGE GATE]
```

The autonomous phase is driven by `/ralph-loop` invoking the `running-impl-loop` skill. The loop reads `.claude/PROGRESS.md` to know its phase, drives TDD per task `T-NNN`, runs the four quality-gate skills, and only emits `<promise>MERGE-READY</promise>` when `check-merge-readiness.sh` exits 0.

Both the plan gate and the merge gate require committed JSON approval files (`_approval-plan.json`, `_approval-merge.json`). The agent does NOT write them. To cancel the loop: `/cancel-ralph`.

## 9. English everywhere

All artifact prose is English. Direct, declarative, active voice. No marketing adjectives. No "TBD" or "TODO" past a gate.

Domain terms in the client's source language live in `PRODUCT.md` glossary as quoted strings. They are referenced from artifact prose, not interpolated into it.

## Example: a typical Stage 02 turn

User runs `/stage-02` on a branch where Stage 01 is complete. The agent proceeds turn-by-turn:

1. Read the convention files: `pipeline/conventions/02-spec/prd-template.md`, `story-template.md`, `pipeline/conventions/_global/writing-style.md`, `markdown-rules.md`.
2. Read the upstream artifacts: `.pipeline/01-idea/idea.md` and `PRODUCT.md`.
3. Read every file under `.pipeline/02-spec/_inputs/` (client transcripts and notes).
4. Decide: "I have enough information for 4 epics with 11 stories total. The acceptance criteria for one story is genuinely ambiguous between two phrasings — I will use `requesting-customer-input` to ask before writing it."
5. Write `prd.md` (epics table, NFRs, out-of-scope) — do NOT yet write a story file for the ambiguous one.
6. Write 10 of the 11 story files at `.pipeline/02-spec/stories/US-NNN-<slug>.md`.
7. Run `bash pipeline/validators/check-spec.sh .pipeline/02-spec`.
8. Validator FAILs: the `prd.md` epics table references `US-006`, which has no story file (the ambiguous one).
9. Do NOT silently invent the missing story. Add an entry to `.pipeline/02-spec/_open-questions.md`, remove `US-006` from the epics table temporarily, and re-run the validator.
10. Validator passes. Report: `prd.md` and 10 stories created; `US-006` deferred pending input from user (one open question to resolve).

## Before any tool call

1. Read the relevant convention file in `pipeline/conventions/<stage>/` (and the `_global/` rules if generating a new artifact type this session).
2. Verify every upstream ID you intend to cite exists in the branch — grep `.pipeline/` and `PRODUCT.md` for the literal ID.
3. Write or edit the artifact, matching the convention's H2 order, frontmatter, and required upstream links.
4. Run the matching validator from `pipeline/validators/`.
5. Fix every failure and re-run until exit 0. Do not negotiate with the validator.
6. Report back to the user only when the validator is green; never write the stage's approval JSON yourself.
