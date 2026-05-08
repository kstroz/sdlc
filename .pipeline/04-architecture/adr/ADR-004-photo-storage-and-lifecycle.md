---
id: ADR-004
title: Photo storage on filesystem with metadata in WatermelonDB and 7-day retention
status: accepted
created: 2026-05-08
supersedes: None
superseded-by: None
related-nfrs: NFR-02, NFR-04, NFR-05
---

# ADR-004 — Photo storage on filesystem with metadata in WatermelonDB and 7-day retention

## Context

US-007 requires photos attached to completion records. Photos are typically 2–5 MB each, JPEG. Technicians may take multiple photos per task, multiple tasks per day, multiple days offline. NFR-05 requires local storage to free space when synced photos exceed 7 days locally with zero photos lost during cleanup. NFR-04 requires that photo handling not dominate battery use.

## Decision

Photo binaries are stored on the device filesystem via `expo-file-system` under an app-private directory. The WatermelonDB `Photo` entity stores only metadata: id, taskId, localPath, syncStatus, capturedAt, syncedAt. A scheduled cleanup job runs on app start and on each sync completion: photos with `syncStatus = synced` and `syncedAt > 7 days ago` are deleted from the filesystem and the metadata row is marked `localPathCleared = true` (the row itself is preserved for audit).

## Consequences

**Positive**
- Filesystem storage is the cheapest operation per byte for binary data; SQLite blob storage would balloon the database file and slow queries.
- Lifecycle rule is deterministic and traceable: every photo deletion has a recorded `syncedAt` and `cleanedAt`.
- Audit trail preserved (metadata rows survive cleanup) so a manager or auditor can prove the photo existed even after the binary is gone.
- Battery cost is minimised: cleanup is event-driven, not polling.

**Negative**
- Two-system bookkeeping (DB + filesystem) requires care during cleanup — we must verify the file delete succeeded before flipping `localPathCleared` to avoid orphaned rows pointing nowhere.
- A user who has not synced for more than 7 days has unbounded local storage usage; we surface a banner above 1 GB used.
- Filesystem path must survive app upgrades; we use stable subpath under `FileSystem.documentDirectory` and reject relative paths.

## Alternatives Considered
- **Store photos as BLOB in SQLite** — Simple single-table model, but SQLite WAL files balloon and queries on adjacent tables slow noticeably above ~500 MB. Rejected on performance grounds (NFR-01, NFR-04).
- **Upload immediately, do not store locally** — Cuts local storage to zero, but breaks NFR-03 (offline) — the technician must be able to attach a photo with no network. Rejected.
- **No retention rule, keep until manually cleared** — Violates NFR-05 cleanup requirement and leads to filling the device. Rejected.
