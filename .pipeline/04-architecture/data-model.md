---
id: DATA-MODEL-001
created: 2026-05-08
version: 1
---

# Data model

## User
- **Glossary**: [Konserwator](../../PRODUCT.md#konserwator)
- **Purpose**: Represents an authenticated technician using the app; scopes task lists and completion records to a single person.
- **Source story**: [US-001](../02-spec/stories/US-001-sign-in-with-credentials.md) — Marek explicitly asked for personal accounts on the device.
- **Fields**:
  | Name | Type | Constraints | Nullable |
  |---|---|---|---|
  | id | UUID | primary key | no |
  | username | string(64) | unique | no |
  | displayName | string(128) | none | no |
  | sessionToken | string(512) | none | yes |
  | sessionExpiresAt | datetime | none | yes |
- **Relationships**:
  - one-to-many → Task (cardinality: 0..N, owning side: User; tasks reference assignedToUserId)
- **Indexes**: `username` (unique lookup at sign-in)
- **Lifecycle**: Created on first sign-in; soft-deleted on account deactivation server-side; local row removed on sign-out.

## Building
- **Glossary**: [Building](../../PRODUCT.md#building)
- **Purpose**: A managed property that groups tasks on the technician's list; carries the address used for navigation and identification.
- **Source story**: [US-003](../02-spec/stories/US-003-today-tasks-grouped-by-building.md) — tasks are grouped by building on Today.
- **Fields**:
  | Name | Type | Constraints | Nullable |
  |---|---|---|---|
  | id | UUID | primary key | no |
  | name | string(128) | none | no |
  | streetAddress | string(256) | none | no |
  | city | string(64) | none | no |
  | latitude | decimal(9,6) | none | yes |
  | longitude | decimal(9,6) | none | yes |
- **Relationships**:
  - one-to-many → Task (cardinality: 0..N, owning side: Building; tasks reference buildingId)
- **Indexes**: `id` (PK only); city is low-cardinality and not indexed.
- **Lifecycle**: Created when the manager adds a property server-side; synced to device on next pull; never hard-deleted (archived flag set when a property leaves the portfolio).

## Task
- **Glossary**: [Task](../../PRODUCT.md#task)
- **Purpose**: A unit of work assigned to a technician at a building; carries status, completion data, and any block reason.
- **Source story**: [US-006](../02-spec/stories/US-006-mark-task-as-done.md) — the central interaction of the app.
- **Fields**:
  | Name | Type | Constraints | Nullable |
  |---|---|---|---|
  | id | UUID | primary key | no |
  | buildingId | UUID | foreign key Building.id | no |
  | assignedToUserId | UUID | foreign key User.id | no |
  | title | string(256) | none | no |
  | description | text | none | yes |
  | managerNotes | text | none | yes |
  | priority | enum(normal,urgent) | default normal | no |
  | dueAt | datetime | none | yes |
  | status | enum(pending,done,blocked) | default pending | no |
  | blockReason | enum(needs_parts,tenant_absent,needs_specialist) | none | yes |
  | blockNote | text | none | yes |
  | completedAt | datetime | none | yes |
  | completedByUserId | UUID | foreign key User.id | yes |
- **Relationships**:
  - many-to-one → Building (cardinality: N..1, owning side: Task)
  - many-to-one → User (cardinality: N..1, owning side: Task; assignedToUserId)
  - one-to-many → Photo (cardinality: 0..N, owning side: Task)
- **Indexes**: `(assignedToUserId, dueAt)` for the Today query; `(buildingId)` for grouping; `status` for filtering.
- **Lifecycle**: Created server-side and pushed to device; transitions pending → done or pending → blocked locally on action; never re-opened (rework spawns a new Task per Phase 2 conventions).

## Photo
- **Glossary**: [Task](../../PRODUCT.md#task)
- **Purpose**: A captured image attached to a Task as completion proof; binary stored on filesystem, metadata in DB.
- **Source story**: [US-007](../02-spec/stories/US-007-attach-completion-photo.md) — photo attachment is the second-tap confirmation in the completion flow.
- **Fields**:
  | Name | Type | Constraints | Nullable |
  |---|---|---|---|
  | id | UUID | primary key | no |
  | taskId | UUID | foreign key Task.id | no |
  | localPath | string(512) | none | yes |
  | remoteUrl | string(512) | none | yes |
  | syncStatus | enum(pending,uploading,synced,failed) | default pending | no |
  | capturedAt | datetime | none | no |
  | syncedAt | datetime | none | yes |
  | localPathCleared | bool | default false | no |
  | sizeBytes | integer | none | no |
- **Relationships**:
  - many-to-one → Task (cardinality: N..1, owning side: Photo)
- **Indexes**: `(taskId)` for retrieval per task; `(syncStatus, syncedAt)` for the cleanup job (ADR-004).
- **Lifecycle**: Created on completion sheet; localPath cleared 7 days after `syncedAt` per NFR-05; metadata row preserved permanently for audit.

## OutboxAction
- **Glossary**: [Task](../../PRODUCT.md#task)
- **Purpose**: A queued offline action waiting to be replayed against the backend; the durable contract between local and server state.
- **Source story**: [US-009](../02-spec/stories/US-009-use-app-fully-offline.md), [US-010](../02-spec/stories/US-010-sync-queued-actions.md) — offline writes and sync.
- **Fields**:
  | Name | Type | Constraints | Nullable |
  |---|---|---|---|
  | id | UUID | primary key (also idempotency key) | no |
  | actionType | enum(complete_task,attach_photo,block_task) | none | no |
  | payload | json | none | no |
  | status | enum(pending,in_flight,succeeded,failed) | default pending | no |
  | attemptCount | integer | default 0 | no |
  | lastAttemptAt | datetime | none | yes |
  | lastError | text | none | yes |
  | createdAt | datetime | none | no |
- **Relationships**:
  - None (the payload references domain ids by value; no FK to keep the queue self-contained).
- **Indexes**: `(status, createdAt)` for FIFO drain; `id` (PK).
- **Lifecycle**: Created in the same transaction as the domain write; deleted on successful sync (succeeded rows pruned older than 30 days for audit); failed rows surfaced in UI.
