---
id: US-010
epic: E-04
jira: BAJ-100
created: 2026-05-08
version: 1
priority: MUST
status: todo
---

# US-010 — Sync queued actions when connection returns

## Statement
**As a** P-01 (senior technician), **I want to** have queued completions and photos sent to the server automatically when my device reconnects, **so that** I do not have to remember to upload anything.

## Acceptance criteria
- Given I have 3 pending completions and the device gets connectivity, when 60 seconds pass, then all 3 completions and their photos are uploaded.
- Given an upload fails, when the next sync runs, then the failed item is retried.

## Source
`_inputs/interview-2026-05-08.md:L61` — Tomasz: "I want to leave at 5 from the last building."
