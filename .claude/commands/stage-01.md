# Stage 01 — Idea capture

Read `pipeline/conventions/_global/writing-style.md`, `pipeline/conventions/_global/markdown-rules.md`,
`pipeline/conventions/_global/cross-references.md`, and `pipeline/conventions/01-idea/idea-template.md`
before writing anything.

## Your task

1. Read every file under `.pipeline/01-idea/_inputs/`. If the directory is empty, tell the user
   to drop a brief or transcript there first and stop.

2. Synthesise the inputs into `.pipeline/01-idea/idea.md` following `idea-template.md` exactly.

   Required sections in order:
   - Frontmatter: `id: I-001`, `jira` (ask the user if not found in inputs), `created: <today>`, `version: 1`
   - H1 title — short, action-oriented
   - `## Problem` — 2–4 sentences. WHO has the problem and WHAT is going wrong. No solution language.
   - `## Hypothesis` — one sentence: "We believe that <change> for <user> will result in <outcome>, measured by <metric>."
   - `## Target user (high-level)` — 2–3 sentences on the segment, not individuals.
   - `## Platforms` — see rules below; ≥ 1 bullet with state `yes` or `existing`.
   - `## Success criteria` — ≥ 3 bullets, each with at least one numeric value and a timeframe.
   - `## Out-of-scope` — ≥ 1 bullet. Derive from scope boundaries stated in inputs.
   - `## Sources` — list every `_inputs/` file used with a one-line reason, or the literal `Initial brief only.`

3. **Platforms section — special handling.** This section captures whether we are building a mobile app, a web client, a backend, or some combination. Tech stack inside each platform is decided in Stage 04, not here. Process:

   a. Scan the inputs for explicit platform statements ("mobile app for technicians", "responsive web", "backend already exists in GitLab", etc.).
   b. If every required platform key (mobile-ios, mobile-android or mobile-cross-platform, web, backend) can be classified from the inputs as `yes` / `no` / `existing` / `deferred`, write the section.
   c. If ANY required key is genuinely ambiguous — the inputs do not say either way — DO NOT GUESS. Apply the `requesting-customer-input` skill: log a Q-NN entry to `.pipeline/01-idea/_open-questions.md` listing the unclear platforms with concrete options the user can pick from, and stop the stage. Do not write a partial idea.md that the validator will then refuse.
   d. After the user resolves the open question(s), resume and write the Platforms section.

4. **Stack preferences (optional).** If the inputs include a `_inputs/stack-preferences.md` file, do NOT copy its content into idea.md — Stage 04 reads it directly. Just note in `## Sources` that stack-preferences.md exists.

5. All prose must be in English. Translate any client-language content; keep original domain terms
   only inside `glossary.md` (stage 02). Do not leave Polish or other non-English prose in idea.md.

6. After writing the file run:

```bash
bash pipeline/validators/check-idea.sh .pipeline/01-idea/idea.md
```

Fix every reported failure. Re-run until the validator exits 0.

7. Show the user the final `idea.md` content and the validator output. If you logged an open question in step 3.c, surface that to the user as the next blocking item.
