# Contributing to the SDLC Pipeline

This guide is for people improving the **pipeline itself** — the skills, validators, and conventions in this repo. If you only want to *use* the pipeline on a feature, read [`README.md`](./README.md) instead.

The pipeline has three load-bearing surfaces:

- `.claude/skills/<skill>/SKILL.md` — instructions Claude reads when a skill triggers
- `pipeline/conventions/<stage>/*.md` — the source of truth for what each artifact must contain
- `pipeline/validators/*.sh` — the gate that enforces those conventions

Templates and validators must always agree with the convention. When they drift, the convention wins.

---

## 1. Adding a new skill

Skills live at `.claude/skills/<skill-name>/SKILL.md`. The directory name is the skill name; the slash commands and the ralph-loop orchestrator load them by that name.

**Rules:**

- Frontmatter `name:` **must** match the directory name exactly.
- The skill must be self-contained: state when to use it, what files to read first, what to produce, and how to validate the output.
- Reference conventions by absolute repo path so the skill works in a forked repo.
- Skills should be idempotent — re-running on a partially-completed artifact must converge, not duplicate.

**Smallest viable `SKILL.md`:**

```markdown
---
name: my-new-skill
description: One-sentence trigger. Use when <situation>.
---

## When to use
<what state of the pipeline triggers this skill>

## Inputs
- `pipeline/conventions/<stage>/<thing>-template.md`
- `.pipeline/<stage>/<upstream-artifact>.md`

## Output
`.pipeline/<stage>/<artifact>.md` conforming to the template above.

## Validate
`bash pipeline/validators/check-<stage>.sh .pipeline/<stage>`
```

Existing skills under `.claude/skills/` (e.g. `breaking-down-feature-into-tasks`, `mapping-tests-to-stories`, `running-impl-loop`) are good reference shapes.

---

## 2. Adding or modifying a validator

Validators live in `pipeline/validators/` and are bash scripts. Contract:

- Take **one** artifact path as `$1` (a few take two — see `check-coverage-mapping.sh`, `check-tests-first.sh`).
- Exit `0` on pass, `1` on any failure.
- Print human-readable failures prefixed with the artifact name, e.g. `prd.md: missing E-NN row in epics table`.
- Be deterministic and offline — no network, no clocks driving control flow.
- Use only tools listed in the README's prerequisites (`bash`, `perl`, `jq`).

**To add a validator:**

1. Write the script in `pipeline/validators/check-<thing>.sh` and `chmod +x` it.
2. Add the matching template/convention under `pipeline/conventions/<stage>/<thing>-template.md`. The validator enforces what the template promises — if you cannot point at the rule in the template, the validator should not check it.
3. Wire it into the relevant slash command in `.claude/commands/` (e.g. `stage-04.md`) so it runs at the gate.
4. Add the invocation line to the **Validators** table in `README.md`.

Look at `check-spec.sh` and `check-arch.sh` for typical structure (frontmatter checks, ID-pattern grep, cross-reference resolution).

---

## 3. Modifying conventions

Conventions are the source of truth. Templates and validators are derived. Order of operations:

1. **Edit the convention** under `pipeline/conventions/<stage>/`.
2. **Update the template** in the same directory if structure changed.
3. **Update the validator** in `pipeline/validators/` to enforce (or stop enforcing) the rule.
4. **Update affected skills** under `.claude/skills/` if the skill produces that artifact.

**ID-system changes are special.** The ID prefixes (`I-NN`, `US-NNN`, `ADR-NNN`, etc.) are documented in `pipeline/conventions/_global/cross-references.md`. Any change there cascades:

1. Edit `cross-references.md` first.
2. Update the ID table in `README.md`.
3. Walk every consumer (the conventions and validators that grep for that prefix) and update them.
4. Update `pipeline/conventions/_global/traceability.md` if the link directions change.
5. Run `bash pipeline/validators/check-traceability.sh .pipeline` against the BAJ-100 fixture.

Do not introduce forward references between stages. Stage 02 must never link to a stage-04 ADR.

---

## 4. Testing changes locally

The repo ships a worked example fixture under `.pipeline/` (BAJ-100). Use it as the regression suite. Before opening a PR, run every validator against it:

```bash
bash pipeline/validators/check-product.sh PRODUCT.md
bash pipeline/validators/check-idea.sh .pipeline/01-idea/idea.md
bash pipeline/validators/check-spec.sh .pipeline/02-spec
bash pipeline/validators/check-ux.sh .pipeline/03-ux
bash pipeline/validators/check-arch.sh .pipeline/04-architecture
bash pipeline/validators/check-plan.sh .pipeline/05-dev/plan.md
bash pipeline/validators/check-coverage-mapping.sh .pipeline/05-dev/tests-plan.md .pipeline/05-dev/plan.md
bash pipeline/validators/check-tests-first.sh .pipeline/05-dev .
bash pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports
bash pipeline/validators/check-merge-readiness.sh .pipeline/05-dev
bash pipeline/validators/check-traceability.sh .pipeline
```

The traceability check is the integration test — if it still exits `0`, your change has not silently broken the ID graph. If you need fixture changes to demonstrate a new rule, update the BAJ-100 artifacts in the same PR.

---

## 5. PR rules

- **One concern per PR.** A skill change, a convention change, and a validator change should land in three PRs (in that dependency order: convention → validator → skill). The exception is when a single rule must change atomically across all three — say so in the PR description.
- **Conventional Commits** for commit subjects: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`. Scope optional, e.g. `feat(validators): add check-ux dead-end rule`.
- **Do not bundle skill edits with convention edits.** Skills change frequently; conventions are load-bearing. Reviewers need to see them separately.
- Note in the PR description which validators you ran against `.pipeline/` and whether any fixture artifacts changed.
- New skills require a one-line entry in the `README.md` skills list.
