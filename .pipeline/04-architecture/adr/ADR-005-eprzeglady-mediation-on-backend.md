---
id: ADR-005
title: Mediate ePrzeglądy integration on the backend, not the mobile app
status: accepted
created: 2026-05-08
supersedes: None
superseded-by: None
related-nfrs: NFR-02, NFR-03
---

# ADR-005 — Mediate ePrzeglądy integration on the backend, not the mobile app

## Context

FR-017 requires completion records to reach ePrzeglądy within 1 hour of sync. ePrzeglądy is an external system with its own auth, schema, and rate limits, not under our team's control. The mobile app must not depend on ePrzeglądy availability — a brief outage cannot block a technician's completion (NFR-03 reliability).

## Decision

The mobile app sends completion records exclusively to our own backend (already deployed in GitLab; specific endpoints listed in api-contracts.md). The backend asynchronously forwards each completion record to ePrzeglądy via a separate worker process with its own retry queue. The mobile app has no direct knowledge of ePrzeglądy.

## Consequences

**Positive**
- ePrzeglądy outage is invisible to the technician; their actions sync to our backend regardless.
- Schema translation, auth, and rate-limiting against the third party live in one place (server) and can be evolved without app updates.
- One forwarding worker can fan out the same completion to multiple downstream systems if we add more integrations later.
- Failed ePrzeglądy forwards can be retried server-side without re-uploading the photo from the device.

**Negative**
- The technician has no immediate confirmation that ePrzeglądy received the record — only that our backend did. We accept this trade-off because the technician's workflow ends at "marked done", not "ePrzeglądy confirmed".
- Server now owns ePrzeglądy credentials and must rotate them safely; this is operational complexity we accept.
- A backend bug in the forwarding worker can silently delay ePrzeglądy updates — we mitigate with monitoring on the queue depth and forward latency.

## Alternatives Considered
- **App-direct integration with ePrzeglądy** — Would require shipping ePrzeglądy credentials to every device (rejected on security grounds), and would couple app uptime to ePrzeglądy uptime (rejected on NFR-03 grounds).
- **No ePrzeglądy integration in MVP** — Was considered, but the FR-017 promise is core to the value proposition (replace the office bottleneck). The brief explicitly names ePrzeglądy as a must-have integration. Rejected.
