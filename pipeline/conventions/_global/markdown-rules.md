# Markdown rules

Applies to every artifact under `<branch>/.pipeline/`. Rendering targets are GitLab MR view, IDE preview, and the gate-comment generator. Rules below keep all three consistent.

## Rules

### Frontmatter

Every artifact MUST start with YAML frontmatter containing at minimum:

```yaml
---
id: <prefix>-<number>             # e.g. I-001, FR-014, ADR-007
jira: <TICKET-ID>                 # source ticket
created: YYYY-MM-DD
version: <integer>                # bump on every revision
---
```

Stage-specific templates MAY require additional fields (e.g. `owner`, `status`). They MUST NOT remove any of the four above.

### Heading hierarchy

- Exactly **one H1** per file. The H1 is the artifact title.
- **H2** sections match the order defined in the stage template. Skills generating the artifact MUST NOT reorder, rename, or omit required H2s.
- **H3** is used for entries within a list-of-items artifact (e.g. `### J-03 — Bedtime audio playback`). The H3 MUST start with the ID so the auto-generated anchor matches `cross-references.md`.
- Do not skip levels (no H4 directly under H2).

### Code blocks

- Every fenced code block MUST declare a language tag: `bash`, `yaml`, `json`, `typescript`, `text`, etc. Untagged ` ``` ` blocks fail the markdown-rules check.
- Inline code uses single backticks. No triple backticks for a single word.

### Lists

- Bullet character is `-`. `*` and `+` are forbidden — pick one and the diff stays clean.
- Numbered lists use `1.`, `2.`, … (no `1)`).
- Nested lists indent by **two spaces** per level.

### Inline HTML

- Forbidden. No `<br>`, `<details>`, `<sub>`, `<img>` tags. If the markdown renderer cannot show what you need, the artifact is in the wrong format.
- Exception: GitLab task-list checkboxes (`- [ ]`, `- [x]`) — these are markdown, not HTML.

### Whitespace

- Single trailing newline at end-of-file.
- No trailing spaces on any line.
- Blank line above and below every heading and every fenced code block.

## Why

- Strict frontmatter lets validators parse metadata with `awk`/`yq` without a markdown parser.
- One H1 makes the table-of-contents predictable; the gate-comment generator pulls the H1 as the artifact title.
- Language-tagged code blocks render with syntax highlighting in GitLab and prevent accidental rendering of YAML as prose.
- Banning inline HTML keeps artifacts portable: any future migration (Confluence, Notion, static site) reads the same source without sanitisation.
- Consistent bullets and indentation reduce diff noise — reviewers see content changes, not formatting churn.
