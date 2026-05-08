---
id: ADR-003
title: Outbox pattern with idempotency keys for offline-to-online sync
status: accepted
created: 2026-05-08
supersedes: None
superseded-by: None
related-nfrs: NFR-02, NFR-03
---

# ADR-003 — Outbox pattern with idempotency keys for offline-to-online sync

## Context

FR-012 requires every offline action (mark done, attach photo, block with reason) to be queued locally and replayed on reconnect (FR-013, FR-014). NFR-02 demands zero data loss on crash. Mobile networks drop and reappear unpredictably; the same action may be retried by the OS, by the app on next launch, or by the user pulling to refresh. The backend must not double-apply a task completion.

## Decision

Each offline action is written to a local Outbox table inside the WatermelonDB transaction that updates the corresponding domain row. The Outbox row carries a UUID idempotency key, the action type, the payload, the attempt count, and a status (`pending`, `in-flight`, `succeeded`, `failed`). A sync worker processes the Outbox in FIFO order on connectivity change. The backend deduplicates by idempotency key.

## Consequences

**Positive**
- Atomic local commit guarantees the user-facing change and the queued sync action either both happen or neither does (NFR-02).
- Idempotency keys make at-least-once delivery safe — duplicate sends are rejected on the server, never double-applied.
- Replay on app launch handles the "killed mid-sync" case for free.
- FIFO ordering is preserved; a `mark-done` arrives before its `attach-photo` follow-up.

**Negative**
- Outbox grows during long offline periods; we must cap and warn users approaching the cap (cap defined as 500 actions; warning at 400).
- Idempotency keys must be generated client-side and survive crash, requiring stable UUID generation in the same transaction as the write.
- Server must persist seen idempotency keys for at least the maximum offline window (we set 30 days; ties to ADR-005 backend contract).

## Alternatives Considered
- **Last-write-wins with timestamps** — Simple, but loses data when two devices race or when an action is retried after a successful but un-acked send. Rejected on NFR-02 grounds.
- **Event sourcing all the way to the backend** — Would let us reconstruct full state from the action log, but the backend already exists with a CRUD-style API and rebuilding it is out of scope. Rejected on backend-coupling grounds.
- **CRDT-based sync (Automerge / Yjs)** — Excellent for collaborative scenarios but our writes are owned by a single technician at a time; the complexity is unjustified. Rejected on YAGNI grounds.
