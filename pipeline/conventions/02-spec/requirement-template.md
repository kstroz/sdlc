# Requirement Template (Stage 02)

Defines one functional requirement inside `02-spec/functional-requirements.md`. Every FR ties back to a journey step; without that traceability the requirement is a feature wish, not a derived requirement.

## Required structure

```markdown
---
id: FR-001
created: YYYY-MM-DD
version: 1
---

# Functional Requirements

## FR-001 — <Short label>
- **Statement**: As a <persona role>, I want to <capability>, so that <outcome>.
- **Acceptance criteria**:
  - Given <precondition>, when <action>, then <observable result>.
  - Given <precondition>, when <action>, then <observable result>.
- **Priority**: MUST | SHOULD | COULD
- **Source journey**: J-NN (step N)
```

At least one FR is required. FR IDs are zero-padded to three digits (`FR-001`, `FR-042`). Acceptance criteria use the Given/When/Then triple verbatim — the validator checks for those connectors.

## Validation rules

The validator FAILS the gate if:

1. **Frontmatter** missing at top of `functional-requirements.md`.
2. **FR ID** does not match `FR-[0-9]{3}`.
3. **Statement** missing any of `As a`, `I want to`, `so that`.
4. **Acceptance criteria** has fewer than 1 bullet, or any bullet missing `Given`, `when`, `then` (case-insensitive on the connectors but each must appear).
5. **Priority** value is not one of `MUST`, `SHOULD`, `COULD`. (MoSCoW; `WONT` belongs in `01-idea/idea.md` Out-of-scope, not here.)
6. **Source journey** absent or does not reference a `J-NN` ID. A step number is recommended but not enforced.

## Why

- **User-story statement** keeps the requirement framed by user value, not implementation. "The system shall expose a POST endpoint" belongs to stage 04, not here.
- **Given/When/Then acceptance criteria** are testable. They become the skeleton of stage 03 prototypes and stage 04 contract tests.
- **MUST/SHOULD/COULD** forces the team to budget. A spec where every FR is MUST is a spec that has not been negotiated.
- **Source journey link enforced** is the rule that prevents requirement inflation. If you cannot point at the journey step that motivates the FR, the FR is speculative and belongs in a backlog file, not the spec.
