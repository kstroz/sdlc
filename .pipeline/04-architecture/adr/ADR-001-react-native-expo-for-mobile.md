---
id: ADR-001
title: Use React Native with Expo for the technician mobile app
status: accepted
created: 2026-05-08
supersedes: None
superseded-by: None
related-nfrs: NFR-01, NFR-03, NFR-04, NFR-06
---

# ADR-001 — Use React Native with Expo for the technician mobile app

## Context

The technician app must run on iOS and Android, work fully offline (NFR-03), cold-start in under 2 seconds (NFR-01), drain less than 30 percent battery in an 8-hour shift (NFR-04), and offer 48x48 pixel tap targets (NFR-06). Our development team has TypeScript and JavaScript experience but limited native iOS or Android skills. The app surface is small (5 screens, no heavy graphics, no audio or AR), and the timeline pressure favours a single codebase.

## Decision

We use React Native (latest stable) with Expo's managed workflow. Native modules outside the Expo SDK are introduced via Expo development builds when required.

## Consequences

**Positive**
- Single codebase covers iOS and Android, halving implementation and maintenance effort.
- Expo's over-the-air updates let us patch critical bugs without going through app-store review (supports NFR-02 reliability response time).
- Mature offline ecosystem: WatermelonDB, expo-sqlite, expo-file-system, expo-notifications cover all our needs (NFR-03).
- TypeScript across the stack matches our team's expertise.

**Negative**
- React Native cold-start is slower than fully native (NFR-01 of 2s is achievable but tight on low-end Android devices; needs measurement during development).
- Expo managed workflow restricts which native modules we can include without ejecting; some integrations (e.g. specific camera SDKs) may force a development build.
- Memory and battery usage are typically 10–20 percent higher than native (mitigation: avoid unnecessary background work, NFR-04).
- New React Native versions can break Expo SDK compatibility; upgrades require coordination.

## Alternatives Considered
- **Native iOS (Swift) and native Android (Kotlin) separately** — Best performance and battery (NFR-01, NFR-04), but doubles team effort with our headcount and skills. Rejected on schedule and team-skills grounds.
- **Flutter** — Strong performance and offline tooling, but the team has no Dart experience and the surrounding library ecosystem for our integrations (offline-first databases, ePrzeglądy hooks via REST) is less mature than RN's. Rejected on team-skills and ecosystem grounds.
- **Capacitor + web stack** — Lowest learning curve, but battery drain and cold-start would not meet NFR-01 and NFR-04 on older Android devices common in the field. Rejected on NFR grounds.
