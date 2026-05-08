---
id: PRD-001
jira: BAJ-100
created: 2026-05-08
version: 1
---

# PRD — Field maintenance app for offline task execution

## Overview

Field maintenance technicians today manage their day with paper task lists, take completion photos that never reach the office, and record completed work hours after the fact when they return to a connected workstation. This PRD scopes a mobile app that gives technicians their daily task list per building, lets them mark completion with a photo, and works fully offline with later sync to the central inspection-management system. See idea: [I-001](../01-idea/idea.md).

## Epics

| ID | Name | Stories |
|---|---|---|
| E-01 | Authentication and identity | US-001, US-002 |
| E-02 | Daily task list | US-003, US-004, US-005 |
| E-03 | Task completion with photo | US-006, US-007, US-008 |
| E-04 | Offline mode and sync | US-009, US-010, US-011, US-012 |
| E-05 | ePrzeglądy integration | US-013 |

## Non-functional requirements

| ID | Category | Requirement | Source |
|---|---|---|---|
| NFR-01 | Performance | Cold app start to Today screen in less than 2 seconds on the target device class. | `_inputs/interview-2026-05-08.md:L77` |
| NFR-02 | Reliability | Zero data loss on app crash or device restart for any task action queued locally. | `_inputs/interview-2026-05-08.md:L91` |
| NFR-03 | Offline | All MUST features in E-02, E-03, E-04 work with 0 network connectivity for at least 24 hours of typical usage. | `_inputs/interview-2026-05-08.md:L57` |
| NFR-04 | Battery | App active for 8 hours of typical field usage drains less than 30 percent of a fully charged 3000 mAh battery. | `_inputs/interview-2026-05-08.md:L97` |
| NFR-05 | Storage | Local photo storage frees space when synced photos exceed 7 days locally; 0 photos lost during cleanup. | `_inputs/interview-2026-05-08.md:L93` |
| NFR-06 | Accessibility | Tap targets at least 48x48 pixels; key actions reachable with one hand on a 6.1 inch device. | `_inputs/interview-2026-05-08.md:L77` |

## Out of scope

- Manager and admin web panel (separate spec, separate ticket).
- Gas inspection protocol form (deferred — Marek's domain only, not MVP).
- Tenant-facing features (resident reporting and communication).
- Reactive task creation by technician.
- Integration with billing or HR systems.
