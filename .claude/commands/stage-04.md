# Stage 04 — Architecture

Read `pipeline/conventions/04-architecture/README.md` and all files under
`pipeline/conventions/04-architecture/` before writing anything.

## What to read as source material

1. `.pipeline/02-spec/prd.md` — epics, stories, NFRs (required).
2. `.pipeline/03-ux/screens.md` and `ux-flows.md` — screens and transitions (required).
3. `PRODUCT.md` — glossary for entity naming.
4. `.pipeline/03-ux/design-tokens.md` — for tech-stack mobile/web decision context.

If stage 02 or 03 artifacts are missing, tell the user to run the earlier stages first and stop.

## What to produce

Five artifacts under `.pipeline/04-architecture/`, in this order:

### 1. tech-stack.md
Five `## ` sections: `Mobile`, `Backend`, `Data`, `Infra`, `Observability`.
Follow `pipeline/conventions/04-architecture/tech-stack-decision-template.md`.
Each layer: `Choice`, `ADR` link, `Alternatives evaluated` (≥ 2), trade-off matrix with
NFR IDs as criteria rows, `Constraints accepted`.

### 2. data-model.md
One `## <EntityName>` block per entity. Follow `pipeline/conventions/04-architecture/data-model-template.md`.
Derive entities from PRODUCT.md Glossary terms and story acceptance criteria.
Each entity: `Glossary` link, `Purpose`, `Source story` (US-NNN), `Fields` table,
`Relationships`, `Indexes`, `Lifecycle`.

### 3. api-contracts.md
One `## <METHOD> <path>` block per endpoint. Follow `pipeline/conventions/04-architecture/api-contract-template.md`.
Derive endpoints from ux-flows.md transitions that require data. Each endpoint:
`Endpoint ID`, `Purpose`, `Source screens` (S-NN), `Auth`, `Request`, `Response 2xx`,
`Response errors` (≥ 1 error case), `Idempotency`, `Rate limit`.

### 4. ADR files
One `adr/ADR-NNN-<slug>.md` per significant decision (tech stack choices, data storage,
offline sync strategy, auth approach). Follow `pipeline/conventions/04-architecture/adr-template.md`.
Each ADR: frontmatter with `related-nfrs`, sections `Context`, `Decision`, `Consequences`
(both Positive and Negative), `Alternatives Considered` (≥ 2).

### 5. architecture.md
High-level system overview: components, their responsibilities, and how they connect.
Reference ADR IDs for every non-obvious decision. 1–2 pages maximum.

## After writing

Run:

```bash
bash pipeline/validators/check-arch.sh .pipeline/04-architecture
```

Fix every failure. Re-run until the validator exits 0.
