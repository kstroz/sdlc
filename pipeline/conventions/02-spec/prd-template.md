# PRD Template (Stage 02)

Defines the required structure of `.pipeline/02-spec/prd.md`. One PRD per feature branch.
The PRD is the handoff artifact from product to design and engineering — it groups work into
epics, expresses scope as user stories, and provides testable acceptance criteria.

Personas and glossary terms are NOT redefined here — reference them from `PRODUCT.md`
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
<3–5 sentences. Problem recap and hypothesis from idea.md in plain language.
Link to idea: `[I-001](../01-idea/idea.md)`.>

## Epics

### E-01 — <Epic name>
<One sentence describing the outcome this epic delivers for the user.>

#### US-001 — <Story title>
- **As a** P-NN (<persona role>), **I want to** <capability>, **so that** <outcome>.
- **Priority**: MUST | SHOULD | COULD
- **Acceptance criteria**:
  - Given <precondition>, when <action>, then <observable result>.
  - Given <precondition>, when <action>, then <observable result>.
- **Source**: `_inputs/<file>.md:L<line>` — <short reason this story was derived here>

Repeat US-NNN per story. Stories are numbered globally (US-001, US-002 …), not per-epic.

### E-02 — <Epic name>
...

## Non-functional requirements

| ID | Category | Requirement | Source |
|---|---|---|---|
| NFR-01 | Performance | <measurable target with units> | `_inputs/<file>.md:L<line>` |
| NFR-02 | Reliability | <measurable target with units> | `_inputs/<file>.md:L<line>` |

At least 3 NFR rows required, each with a numeric target.

## Out of scope
- <explicit boundary — anything NOT in this PRD that could be assumed in scope>
- ...
```

## Validation rules

`check-spec.sh` FAILS the gate if:

1. Frontmatter missing `id`, `jira`, `created`, `version`.
2. `## Overview` section absent or missing a link matching `I-[0-9]`.
3. `## Epics` section absent or contains no `### E-NN` heading.
4. Any epic contains no `#### US-NNN` story.
5. Any story missing `As a`, `I want to`, `so that` in the statement line.
6. Any story missing `Priority` with value `MUST`, `SHOULD`, or `COULD`.
7. Any story `Acceptance criteria` block has fewer than 1 bullet containing `Given`, `when`, `then`.
8. Any story missing a `Source` line with an `_inputs/` reference.
9. `## Non-functional requirements` absent or table has fewer than 3 data rows.
10. Every NFR row must contain a numeric value. Rows without digits fail.
11. `## Out of scope` section absent or has fewer than 1 bullet.
