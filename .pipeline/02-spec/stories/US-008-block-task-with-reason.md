---
id: US-008
epic: E-03
jira: BAJ-100
created: 2026-05-08
version: 2
priority: MUST
status: done
---

# US-008 — Report a task as blocked with a reason

## Statement
**As a** P-01 (senior technician), **I want to** mark a task as blocked with a quick-reason checklist (needs parts, tenant absent, needs specialist), **so that** the manager can reschedule without me typing.

## Acceptance criteria
- Given I am on a task detail screen, when I tap "Cannot complete", then I see a checklist of preset reasons and an optional note.
- Given I select "needs parts", when I confirm, then the task status changes to blocked with that reason recorded.

## Source
`_inputs/interview-2026-05-08.md:L107` — Marek: "needs parts, tenant absent, needs specialist."
