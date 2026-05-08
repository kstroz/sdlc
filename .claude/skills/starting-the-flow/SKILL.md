---
name: starting-the-flow
description: Use when the user runs /start-flow on a fresh fork. Handles init, brief capture, platform and tech-stack questions, then delegates to /stage-01..05 in sequence. The single entry point a forker should remember.
---

# Starting the SDLC Flow

**Announce at start:** "I'm using the starting-the-flow skill to walk you through the pipeline from a fresh brief."

## Overview

This is the wizard a forker runs once per feature. It collects the inputs that cannot be derived from a brief — chiefly platform scope and tech preferences — and writes them into the inputs directory so every downstream stage has a fact, not a guess.

The skill is a state machine: when re-invoked, it detects what already exists and resumes at the next missing step.

## State detection — run this every invocation

Before asking the user anything, scan the repo and decide which step to resume at:

| Condition | State |
|---|---|
| `pipeline/bin/init-project.sh` does not exist | Not on an sdlc fork — STOP and tell user |
| `.pipeline/` does not exist | Step 1: init the project |
| `.pipeline/01-idea/_inputs/brief.md` is empty or matches the placeholder template | Step 2: capture brief |
| `.pipeline/01-idea/_inputs/stack-preferences.md` does not exist AND `idea.md` does not exist | Step 3: ask platforms + tech |
| `.pipeline/01-idea/idea.md` does not exist | Step 4: run stage-01 |
| `.pipeline/02-spec/prd.md` does not exist | Step 5: run /generate-product if PRODUCT.md missing, then /stage-02 |
| `.pipeline/04-architecture/tech-stack.md` does not exist | Step 6: run /stage-03 (if mobile/web) or skip to /stage-04 |
| `.pipeline/05-dev/plan.md` does not exist | Step 7: run /stage-05 |
| `_approval-merge.json` exists with decision=approved | Step 8: done — print MERGE-READY message |

Tell the user the detected state in one short sentence, then proceed with that step.

---

## Step 1 — Initialise the project

Ask the user for the JIRA ticket ID and a short slug (or auto-derive a slug if the user does not have JIRA). Then run:

```bash
bash pipeline/bin/init-project.sh <TICKET-ID> <slug>
```

This switches to `feature/<TICKET>/<slug>` and seeds `.pipeline/`. Confirm the branch is now active and re-run state detection (back to top).

## Step 2 — Capture the brief

The brief is the seed for the entire pipeline. Ask the user how they want to provide it:

