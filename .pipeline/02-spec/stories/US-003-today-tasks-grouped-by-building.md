---
id: US-003
epic: E-02
jira: BAJ-100
created: 2026-05-08
version: 1
priority: MUST
status: todo
---

# US-003 — View today's tasks grouped by building

## Statement
**As a** P-01 (senior technician), **I want to** see all tasks assigned to me today grouped by building address, **so that** I can plan my route and know what to do at each stop.

## Acceptance criteria
- Given I have 3 tasks across 2 buildings today, when I open the app, then I see 2 building groups with the right tasks under each.
- Given I have no tasks today, when I open the app, then I see an empty state with a clear message.

## Source
`_inputs/interview-2026-05-08.md:L11` — printed task lists today contain address plus what to do.
