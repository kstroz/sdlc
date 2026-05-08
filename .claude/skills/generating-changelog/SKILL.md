---
name: generating-changelog
description: Use at Stage 05.8 to generate the machine-parseable feature changelog from git history, ADR amendments, and the plan; required before merge approval
---

# Generating Changelog

**Announce at start:** "I'm using the generating-changelog skill to produce the feature changelog."

## What to read first

`pipeline/conventions/05-dev/changelog-format.md` — required structure and generation rules.

## Prerequisites

- `_approval-plan.json` must exist with `"decision": "approved"`
- All quality reports must exist under `.pipeline/05-dev/quality-reports/`
- No FAIL lines in any quality report (run `check-merge-readiness.sh` to verify)

## Procedure

### 1. Compute the git range

```bash
BASE=$(git merge-base HEAD origin/main)
HEAD=$(git rev-parse HEAD)
echo "Range: $BASE..$HEAD"
```

### 2. Collect commit data

```bash
git log --no-merges $BASE..$HEAD --oneline
git diff --shortstat $BASE..$HEAD
git diff --name-status $BASE..$HEAD
```

### 3. Extract FR and J references

Scan commit messages for `FR-[0-9]{3}` and `J-[0-9]{2}` patterns. Also read `.pipeline/05-dev/plan.md` for the full FR/J mapping of this branch.

### 4. Identify ADR amendments

Compare `version` frontmatter in `.pipeline/04-architecture/adr/*.md` between `$BASE` and `$HEAD`. Files with a higher version at HEAD were amended during this branch.

### 5. Write the file

Produce `.pipeline/05-dev/changelog.md` following `changelog-format.md` exactly. No extra sections, no prose, no summaries beyond what the template requires.

Required frontmatter fields: `id`, `jira`, `created`, `version: 1`, `range: <BASE>..<HEAD>`.

Required sections (in order):
- `## Tickets` — ticket ID + FR/J references
- `## Architecture changes` — ADR amendments or `(None.)`
- `## Code summary` — file counts and line counts from git diff
- `## Test changes` — test file counts, new test files with FR/J coverage

## Validate

```bash
bash pipeline/validators/check-merge-readiness.sh .pipeline/05-dev
```

Fix every failure. Re-run until exit 0. Present the result to the user for merge approval.
