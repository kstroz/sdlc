# Changelog

All notable changes to this repository are documented in this file.

This changelog tracks repo-level changes to the SDLC pipeline scaffold itself — the skills, validators, hooks, templates, and documentation that make up the pipeline. It is **not** a per-feature changelog; those live alongside each feature branch at `.pipeline/05-dev/changelog.md`.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Versions are tagged on `main` after PRs merge; the current trunk tip is always `unreleased` until the next tag.

## [Unreleased]

### Added

- Phase 2 skills: `bootstrapping-project`, `breaking-down-feature-into-tasks`, `mapping-tests-to-stories`, `enforcing-pure-function-policy`, `applying-architecture-principles`, `reviewing-modularity`, `reviewing-ui-logic-separation`, `detecting-user-dead-ends`, `detecting-logic-gaps`, `discovering-edge-cases`, `amending-adrs-during-development`, `generating-changelog`, `running-impl-loop` (master orchestrator), `security-reviewing-stage-05`, `coordinating-code-review`, `running-pipeline-gate`, `requesting-customer-input` (17 first-party Phase 2 skills total)
- Vendored skills from upstream plugins for in-repo self-sufficiency: `test-driven-development`, `systematic-debugging`, `verification-before-completion`
- Vendored ralph-loop hook + scripts at `.claude/hooks/stop-hook.sh` and `.claude/scripts/setup-ralph-loop.sh` plus the `/ralph-loop` and `/cancel-ralph` slash commands
- Vendored pr-review-toolkit subagents under `.claude/agents/`
- 05-dev validators: `check-stories-completeness.sh` (new) plus the existing check-plan, check-coverage-mapping, check-tests-first, check-quality-thresholds, check-merge-readiness wired to the new US-NNN schema
- Forker scripts under `scripts/`: `setup-windows.ps1`, `smoke-test.sh`, `find-stale-refs.sh`, `test-ralph-hook.sh`
- New top-level docs: `CLAUDE.md`, `CONTRIBUTING.md`, `ONBOARDING.md`
- New `app/CLAUDE.md` with code-level conventions for the impl loop
- BAJ-100 example branch: full Phase 1 artifacts, plan.md + 10 task files, bootstrapped Expo app
- ADR-006 supersedes ADR-001 for the Expo SDK version (51 → 54)
- 05-dev-plan and 05-dev-merge gate entries in `pipeline/approvers.yaml`
- `_security-exceptions.json` template at `pipeline/conventions/_global/`
- Approval JSON templates at `pipeline/conventions/_global/approval-{plan,merge}-template.json`

### Changed

- Migrated Stage 05 schema from FR-NNN/J-NN to US-NNN — `plan-template.md`, `task-template.md`, `tests-plan-template.md`, `check-plan.sh`, `check-coverage-mapping.sh`, `check-merge-readiness.sh` all rewritten to reference stories from `.pipeline/02-spec/stories/`
- README.md rewritten with prerequisites table, ID system table, full validator list, and Stage 05 autonomous-loop walkthrough
- `.github/workflows/dev-pipeline.yml` wired to `app/` working-directory with concrete `npm` commands replacing placeholder `echo` calls

### Fixed

- `grep -qiF` core dump on MSYS2 grep 3.0 affecting `check-spec.sh`, `check-idea.sh` (switched to `grep -qF`)
- `check-arch.sh` data-model link assertion accepts `PRODUCT.md` in addition to `glossary.md` (the template instructs `PRODUCT.md`)
