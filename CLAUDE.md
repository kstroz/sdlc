# SDLC Pipeline

Forkable template for running a structured pre-development pipeline on any feature.
After forking, run `bash pipeline/bin/init-project.sh <TICKET> <slug>` to seed the
feature branch, then drive each stage with the slash commands below.

## Slash commands

| Command | Produces |
|---|---|
| `/stage-01` | `.pipeline/01-idea/idea.md` |
| `/stage-02` | 6 spec artifacts under `.pipeline/02-spec/` |
| `/stage-03` | screens, flows, interactions, design tokens under `.pipeline/03-ux/` |
| `/stage-04` | tech stack, data model, API contracts, ADRs under `.pipeline/04-architecture/` |
| `/stage-05` | plan, tests-plan, tasks, quality reports under `.pipeline/05-dev/` |

## Rules that apply to every artifact

- **Language**: English. Domain terms from client transcripts go in `glossary.md` as quoted strings; all artifact prose stays English.
- **Stable IDs**: once assigned, an ID never changes even if the artifact is renamed.
- **No forward references**: stage-02 artifacts must not link to stage-04 ADRs. Links always flow from later stages back to earlier ones.
- **No placeholders**: complete every section or omit it. Validators reject TBD and TODO.
- **Frontmatter required** on every artifact: `id`, `jira`, `created`, `version`.
- **Validators are the gate**: run the validator after each stage; fix every failure before reporting done.

## Artifact layout

```text
.pipeline/
├── 01-idea/
│   ├── _inputs/           raw briefs, transcripts, client notes
│   └── idea.md
├── 02-spec/
│   ├── _inputs/
│   ├── glossary.md
│   ├── personas.md
│   ├── jobs-to-be-done.md
│   ├── user-journeys.md
│   ├── functional-requirements.md
│   └── non-functional-requirements.md
├── 03-ux/
│   ├── screens.md
│   ├── ux-flows.md
│   ├── interactions.md
│   └── design-tokens.md
└── 04-architecture/
    ├── architecture.md
    ├── tech-stack.md
    ├── data-model.md
    ├── api-contracts.md
    └── adr/
```
