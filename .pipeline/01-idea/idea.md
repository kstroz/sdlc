---
id: I-001
jira: BAJ-100
created: 2026-05-08
version: 1
---

# Field maintenance app for offline task execution

## Problem

Field maintenance technicians manage their daily work with printed paper lists, take completion photos that never reach the office, and record completed work hours after the fact when they return to a connected workstation. The result is a multi-day delay between work being done and the manager seeing it, evidence (photos) often lost on personal phones, and no real-time path for urgent tenant requests to reach the technician already in the field.

## Hypothesis

We believe that an offline-capable mobile app for field maintenance technicians will result in same-day completion records and zero photo loss, measured by 95 percent of completed tasks recorded within 4 hours of physical work.

## Target user (high-level)

Field maintenance technicians employed by property management organisations in Poland. They visit 4–8 buildings per day, often in older stock with poor or no connectivity, and need to record their work without returning to the office.

## Success criteria

- at least 95% of completed tasks have a completion record within 4 hours of physical completion (vs. current 24–48 hours)
- at least 80% of completed tasks include at least 1 photo attachment within 24 hours
- 0 lost photos for tasks marked done in the app over a 90-day pilot
- Technician self-reported daily app usage time ≤ 15 minutes (the app is a tool, not a job)
- 100% of pilot technicians (at least 4 users) actively using the app on day 30

## Out-of-scope

- Manager / admin web panel — separate spec, separate ticket
- Gas inspection protocol form — domain-specific, deferred to phase 2
- Tenant-facing features (resident reporting, communication)
- Reactive task creation by the technician (e.g., "I noticed a problem here" creating a follow-up) — manager-side workflow
- Integration with billing or HR systems

## Sources

- `_inputs/brief.md` [primary brief from product owner]
- `_inputs/interview-2026-05-08.md` [synthetic kickoff interview with two technicians, Marek and Tomasz]