Use `AskUserQuestion` with these options:
- **Paste the brief now** — user pastes 1-3 paragraphs in the next message; you save it to `.pipeline/01-idea/_inputs/brief.md`.
- **Point at a file or URL** — user gives a path or URL; you copy/fetch and save to `_inputs/brief.md`.
- **I have transcripts already in _inputs/** — user has already dropped files; you skip this step.

Save the brief verbatim. Do not paraphrase. The user can edit it in `_inputs/` and re-run `/start-flow`.

## Step 3 — Platform and tech questions

This step is what makes `/start-flow` worth running. Ask the questions adaptively — only what is needed.

### Question 3.1 — Which platforms? (multi-select)

Use `AskUserQuestion` with `multiSelect: true`. Header: "Platforms". Options:

- **Mobile (cross-platform)** — One codebase for iOS and Android. Recommended unless you have native-only constraints.
- **Mobile (iOS only)** — Native iOS app with Swift.
- **Mobile (Android only)** — Native Android app with Kotlin.
- **Mobile (both, native each)** — Two native apps, one Swift, one Kotlin. Maximum performance, highest cost.
- **Web frontend** — Browser-facing UI (responsive or desktop-only).
- **Backend (new)** — We are building the server side on this branch.
- **Backend (existing — integrate)** — Server already exists; this branch consumes it via API.
- **Desktop** — macOS/Windows/Linux native or cross-platform desktop app.
- **CLI / library** — Command-line tool or library, no UI.

Record the picks. Map them to the keys used by `idea.md` `## Platforms` section:

| Pick | idea.md key | state |
|---|---|---|
| Mobile (cross-platform) | `mobile-cross-platform` | yes |
| Mobile (iOS only) | `mobile-ios` | yes; `mobile-android: no` |
| Mobile (Android only) | `mobile-android` | yes; `mobile-ios: no` |
| Mobile (both, native each) | `mobile-ios` + `mobile-android` | both yes |
| Web frontend | `web` | yes |
| Backend (new) | `backend` | yes |
| Backend (existing — integrate) | `backend` | existing |
| Desktop | `desktop` | yes |
| CLI / library | `cli` | yes |

For platform keys not picked, mark them `no` in the `## Platforms` section.

### Question 3.2 — Mobile tech (only if any mobile picked)

Adaptive based on 3.1:

**If "Mobile (cross-platform)":**
Use `AskUserQuestion`. Header: "Mobile framework". Options:
- **React Native + Expo** (recommended) — JS/TS, fastest to ship, large ecosystem, OTA updates.
- **React Native bare** — Same JS/TS, more native control, more setup.
- **Flutter** — Dart, Google's, strong UI primitives.
- **Capacitor** — Web stack wrapped in a shell; lowest learning curve.
- **Let the architect decide at Stage 04** — Architect picks based on NFRs and trade-offs.

**If "Mobile (iOS only)" or "Mobile (both, native each)":**
Header: "iOS UI framework". Options:
- **SwiftUI** (recommended for new apps) — Declarative, modern.
- **UIKit** — Imperative, mature, more Stack Overflow answers.
- **Let the architect decide at Stage 04**.

**If "Mobile (Android only)" or "Mobile (both, native each)":**
Header: "Android UI framework". Options:
- **Jetpack Compose** (recommended for new apps) — Declarative, modern Kotlin.
- **XML views (legacy)** — Imperative, mature.
- **Let the architect decide at Stage 04**.

### Question 3.3 — Backend tech (only if "Backend (new)" picked)

Header: "Backend stack". Options:
- **Node.js + Express** — JS/TS, fast iteration.
- **Node.js + Fastify** — Same, lower overhead.
- **Python + FastAPI** — Type hints, async-first.
- **Python + Django** — Batteries included, ORM, admin.
- **Go + chi or Gin** — Single binary, low memory.
- **Java + Spring Boot** — Enterprise default.
- **Let the architect decide at Stage 04**.

### Question 3.4 — Web tech (only if "Web frontend" picked)

Header: "Web framework". Options:
- **Next.js** — React, full-stack, SSR-capable.
- **React + Vite** — SPA, no SSR.
- **SvelteKit** — Smaller bundles, less boilerplate.
- **Vue 3 + Vite**.
- **Let the architect decide at Stage 04**.

### Question 3.5 — Override authority

After collecting tech answers, ask one final question:

Header: "Override authority". Options:
- **Hard preference** (override allowed: no) — The architect MUST use these choices unless an NFR makes it impossible. Use when license, hiring, or prior commitment forces the stack.
- **Soft preference** (override allowed: yes) — The architect treats your picks as the first alternative in the trade-off matrix, but may pick differently if the NFRs warrant. Use when you have an opinion but trust the architect to weigh it.
- **No preference — let architect decide** — Skip writing `stack-preferences.md`. The architect picks freely from a balanced shortlist.

If the user picked "Let the architect decide at Stage 04" for every layer, also skip `stack-preferences.md` and tell the user as much.

## Step 4 — Write the inputs

Based on the answers from Step 3, write two files:

### `.pipeline/01-idea/_inputs/stack-preferences.md`

Only when the user picked at least one concrete tech (not "Let the architect decide"). Follow the schema in `pipeline/conventions/01-idea/stack-preferences-template.md`. Frontmatter `id: STACK-PREF-001`, today's date, version 1.

For each layer the user answered:
- `preferred:` the user's pick.
- `alternatives acceptable:` short comma-list inferred from the question's other options minus the pick (or `none` if hard preference).
- `reason:` "Forker preference captured via /start-flow on <date>." Or whatever justification the user volunteered.
- `override allowed:` from Question 3.5.

Layers the user said "Let the architect decide" for: omit from this file. The architect will choose freely.

### `.pipeline/01-idea/_open-questions.md` (only if anything was ambiguous)

If the user genuinely could not answer a question — e.g. they do not know whether the project includes a backend or not — log it here as `Q-NN` and stop the wizard with a clear message. Do not invent. Honest "I don't know" is the user's prerogative; the wizard escalates.

## Step 5 — Generate idea.md (delegate to /stage-01)

Apply the instructions from `.claude/commands/stage-01.md`. The brief is now in `_inputs/brief.md` and the Platforms answer from Step 3.1 must populate the `## Platforms` section in `idea.md` exactly. Do NOT re-ask the user — you already have the data.

Run the validator:

```bash
bash pipeline/validators/check-idea.sh .pipeline/01-idea/idea.md
```

Fix every failure (typically: hypothesis missing a phrase, success criteria without numbers). Re-run until exit 0.

## Step 6 — Hand off

Print to the user:

```
✅ idea.md created and validated.
✅ Platforms recorded: <list from 3.1>.
✅ Stack preferences saved at _inputs/stack-preferences.md (or "deferred to architect" if applicable).

Next steps:
  /stage-02   — generate prd.md + stories from the brief
  /generate-product   — generate PRODUCT.md (personas + glossary) — run before /stage-02 if PRODUCT.md does not exist

Or just re-run /start-flow and I will detect the state and continue.
```

If the user has additional transcripts or research notes, suggest they drop them into `.pipeline/02-spec/_inputs/` before `/stage-02`.

## Why this skill exists

- **One command, intuitive name.** A forker remembers `/start-flow`. Remembering the seven slash commands and their order is friction.
- **Asks only what cannot be derived.** Platforms and tech preference are the two facts the brief usually does not state. Everything else (problem, hypothesis, success criteria) the agent extracts from the brief.
- **State machine, not a tutorial.** Re-running the wizard does the right thing — resumes, never restarts. The forker can call `/stage-XX` directly when they want fine-grained control; `/start-flow` is for the common case.
- **Hard-vs-soft preference is captured.** Many "I want React Native" preferences are actually requirements (only RN devs on the team). The override question makes that distinction explicit before Stage 04 burns time on a trade-off matrix that does not matter.
