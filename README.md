# SDLC Pipeline (Pre-Development Phase)

Repeatable, deterministic process scaffolding for the first four SDLC stages:

1. **Idea capture** → `idea.md`
2. **Specification** → personas, JTBD, user journeys, requirements, glossary
3. **UX Design** → screens, flows, interactions, design tokens
4. **Architecture** → tech stack, data model, API contracts, ADRs

User-first flow: each stage produces document artifacts that feed the next stage. Customer transcripts and other inputs live in per-stage `_inputs/` directories.

## Repo layout

```
pipeline/
├── conventions/          # "Standing instructions" — injected into every skill prompt
│   ├── _global/          # rules applied across all stages (writing style, traceability)
│   ├── 01-idea/
│   ├── 02-spec/
│   ├── 03-ux/
│   └── 04-architecture/
├── validators/           # CI scripts that enforce conventions
└── approvers.yaml        # role -> required approvers per stage
```

## Quick start — running the pipeline on a new project

1. **Fork this repo** (GitHub → "Fork", or `gh repo fork kstroz/sdlc --clone`). Your fork already contains `pipeline/` with all conventions and validators.

2. **Seed the feature branch** from your project root:

```bash
bash pipeline/bin/init-project.sh BAJ-123 my-feature
```

3. **Fill in the brief**:

```bash
$EDITOR .pipeline/01-idea/_inputs/brief.md
```

4. **Open Claude Code and run stage 01**:

```bash
claude
# Tell Claude: "Apply SDLC pipeline stage 01 — generate idea.md from the brief in _inputs/"
```

Claude triggers the `capturing-idea-as-artifact skill`, produces `.pipeline/01-idea/idea.md`, and self-validates via:

```bash
bash pipeline/validators/check-idea.sh .pipeline/01-idea/idea.md
```

When stage 01 passes, drop transcripts into `.pipeline/02-spec/_inputs/`, ask Claude to apply stage 02, and continue through the stages. Validators block forward progress until each stage is conformant.

**Keeping conventions up to date:** because your repo is a fork, pulling upstream convention updates is a standard git operation:

```bash
git fetch upstream
git merge upstream/main
```

## How a feature flows through the pipeline

A feature lives on a branch `feature/<JIRA-ID>/<slug>` with this structure:

```
.pipeline/
├── 01-idea/
│   ├── idea.md
│   └── _approval.json
├── 02-spec/
│   ├── _inputs/                  # raw transcripts, surveys
│   ├── glossary.md
│   ├── personas.md
│   ├── jobs-to-be-done.md
│   ├── user-journeys.md
│   ├── functional-requirements.md
│   ├── non-functional-requirements.md
│   └── _approval.json
├── 03-ux/
│   └── ...
└── 04-architecture/
    └── ...
```

## Gates

Each stage requires explicit approval before the next stage starts. Approval is expressed as `_approval.json` committed to git, driven by GitLab MR slash-commands (`/approve`, `/reject`, `/customer-input`). The author of a stage cannot approve their own work.

## Status

Both phases are scaffolded:

**Phase 1 — pre-development (stages 01-04):**
- 15 skills, 18 conventions, 5 validators, approver matrix.

**Phase 2 — development (stage 05, per-feature mini-pipeline):**
- 11 skills, 10 conventions, 5 validators, 1 reference GitHub Actions workflow.

Total: **26 skills**, **28 conventions**, **10 validators**, **1 GHA workflow**.

Out of scope of this scaffold: GitLab CI YAML for phase 1 gates, the slash-command bot, post-development stages 6-8 (test generation, security scan beyond `security-review` skill, code review summary aggregation).

## Phase 1 skills index — pre-development

| Stage | Skills |
|---|---|
| 01 — Idea | `capturing-idea-as-artifact` |
| 02 — Spec | `extracting-glossary-from-transcripts`, `deriving-personas-from-research`, `mapping-user-journeys`, `deriving-functional-requirements`, `assessing-non-functional-requirements` |
| 03 — UX | `mapping-journeys-to-screens`, `documenting-interactions`, `defining-design-tokens` |
| 04 — Arch | `selecting-tech-stack`, `deriving-data-model`, `deriving-api-contracts`, `writing-architecture-decision-records` |
| Cross-cutting | `running-pipeline-gate`, `requesting-customer-input` |

## Phase 2 skills index — development (per-feature mini-pipeline)

Per-feature pipeline with two gates: plan-approval (after 05.1) and merge-approval (after 05.8).

| Sub-stage | Skills |
|---|---|
| 05.1 Plan | `breaking-down-feature-into-tasks` |
| 05.2 Tests-first | `mapping-tests-to-journeys`, `enforcing-pure-function-policy` (also used in 05.3); reuses `superpowers:test-driven-development` |
| 05.3 Implementation loop | `applying-architecture-principles`; reuses `superpowers:executing-plans`, `superpowers:subagent-driven-development` |
| 05.4 Quality gate (AI side) | `reviewing-modularity`, `reviewing-ui-logic-separation`, `detecting-user-dead-ends`, `detecting-logic-gaps`; reuses `simplify` |
| 05.5 Edge cases | `discovering-edge-cases` |
| 05.6 Security | reuses `security-review`, optional `sentry:sentry-workflow` |
| 05.7 Review | reuses `review`, `superpowers:requesting-code-review`, `superpowers:receiving-code-review` |
| 05.8 ADR + changelog | `amending-adrs-during-development`, `generating-changelog` |

The deterministic side of the quality gate (lint, typecheck, dead-code, complexity, audit, E2E) runs as plain GitHub Actions — see `.github/workflows/dev-pipeline.yml`.
