---
id: US-009
epic: E-04
jira: BAJ-100
created: 2026-05-08
version: 1
priority: MUST
status: todo
---

# US-009 — Use the app fully offline

## Statement
**As a** P-01 (senior technician), **I want to** view tasks, mark them done, and attach photos with no network connection, **so that** I can work in basements and other low-signal locations.

## Acceptance criteria
- Given the device is offline, when I open the app, then I see today's tasks loaded from local storage.
- Given the device is offline, when I mark a task done with a photo, then the action is queued locally and the task UI shows "pending sync".

## Source
`_inputs/interview-2026-05-08.md:L57` — Marek: "It has to work without signal."
