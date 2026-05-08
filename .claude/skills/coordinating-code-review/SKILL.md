---
name: coordinating-code-review
description: Use at Stage 05.7 after the four 05.4 quality reports pass FAIL-free to dispatch the right pr-review-toolkit agents in parallel and aggregate their findings into a single code-review report
---

# Coordinating Code Review

**Announce at start:** "I'm using the coordinating-code-review skill to dispatch the pr-review-toolkit agents over the 05.4-cleared diff."

## Overview

Stage 05.7 is the human-and-AI code review pass that runs after the autonomous impl-loop has produced green quality reports and before the merge gate. Phase 2 vendors six review agents under `.claude/agents/` (`code-reviewer.md`, `code-simplifier.md`, `comment-analyzer.md`, `pr-test-analyzer.md`, `silent-failure-hunter.md`, `type-design-analyzer.md`) driven generically by `.claude/commands/review-pr.md`. This skill specialises that flow for the SDLC pipeline: it knows what the impl-loop produced under `.pipeline/05-dev/`, picks the agents that match the actual diff, dispatches them in parallel, and writes a single aggregated report the human reviewer signs off on.

## When to use

- **After 05.4 passes**: all four quality reports under `.pipeline/05-dev/quality-reports/` exist and contain zero FAIL lines.
- **Before the merge gate**: prior to the human committing `_approval-merge.json` (Stage 05.8).
- **Re-runs**: after a FAIL-fix round, dispatch only `code-simplifier` and any agents whose targeted concern was touched.

Do NOT use this skill mid-impl-loop — review on a green base, not on partial work.

## Prerequisites

Before dispatching any agent, verify all of the following. If any fail, stop and report — do not run the review.

1. All four quality reports are FAIL-free:
   - `.pipeline/05-dev/quality-reports/modularity.md`
   - `.pipeline/05-dev/quality-reports/ui-logic-separation.md`
   - `.pipeline/05-dev/quality-reports/user-dead-ends.md`
   - `.pipeline/05-dev/quality-reports/logic-gaps.md`
2. A security review report exists at `.pipeline/05-dev/quality-reports/security-review.md` (produced by the `security-reviewing-stage-05` skill).
3. Tests-first is verified: every `T-NNN` task in `.pipeline/05-dev/tasks/` has its test commit preceding its implementation commit in `git log --oneline trunk..HEAD`.
4. No uncommitted changes in the working tree (`git status` is clean) — the diff under review must equal the diff that will be merged.

## Procedure

### 1. Compute the diff vs trunk

```bash
git diff --name-only trunk...HEAD > /tmp/changed-files.txt
git diff trunk...HEAD > /tmp/full-diff.patch
```

Categorise the changed files:

- **Code files**: any `.ts`, `.tsx`, `.js`, `.py`, `.go`, etc. under `src/`, `lib/`, `app/`.
- **Test files**: paths matching `**/*.test.*`, `**/*.spec.*`, `tests/**`, `__tests__/**`.
- **Type definitions**: files under `types/`, `**/*.d.ts`, or hunks adding `interface`, `type `, `enum`, discriminated unions.
- **Error-handling hunks**: hunks touching `try`, `catch`, `throw`, `Result<`, `Either<`, `.catch(`, error subclasses, retry logic.
- **Comment/doc hunks**: hunks adding or modifying `//`, `/* */`, `"""`, `#`, JSDoc, or `.md` files under `docs/`.

### 2. Decide which agents to dispatch

Map categories to agents using this table:

| Trigger | Agent (`subagent_type`) |
|---|---|
| Any code change in the diff | `code-reviewer` |
| Type definitions changed (added/modified `interface`, `type`, `enum`, `.d.ts`) | `type-design-analyzer` |
| Error-handling touched (any hunk in `try`/`catch`/`throw`/Result/Either) | `silent-failure-hunter` |
| Test files changed | `pr-test-analyzer` |
| Comments or docs added/modified | `comment-analyzer` |
| After a FAIL-fix round (re-run only) | `code-simplifier` |

`code-reviewer` runs on every Stage 05.7 invocation. `code-simplifier` is reserved for the polish pass after FAIL fixes — do NOT include it in the first dispatch.

### 3. Dispatch the chosen agents in parallel

Issue a single message containing one `Task` tool call per chosen agent. Each call:

- `subagent_type` = the agent name (e.g. `code-reviewer`).
- `description` = a short label, e.g. "code review of T-001..T-NNN".
- `prompt` = the focus area, the diff range (`trunk...HEAD`), the list of changed files relevant to that agent, and a pointer to the four 05.4 quality reports (so the agent does not re-flag what 05.4 already cleared).

