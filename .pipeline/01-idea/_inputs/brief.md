# Initial brief — Maintenance worker mobile app

**Ticket:** BAJ-100
**Date:** 2026-05-08
**Stakeholder:** Adam K. (product owner)

## Target users

Maintenance technicians (konserwatorzy) who work in the field, servicing buildings managed by a property management company. They are not desk workers — they spend most of their day on-site, often in basements, technical rooms, or building exteriors with poor connectivity.

## Core features

- **Task list per building** — each technician sees the tasks assigned to them, grouped by building
- **Task completion** — mark a task as done; attach a photo as proof of work
- **ePrzeglądy integration** — pull tasks from a central inspection-management system, push completion updates back
- **Offline-first** — must work without internet; sync once connectivity returns

## Scope

This brief is for **the technician's mobile app only**. The manager/admin web panel is out of scope here — that will be specified separately.

## Backend status

A backend already exists in our GitLab. API access is being negotiated. Until access is confirmed, assume the backend will be **mocked or partially generated** for development.

## Source

Synthetic kickoff interview with two technicians (Marek, Tomasz) — see `interview-2026-05-08.md`.
