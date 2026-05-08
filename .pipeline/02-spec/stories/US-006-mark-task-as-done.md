---
id: US-006
epic: E-03
jira: BAJ-100
created: 2026-05-08
version: 1
priority: MUST
status: todo
---

# US-006 — Mark a task as done

## Statement
**As a** P-01 (senior technician), **I want to** mark a task as done with a single tap, **so that** I can record completion the moment work is finished, on site.

## Acceptance criteria
- Given I am on a task detail screen, when I tap "Mark done", then the task status changes to done and the completion timestamp is recorded.
- Given the task is already done, when I open it, then the "Mark done" button is replaced by a completion summary (timestamp, photo if any).

## Source
`_inputs/interview-2026-05-08.md:L75` — Tomasz: "Tap, tap, photo, next."
