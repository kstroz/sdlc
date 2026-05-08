# PRD Template (Stage 02)

Defines the required structure of `.pipeline/02-spec/prd.md`. One PRD per feature branch.
The PRD is the feature brief — it states the problem, defines epic scope, sets non-functional
constraints, and draws the out-of-scope boundary. Individual stories with acceptance criteria
live in `.pipeline/02-spec/stories/` (see `story-template.md`).

Personas and glossary are NOT redefined here — reference them from `PRODUCT.md`
at the repo root using their `P-NN` IDs.

## Required structure

```markdown
---
id: PRD-001
jira: <TICKET-ID>
created: YYYY-MM-DD
version: 1
---

# PRD — <Feature name>

## Overview
<3–5 sentences. Problem recap and hypothesis in plain language.
Must link to the idea: `[I-001](.pipeline/01-idea/idea.md)`.>

## Epics

| ID | Name | Stories |
|---|---|---|
| E-01 | <Epic name> | US-001, US-002, US-003 |
| E-02 | <Epic name> | US-004, US-005 |

One row per epic. The Stories column lists all US-NNN IDs that belong to this epic.
Each US-NNN must have a corresponding file in `stories/`.

## Non-functional requirements

| ID | Category | Requirement | Source |
|---|---|---|---|
| NFR-01 | Performance | <measurable target with units> | `_inputs/<file>.md:L<line>` |
| NFR-02 | Reliability | <measurable target with units> | `_inputs/<file>.md:L<line>` |

At least 3 NFR rows required. Every row must contain a numeric target.

## Out of scope
- <explicit boundary>
- ...
```

## Validation rules

`check-spec.sh` FAILS if:

1. Frontmatter missing `id`, `jira`, `created`, `version`.
2. `## Overview` absent or missing a link matching `I-[0-9]`.
3. `## Epics` absent or table has fewer than 1 data row.
4. Any US-NNN referenced in the epics table has no corresponding file in `stories/`.
5. `## Non-functional requirements` absent or table has fewer than 3 data rows with numeric values.
6. `## Out of scope` absent or has fewer than 1 bullet.
