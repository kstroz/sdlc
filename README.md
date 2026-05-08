# SDLC Pipeline

Forkable, AI-driven pipeline that turns a one-paragraph brief into merge-ready code with tests, ADRs, and quality reports.

---

## 🚀 Just forked? Start here

```bash
gh repo fork kstroz/sdlc --clone
cd sdlc
claude
```

Inside Claude Code, run **one command**:

```
/start-flow
```

The wizard takes it from there: asks if you have a tracker ticket (or generates `LOCAL-NNNN`), takes your brief, asks which platforms you are building (iOS / Android / cross-platform mobile / web / backend / desktop / CLI), asks per-platform tech preferences only where relevant, and walks you stage-by-stage to merge-ready code. Re-run `/start-flow` after each stage to advance.

> **First time on this repo?** Read § "What is this?" below. **Already familiar?** Just run `/start-flow`.

---

## What is this?

Stages 01–04 generate specification artifacts (idea, PRD + stories, optional UX, architecture). Stage 05 generates code under TDD and quality gates, autonomously where possible.

```
01 idea  →  02 spec   →  03 ux  →  04 architecture  →  05 development
            (stories)                                  (plan + impl loop + reports)
```

Every stage has a validator that must exit 0 before the gate, and a JSON approval file that a human commits before the next stage starts. Stage 05 wraps everything in an autonomous loop driven by `/ralph-loop` that drives TDD per task and emits `<promise>MERGE-READY</promise>` only when all checks are green.

## Prerequisites for a forker

Install once on your machine:

| Tool | Why | Windows install |
|---|---|---|
| Git for Windows / Git | Source control + provides `bash`, `perl` | https://git-scm.com |
| Node.js 20+ | App framework toolchain | https://nodejs.org |
| `jq` | Used by ralph-loop stop hook | `choco install jq` or `winget install jqlang.jq` |
| Claude Code CLI | Drives the skills | https://docs.claude.com/code |

On macOS / Linux: `brew install git node jq` (Linux: `apt install jq`). `bash` and `perl` are present out of the box.

No global Claude Code plugins are required — the ralph-loop stop hook, agents, and skills are vendored into `.claude/` per fork.

## Detailed walkthrough — what `/start-flow` actually does

For users who want to know what the wizard is doing under the hood, or who prefer to drive the stages manually:

1. **Setup.** Asks "Do you have a tracker ticket?" (yes → paste any ID, or no → wizard synthesises `LOCAL-NNNN`). Takes your brief (paste, file path, or already-in-`_inputs/`). Auto-derives a short branch name from the brief's first line. Runs `bash pipeline/bin/init-project.sh <TICKET> <short-name>` which creates the `feature/<TICKET>/<short-name>` branch and seeds `.pipeline/`.

2. **Platform selection.** Multi-select via `AskUserQuestion`: mobile-ios, mobile-android, mobile-cross-platform, web, desktop, backend (new or existing), cli, other. The picks land in `idea.md` `## Platforms` with state `yes` / `no` / `existing` / `deferred`.

3. **Tech preferences.** Adaptive — only asks the platforms you picked. iOS native → SwiftUI vs UIKit; Android native → Compose vs XML; cross-platform mobile → React Native + Expo vs RN bare vs Flutter vs Capacitor; backend new → Node Express/Fastify vs Python FastAPI/Django vs Go vs Java Spring; web → Next.js vs React+Vite vs SvelteKit vs Vue. Each question always has "Let architect decide at Stage 04" as a valid answer.

4. **Override authority.** Hard preference (architect MUST use), soft preference (architect treats as first alternative), or no preference (skip writing `stack-preferences.md`).

5. **Run `/stage-01`.** Wizard writes `_inputs/stack-preferences.md` and `idea.md` (with `## Platforms` pre-filled from step 2). Runs `pipeline/validators/check-idea.sh`. Exit 0 means the stage gate is open.

6. **Stop and stage gate.** Wizard prints next-step suggestion. Re-run `/start-flow` to advance, or call `/stage-02`, `/stage-03`, `/stage-04`, `/stage-05` directly.

