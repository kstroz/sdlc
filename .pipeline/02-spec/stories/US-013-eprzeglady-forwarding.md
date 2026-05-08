---
id: US-013
epic: E-05
jira: BAJ-100
created: 2026-05-08
version: 1
priority: MUST
status: todo
---

# US-013 — Push completion records to ePrzeglądy

## Statement
**As a** P-01 (senior technician), **I want to** have my completion records forwarded to ePrzeglądy automatically after sync, **so that** the central system reflects work done within hours, not days.

## Acceptance criteria
- Given a task is marked done and synced, when the backend forwards it, then ePrzeglądy receives the completion record within 1 hour of sync.
- Given the ePrzeglądy forward fails, when the backend retries, then the technician's app is unaffected (the local task remains done).

## Source
`_inputs/interview-2026-05-08.md:L51` — Marek: protocols today take a week to reach ePrzeglądy.
