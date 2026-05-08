---
id: ADR-006
title: Adopt Expo SDK 54 instead of SDK 51 for the technician mobile app
status: accepted
created: 2026-05-08
supersedes: ADR-001
superseded-by: None
related-nfrs: NFR-01, NFR-04
---

# ADR-006 — Adopt Expo SDK 54 instead of SDK 51 for the technician mobile app

## Context

ADR-001 specified "React Native (latest stable) with Expo's managed workflow" and was written against Expo SDK 51, which was the current stable line at the time of authoring. When the mobile app was bootstrapped with `create-expo-app@latest`, the scaffold resolved to Expo SDK 54 (see `app/package.json`: `expo: ~54.0.33`). Rather than manually downgrade the freshly generated project to SDK 51, we accepted the newer SDK because it is the version any new fork of this pipeline will receive by default, and pinning to an older line would create a maintenance burden on every fork. The decision affects cold-start performance (NFR-01) and battery behaviour (NFR-04) because each Expo SDK ships with a new React Native runtime that adjusts both. We treat this as a narrow amendment to ADR-001's SDK version line, not a re-evaluation of the broader React Native + Expo choice.

## Decision

We use Expo SDK 54 for the technician mobile app. ADR-001 is superseded only with respect to its SDK version reference; the choice of React Native + Expo managed workflow, the use of OTA updates, the development-build escape hatch, and all other decisions in ADR-001 remain in force.

## Consequences

**Positive**
- Latest security and bugfix patches are received without a backport effort, reducing exposure between releases.
- Longer Expo support window: SDK 54 will receive maintenance after SDK 51 reaches end-of-life, deferring the next forced upgrade.
- Aligns with what `create-expo-app@latest` produces today, so contributors and forks do not need to downgrade after scaffolding.
- New React Native runtime in SDK 54 includes Hermes and New Architecture improvements relevant to cold-start (NFR-01).

**Negative**
- SDK 54 deprecates several patterns that worked in SDK 51, notably `expo-av` (split into `expo-audio` and `expo-video`) and the legacy `expo-notifications` background handler API; any code copied from SDK 51 examples will need migration.
- A newer SDK has a shorter field-tested track record; bugs that were already patched in SDK 51 point releases may still be present and surface in our app first (risk to NFR-01 and NFR-04 until measured).
- Older developer machines (macOS versions below the SDK 54 minimum, Xcode below the required line) cannot build the project without an OS or tooling upgrade.
- Some third-party Expo-compatible libraries lag the SDK by weeks; we may temporarily need pinned forks or development builds.

## Alternatives Considered
- **Pin to Expo SDK 51 as ADR-001 specified** — Rejected because every new fork created via `create-expo-app@latest` produces an SDK 54 scaffold, so pinning to 51 would require a manual downgrade step on every fork and would put us on a line approaching end-of-life. The cost of staying current on SDK 51 outweighs the upside of avoiding a documentation amendment.
- **Wait for Expo SDK 55** — Rejected because SDK 55 is not yet stable at the time of this decision; adopting an unreleased line would put NFR-01 and NFR-04 at unmeasurable risk and would block development. We will revisit when SDK 55 reaches stable.
- **Eject to bare React Native and pick the RN version directly** — Rejected because it discards the OTA-update and managed-workflow benefits established in ADR-001, in exchange for SDK-version flexibility we do not need.