**Advanced users** can skip the wizard and call the stage commands directly. They are functionally equivalent — the wizard just shortens the first-time experience.

For each stage, the matching validator must exit 0 before the gate. The slash command runs the validator at the end and reports failures.

### Where do I say "this is a mobile app, not a web app"?

In `idea.md` (Stage 01) `## Platforms` section. The agent fills it from the brief if the brief is explicit; if the brief is ambiguous about whether you want mobile, web, backend, or some combination, the agent pauses via the `requesting-customer-input` skill and asks you before continuing. The Platforms section captures WHAT — mobile-ios, mobile-android, mobile-cross-platform, web, desktop, backend, cli — each marked `yes` / `no` / `existing` / `deferred`.

### Where do I say "I want React Native, not Flutter"?

Two places, in this order of strength:

- `_inputs/stack-preferences.md` (optional, lives next to the brief). If you have a hard preference — license, hiring, prior commitment — record it here with an `override allowed: no` flag and the architect must use it. See `pipeline/conventions/01-idea/stack-preferences-template.md`.
- Stage 04 `tech-stack.md` (always). The architect chooses per layer (Mobile / Backend / Data / Infra / Observability) with a trade-off matrix vs the NFRs and one ADR per non-trivial choice. If `_inputs/stack-preferences.md` exists with `override allowed: yes`, the architect treats it as the first alternative; if `override allowed: no`, the architect uses it unless the NFRs make it impossible (in which case the architect escalates back to the user via `requesting-customer-input`).

## Stage 05 — autonomous development

Stage 05 has a manual plan gate followed by an autonomous implementation loop:

```
05.0 bootstrap  →  05.1 plan  →  [PLAN GATE]  →  05.2 tests  →  05.3 impl  →  05.4 quality  →  05.6 security  →  05.7 code review  →  05.8 changelog  →  [MERGE GATE]
```

1. Run `/stage-05`. The skill `bootstrapping-project` (05.0) scaffolds `app/` from `tech-stack.md` if it does not exist, then `breaking-down-feature-into-tasks` (05.1) generates `plan.md` and the per-task detail files.
2. The flow stops at the plan gate. Review `plan.md`, then commit `_approval-plan.json`:
   ```json
   { "decision": "approved", "approver": "<name>", "date": "<YYYY-MM-DD>" }
   ```
3. Start the autonomous loop:
   ```
   /ralph-loop "Apply skill: running-impl-loop" --completion-promise "MERGE-READY" --max-iterations 50
   ```
   The loop reads `.claude/PROGRESS.md` to know its phase, drives TDD per task, runs the four quality gate skills, then security review (05.6) and code review (05.7), and only outputs `<promise>MERGE-READY</promise>` when `check-merge-readiness.sh` exits 0. To cancel: `/cancel-ralph`.
4. Review the aggregated `quality-reports/code-review.md` and commit `_approval-merge.json` to close the merge gate.

## Repo layout

```
.claude/                     # Per-project Claude Code config — vendored, no global plugin needed
├── agents/                  # Code-review subagents (vendored from pr-review-toolkit)
├── commands/                # Slash commands (stage-01..05, ralph-loop, review-pr, ...)
├── hooks/stop-hook.sh       # ralph-loop stop hook (vendored)
├── scripts/setup-ralph-loop.sh
├── skills/                  # All Phase 1 + Phase 2 skills
└── settings.json            # Registers the Stop hook for the project

pipeline/
├── bin/init-project.sh      # Seeds .pipeline/ and the feature branch
├── conventions/             # Templates for each stage's artifacts
└── validators/              # Bash validators run at every gate

.pipeline/                   # Generated per feature branch (not on main)
├── 01-idea/idea.md
├── 02-spec/{prd.md, stories/}
├── 03-ux/...
├── 04-architecture/{tech-stack.md, data-model.md, api-contracts.md, architecture.md, adr/}
└── 05-dev/{plan.md, tasks/, tests-plan.md, quality-reports/, changelog.md, _approval-*.json}

app/                         # Generated by 05.0 bootstrap (per fork's tech stack)
PRODUCT.md                   # Product-level personas + glossary (root, generated once)
```

