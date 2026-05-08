---
id: US-011
epic: E-04
jira: BAJ-100
created: 2026-05-08
version: 1
priority: SHOULD
status: todo
---

# US-011 — Wifi-only sync option for media

## Statement
**As a** P-01 (senior technician), **I want to** restrict photo uploads to wifi only, **so that** my mobile data plan is not consumed by large attachments.

## Acceptance criteria
- Given I enable "Wifi only for photos" in settings, when I am on cellular and have queued photos, then photos remain queued and a banner explains why.
- Given I am on wifi, when queued photos exist, then they upload normally.

## Source
`_inputs/interview-2026-05-08.md:L99` — Marek concerned about battery and mobile data usage.
