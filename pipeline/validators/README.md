# Pipeline validators

Scripts that enforce the conventions in `pipeline/conventions/`. Each validator targets a specific artifact and exits non-zero with a human-readable failure list when the artifact violates its template.

## Available validators

| Script | Target artifact | Convention |
|---|---|---|
| `check-idea.sh` | `<branch>/.pipeline/01-idea/idea.md` | `conventions/01-idea/idea-template.md` |
| `check-spec.sh` | `<branch>/.pipeline/02-spec/` (directory) | `conventions/02-spec/*` |
| `check-ux.sh` | `<branch>/.pipeline/03-ux/` (directory) | `conventions/03-ux/*` |
| `check-arch.sh` | `<branch>/.pipeline/04-architecture/` (directory) | `conventions/04-architecture/*` |
| `check-traceability.sh` | the entire `<branch>/.pipeline/` tree | `conventions/_global/traceability.md` |
| `check-plan.sh` | `<branch>/.pipeline/05-dev/plan.md` | `conventions/05-dev/plan-template.md` |
| `check-tests-first.sh` | `<branch>/.pipeline/05-dev/` + repo git history | `conventions/05-dev/task-template.md` |
| `check-coverage-mapping.sh` | `<branch>/.pipeline/05-dev/tests-plan.md` + `02-spec/user-journeys.md` | `conventions/05-dev/tests-plan-template.md` |
| `check-quality-thresholds.sh` | `<branch>/.pipeline/05-dev/quality-reports/` | `conventions/05-dev/{modularity-thresholds,edge-case-categories,quality-gate-criteria}.md` |
| `check-merge-readiness.sh` | `<branch>/.pipeline/05-dev/` (directory) | `conventions/05-dev/quality-gate-criteria.md` |

## Usage

```bash
./check-idea.sh                path/to/.pipeline/01-idea/idea.md
./check-spec.sh                path/to/.pipeline/02-spec/
./check-ux.sh                  path/to/.pipeline/03-ux/
./check-arch.sh                path/to/.pipeline/04-architecture/
./check-traceability.sh        path/to/.pipeline
./check-plan.sh                path/to/.pipeline/05-dev/plan.md
./check-tests-first.sh         path/to/.pipeline/05-dev/  path/to/repo
./check-coverage-mapping.sh    path/to/.pipeline/05-dev/tests-plan.md  path/to/.pipeline/02-spec/user-journeys.md
./check-quality-thresholds.sh  path/to/.pipeline/05-dev/quality-reports/
./check-merge-readiness.sh     path/to/.pipeline/05-dev/
```

Exit codes: `0` = pass, `1` = validation failed, `2` = bad invocation.

`check-traceability.sh` skips stages that do not exist on the branch, so it is safe to run on in-progress branches that only have one or two stages populated.

## CI integration

In GitLab CI, each per-stage validator runs as part of the matching `validate-stage-NN` job triggered by `/request-gate NN-<name>` in MR comments. `check-traceability.sh` runs on every gate from stage 02 onwards, since the first cross-stage link appears there. The job posts the failure list back as an MR comment when validation fails.

## Status

Pre-development validators (`check-idea.sh`, `check-spec.sh`, `check-ux.sh`, `check-arch.sh`, `check-traceability.sh`) and stage 05 development validators (`check-plan.sh`, `check-tests-first.sh`, `check-coverage-mapping.sh`, `check-quality-thresholds.sh`, `check-merge-readiness.sh`) are implemented.
