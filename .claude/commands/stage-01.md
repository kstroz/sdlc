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
   - `## Success criteria` — ≥ 3 bullets, each with at least one numeric value and a timeframe.
   - `## Out-of-scope` — ≥ 1 bullet. Derive from scope boundaries stated in inputs.
   - `## Sources` — list every `_inputs/` file used with a one-line reason, or the literal `Initial brief only.`

3. All prose must be in English. Translate any client-language content; keep original domain terms
   only inside `glossary.md` (stage 02). Do not leave Polish or other non-English prose in idea.md.

4. After writing the file run:

```bash
bash pipeline/validators/check-idea.sh .pipeline/01-idea/idea.md
```

Fix every reported failure. Re-run until the validator exits 0.

5. Show the user the final `idea.md` content and the validator output.
