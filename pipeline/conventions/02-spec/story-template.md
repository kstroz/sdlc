# Story Template (Stage 02)

Defines the required structure of one story file at `.pipeline/02-spec/stories/US-NNN-<slug>.md`.
One file per story. Files are numbered globally across all epics (`US-001`, `US-002` …).
Slug is kebab-case from the story title, no stopwords.

## Required structure

```markdown
---
id: US-NNN
epic: E-NN
jira: <TICKET-ID>
created: YYYY-MM-DD
version: 1
priority: MUST | SHOULD | COULD
status: todo
---

# US-NNN — <Story title>

## Statement
**As a** P-NN (<persona role>), **I want to** <capability>, **so that** <outcome>.

## Acceptance criteria
- Given <precondition>, when <action>, then <observable result>.
- Given <precondition>, when <action>, then <observable result>.

## Source
`_inputs/<file>.md:L<line>` — <short reason this story was derived here>
```

## Validation rules

`check-spec.sh` FAILS if any story file:

1. Frontmatter missing `id`, `epic`, `jira`, `created`, `version`, `priority`, or `status`.
2. `id` does not match `US-[0-9]{3}`.
3. `epic` does not match `E-[0-9]{2}`.
4. `priority` is not one of `MUST`, `SHOULD`, `COULD`.
5. `status` is not one of `todo`, `in-progress`, `done`.
6. `## Statement` section missing any of `As a`, `I want to`, `so that`.
7. `## Acceptance criteria` has fewer than 1 bullet containing `Given`, `when`, `then`.
8. `## Source` missing an `_inputs/` file reference.
9. Story `epic` ID does not exist as `E-NN` in `prd.md`.

## Why individual files

- Each file maps 1:1 to a Jira ticket — frontmatter fields (`id`, `priority`, `status`)
  become ticket fields for auto-sync scripts.
- `status` in frontmatter lets validators enforce that no branch merges with open stories.
- `git log stories/US-NNN-<slug>.md` gives exact history for that story with no noise
  from unrelated story changes.
- Stage 05 loads one story file at a time, keeping Claude's context focused on the
  story being implemented rather than the entire feature scope.