## ID system

Stable IDs flow downstream; later stages may reference earlier IDs but never the reverse.

| Prefix | Where defined | Where referenced |
|---|---|---|
| `I-NN` | `.pipeline/01-idea/idea.md` | `prd.md` overview |
| `P-NN` | `PRODUCT.md` personas | story statements |
| `E-NN` | `prd.md` epics table | story frontmatter (`epic:`) |
| `US-NNN` | `02-spec/stories/US-NNN-*.md` | plan tasks, tests plan, data-model entities |
| `NFR-NN` | `prd.md` NFR table | tech-stack matrix, ADR `related-nfrs` |
| `S-NN` | `03-ux/screens.md` | `api-contracts.md` endpoints |
| `ADR-NNN` | `04-architecture/adr/` | tech-stack `ADR:` rows |
| `T-NNN` | `05-dev/tasks/` | plan.md detail link |

## Validators

```bash
bash pipeline/validators/check-product.sh PRODUCT.md
bash pipeline/validators/check-idea.sh .pipeline/01-idea/idea.md
bash pipeline/validators/check-spec.sh .pipeline/02-spec
bash pipeline/validators/check-ux.sh .pipeline/03-ux                       # if Stage 03 ran
bash pipeline/validators/check-arch.sh .pipeline/04-architecture
bash pipeline/validators/check-plan.sh .pipeline/05-dev/plan.md
bash pipeline/validators/check-coverage-mapping.sh .pipeline/05-dev/tests-plan.md .pipeline/05-dev/plan.md
bash pipeline/validators/check-tests-first.sh .pipeline/05-dev .
bash pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports
bash pipeline/validators/check-merge-readiness.sh .pipeline/05-dev
bash pipeline/validators/check-traceability.sh .pipeline
```

The deterministic side of the quality gate (lint, typecheck, dead-code, audit, tests) runs in `.github/workflows/dev-pipeline.yml`. Adapt the workflow's `working-directory` if your bootstrap puts the app somewhere other than `app/`.

## Gates

Each stage's slash command stops at the gate and waits for an approval JSON committed to the branch:
- `_approval.json` per stage 01–04
- `_approval-plan.json` after 05.1
- `_approval-merge.json` after 05.8

The author of a stage cannot approve their own work.

## Status of skills

**Phase 1 (Stage 02–04 conventions)**: dedicated SKILL.md files for the 15 skills named by the conventions are not present in `.claude/skills/` at this time. The slash commands (`/stage-01..04`) contain procedural instructions and can drive Claude through each stage end-to-end without skill files. Phase 1 SKILL.md files will land separately when their owner adds them.

**Phase 2 (17 skills, .claude/skills/)**:
- `bootstrapping-project` (05.0)
- `breaking-down-feature-into-tasks` (05.1)
- `mapping-tests-to-stories` (05.2)
- `enforcing-pure-function-policy` (05.2/05.3)
- `applying-architecture-principles` (05.3)
- `reviewing-modularity`, `reviewing-ui-logic-separation` (05.4)
- `detecting-user-dead-ends`, `detecting-logic-gaps` (05.4)
- `discovering-edge-cases` (05.5)
- `security-reviewing-stage-05` (05.6)
- `coordinating-code-review` (05.7)
- `amending-adrs-during-development`, `generating-changelog` (05.8)
- `running-impl-loop` — the master orchestrator driven by `/ralph-loop`
- `running-pipeline-gate`, `requesting-customer-input` — cross-cutting

Vendored from upstream plugins for in-repo self-sufficiency: `test-driven-development`, `systematic-debugging`, `verification-before-completion` (skills); the six PR review subagents.

## Out of scope of this scaffold

- GitLab CI YAML for Phase 1 gates (we use GitHub Actions; adapt as needed).
- The slash-command bot that produces the approval JSON files.
- Stages 06–08 (separate test generation, scaled security scanning, review aggregation).
