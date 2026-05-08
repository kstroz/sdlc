---
id: US-002
epic: E-01
jira: BAJ-100
created: 2026-05-08
version: 1
priority: MUST
status: todo
---

# US-002 — Stay signed in across sessions

## Statement
**As a** P-01 (senior technician), **I want to** stay signed in between app launches, **so that** I do not have to re-enter credentials when the device sleeps or the app restarts.

## Acceptance criteria
- Given I have signed in within the last 30 days, when I open the app, then I see Today directly without a sign-in prompt.
- Given my session has expired, when I open the app, then I see the sign-in screen with my last username pre-filled.

## Source
`_inputs/interview-2026-05-08.md:L77` — Tomasz noted he wants tap-tap interaction, not retyping.