Parallel dispatch is required: serial runs waste turns and prevent the aggregator from reading all reports at once.

### 4. Aggregate findings into one report

Write `.pipeline/05-dev/quality-reports/code-review.md` with this shape:

```markdown
---
stage: 05.7
diff-range: trunk...HEAD
agents-dispatched: [code-reviewer, type-design-analyzer, silent-failure-hunter, pr-test-analyzer, comment-analyzer]
generated: 2026-05-08
---

# Code Review — Stage 05.7

## FAIL
- [code-reviewer] src/checkout/cart.ts:42 — mutates input parameter; violates SOLID-D pure-function rule.
- [silent-failure-hunter] src/api/orders.ts:88 — catch block swallows network error without logging.

## WARN
- [type-design-analyzer] src/domain/User.ts:12 — `email: string` permits invalid addresses; consider branded type.
- [comment-analyzer] src/pricing/discount.ts:30 — comment claims "rounds up" but code uses `Math.floor`.

## Notes
- [pr-test-analyzer] Coverage of the refund path is thin but acceptance tests pass.
```

Rules:

- Every line cites `[agent-name] file:line — finding`.
- `FAIL` = blocks merge; the human reviewer cannot commit `_approval-merge.json` until each FAIL line is either fixed or explicitly waived in an ADR amendment.
- `WARN` = should fix or justify; not a hard block.
- `Notes` = informational; no action required.
- If an agent returns no findings, record `- [agent-name] no findings.` under a `## Clean` section.

### 5. Hand off to the human reviewer

Report back to the user:

- Path to `code-review.md`.
- Counts of FAIL / WARN / Notes.
- Whether a `code-simplifier` re-run is recommended (only if there were FAILs requiring code edits).

The human reviewer addresses every FAIL line, optionally addresses WARNs, then commits `_approval-merge.json` per the Stage 05.8 gate. The agent MUST NOT write `_approval-merge.json` itself (CLAUDE.md §3).

## Example dispatch decisions

The table in step 2 maps triggers to agents; these scenarios show how that mapping plays out on real diffs.

### Scenario A — pure-domain change

The diff touches `src/domain/tasks/completion.ts` and its sibling `src/domain/tasks/completion.test.ts`. No types are added, no `try`/`catch`/`throw` hunks appear, no comments or docs change. The 05.4 reports are clean and the tests-first ordering holds.

- **Dispatch**: `code-reviewer`, `pr-test-analyzer`.
- **Reasoning**: only the "any code change" and "test files changed" rows fire, so the other agents would have nothing to look at.

### Scenario B — use-case + platform change with new error handling

The diff touches `src/use-cases/syncQueue.ts`, `src/platform/http/syncClient.ts`, and their tests. It adds a new `SyncError` discriminated union under `src/use-cases/syncQueue.ts` and three new `try`/`catch` blocks across the use case and the HTTP client. 05.4 is green, security review is filed.

- **First dispatch (parallel)**: `code-reviewer`, `type-design-analyzer`, `silent-failure-hunter`, `pr-test-analyzer`.
- **After FAIL fixes**: re-dispatch `code-simplifier` to confirm the fix-up edits did not regrow complexity.
- **Reasoning**: code, types, error-handling, and tests all changed, so four trigger rows fire on the first pass; `code-simplifier` is reserved for the polish pass per step 2.

### Scenario C — docs + comments PR

The diff touches `docs/onboarding.md` and adds 12 JSDoc blocks across files matching `src/use-cases/*.ts`. No executable lines change — the JSDoc is purely additive above existing exports. The 05.4 reports from the prior merge still apply.

- **Dispatch**: `comment-analyzer`.
- **Reasoning**: only the comment/doc trigger row fires; running `code-reviewer` or `pr-test-analyzer` over a zero-logic diff would burn turns to produce empty reports.

## Output format

A single file at `.pipeline/05-dev/quality-reports/code-review.md` with the frontmatter and `FAIL` / `WARN` / `Notes` / `Clean` sections shown above. Every finding cites `[agent] file:line — finding`. No prose summary outside those sections.

## Why this exists

The generic `/pr-review-toolkit:review-pr` command is diff-agnostic and offers all six agents to the user as a menu. At Stage 05.7 the diff is already known, the four 05.4 quality concerns are already cleared, and a security review already exists — so the review must (a) skip what 05.4 covered, (b) target what actually changed, and (c) produce one merge-gate-shaped artifact rather than six free-form reports. This skill encodes that mapping so the reviewer does not have to re-derive it on every feature branch, and so the output slots directly into the merge gate without manual rewriting.
