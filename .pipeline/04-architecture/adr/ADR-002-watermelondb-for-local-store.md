---
id: ADR-002
title: Use WatermelonDB as the local offline store
status: accepted
created: 2026-05-08
supersedes: None
superseded-by: None
related-nfrs: NFR-02, NFR-03, NFR-05
version: 2
---

# ADR-002 — Use WatermelonDB as the local offline store

## Context

NFR-03 requires the app to function with zero connectivity for at least 24 hours. NFR-02 requires zero data loss on crash or restart. The data model includes Tasks, Buildings, Photos, and a Sync Queue, with reads on every screen and writes on completion actions. The app must scale to a few thousand tasks per technician per year without lag (US-003 list rendering at less than 1 second). Photos are large binary blobs requiring a separate storage strategy.

## Decision

We use WatermelonDB (SQLite-backed) as the local relational store for all task, building, and queue records. Photo binaries are stored separately on the filesystem via expo-file-system, with WatermelonDB holding only the photo metadata and local file path.

## Consequences

**Positive**
- Lazy loading and observable queries match React Native rendering — only visible rows are read into memory (NFR-04 battery, NFR-01 list render speed).
- ACID transactions via SQLite give crash safety: a `mark done + attach photo + enqueue sync` sequence either commits fully or rolls back (NFR-02).
- Schema migrations are first-class; we can evolve the model across app versions without losing user data.
- 24-hour offline capacity is bounded only by device storage (well above NFR-03 target).

**Negative**
- WatermelonDB schema is its own migration system, separate from server-side schema; the two must be kept in sync manually.
- Documentation is sparser than competing libraries; learning curve for engineers new to the library.
- Observable queries are coupled to React rendering; misuse can cause unnecessary re-renders if components do not memoise correctly.

## Alternatives Considered
- **AsyncStorage / MMKV (key-value only)** — Simple and fast but cannot model relations or transactions across multiple records. Mark-done + photo attachment + queue would require manual transaction logic prone to partial-write bugs (NFR-02 risk). Rejected.
- **expo-sqlite directly** — Gives us SQLite without WatermelonDB's reactive layer. Workable, but we would re-implement the observation/cache layer that drives our list screens. Rejected on duplicated-effort grounds.
- **Realm** — Comparable feature set, but its sync product is opinionated and tied to MongoDB Atlas; we already have a different backend (per ADR-005). Rejected on sync-coupling grounds.

## Amendment — 2026-05-08

For the BAJ-100 end-to-end test pass, the local store is implemented as a lightweight in-memory cache layer (`Map<string, Row>` per collection) that satisfies the same `Database` and `Collection` interfaces this ADR governs. WatermelonDB native modules require `npm install` plus a recompile that is out of scope for the test environment; the production swap to the SQLite-backed adapter is deferred. No interface changes are required at the swap — only the `inMemoryDatabase()` factory is replaced with a WatermelonDB-backed factory.
