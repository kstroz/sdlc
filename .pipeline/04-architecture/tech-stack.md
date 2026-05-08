---
id: TECH-STACK-001
created: 2026-05-08
version: 1
---

# Tech stack

## Mobile
- **Choice**: React Native 0.74 with Expo SDK 51 (managed workflow, dev-client when needed)
- **ADR**: [ADR-001](./adr/ADR-001-react-native-expo-for-mobile.md)
- **Alternatives evaluated** (at least 2):
  - Native Swift + Kotlin — doubles team effort with current headcount
  - Flutter — no Dart experience on the team; smaller offline-DB ecosystem for our needs
  - Capacitor + web — battery and cold-start concerns on older Android devices
- **Trade-off matrix**:
  | Criterion (NFR) | RN+Expo | Native | Flutter |
  |---|---|---|---|
  | NFR-01: cold start at most 2s | partial | satisfies | satisfies |
  | NFR-03: offline ecosystem | satisfies | satisfies | partial |
  | NFR-04: battery 8h shift | partial | satisfies | satisfies |
  | NFR-06: a11y tap targets | satisfies | satisfies | satisfies |
- **Constraints accepted**: Cold start on low-end Android needs measurement and possibly Hermes tuning; some native module integrations may force a development build instead of pure managed.

## Backend
- **Choice**: Existing backend in GitLab (Node.js + Express assumed; concrete framework documented in repo); the team owns it. New endpoints added per api-contracts.md.
- **ADR**: [ADR-005](./adr/ADR-005-eprzeglady-mediation-on-backend.md)
- **Alternatives evaluated** (at least 2):
  - New backend stood up for this app — duplicates effort and creates two systems of record
  - Direct mobile-to-ePrzeglądy — rejected on security and NFR-03 grounds in ADR-005
- **Trade-off matrix**:
  | Criterion (NFR) | Reuse existing | New backend | App-direct |
  |---|---|---|---|
  | NFR-02: reliability | satisfies | partial | fails |
  | NFR-03: offline tolerant | satisfies | satisfies | fails |
  | Time to market | satisfies | partial | satisfies |
- **Constraints accepted**: We inherit existing auth model and deployment cadence; any breaking change to the backend coordinates with the existing team.

## Data
- **Choice**: WatermelonDB (SQLite-backed) on device for relational data; expo-file-system for photo binaries; backend's existing Postgres for server-side persistence; S3-compatible object store for synced photos (existing infrastructure).
- **ADR**: [ADR-002](./adr/ADR-002-watermelondb-for-local-store.md), [ADR-004](./adr/ADR-004-photo-storage-and-lifecycle.md)
- **Alternatives evaluated** (at least 2):
  - AsyncStorage/MMKV only — no relations or transactions
  - expo-sqlite directly — re-implements WatermelonDB's reactive layer
  - Realm — sync product couples to MongoDB Atlas
- **Trade-off matrix**:
  | Criterion (NFR) | Watermelon+FS | AsyncStorage | Realm |
  |---|---|---|---|
  | NFR-02: ACID writes | satisfies | fails | satisfies |
  | NFR-03: offline 24h+ | satisfies | partial | satisfies |
  | NFR-05: photo cleanup | satisfies | partial | partial |
- **Constraints accepted**: Two-system bookkeeping (DB metadata + filesystem binary); WatermelonDB schema migrations decoupled from server schema.

## Infra
- **Choice**: Expo EAS Build for mobile binaries; existing GitLab CI/CD for backend; Expo OTA updates for non-native fixes. Distribution via TestFlight (iOS) and internal Play track (Android) during pilot.
- **ADR**: [ADR-001](./adr/ADR-001-react-native-expo-for-mobile.md)
- **Alternatives evaluated** (at least 2):
  - Self-hosted Fastlane + custom signing — operational overhead during pilot
  - GitHub Actions for mobile — possible but team uses GitLab for backend
- **Trade-off matrix**:
  | Criterion (NFR) | EAS | Self-hosted | GH Actions |
  |---|---|---|---|
  | Time to market | satisfies | fails | partial |
  | NFR-02: rollback speed | satisfies | partial | partial |
- **Constraints accepted**: Vendor lock-in on EAS for builds during pilot; revisit at GA.

## Observability
- **Choice**: Sentry for crash reporting and performance traces (mobile + backend); structured logging via Pino on backend; basic on-device console-redirect to Sentry breadcrumbs.
- **ADR**: [ADR-001](./adr/ADR-001-react-native-expo-for-mobile.md)
- **Alternatives evaluated** (at least 2):
  - Self-hosted ELK — operational burden out of scope for pilot
  - Datadog — cost premium not justified at pilot scale
- **Trade-off matrix**:
  | Criterion (NFR) | Sentry | ELK | Datadog |
  |---|---|---|---|
  | NFR-02: crash visibility | satisfies | partial | satisfies |
  | Time to integrate | satisfies | fails | satisfies |
- **Constraints accepted**: Sentry vendor lock for the duration of the pilot; PII redaction policy must be in place before launch.
