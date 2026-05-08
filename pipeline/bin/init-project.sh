#!/usr/bin/env bash
# init-project.sh — seed a feature branch with the .pipeline/ directory structure.
#
# Run from the root of a repo that was created from the sdlc template
# (so pipeline/ already exists at the repo root).
#
# Usage: init-project.sh <ticket-id> [<short-slug>]
# Example: init-project.sh BAJ-123 calorie-tracker

set -euo pipefail

TICKET="${1:-}"
SLUG="${2:-feature}"

if [[ -z "$TICKET" ]]; then
  echo "Usage: $0 <ticket-id> [<short-slug>]" >&2
  echo "Example: $0 BAJ-123 calorie-tracker" >&2
  exit 2
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: not inside a git repository. Run this from your project root." >&2
  exit 1
fi

if [[ ! -d pipeline/validators ]]; then
  echo "Error: pipeline/ not found at repo root. Did you use the sdlc template?" >&2
  exit 1
fi

BRANCH="feature/${TICKET}/${SLUG}"

if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  git checkout -q "$BRANCH"
else
  git checkout -q -b "$BRANCH"
fi

mkdir -p \
  .pipeline/01-idea/_inputs \
  .pipeline/02-spec/_inputs \
  .pipeline/03-ux/_inputs \
  .pipeline/04-architecture/adr \
  .pipeline/05-dev/tasks \
  .pipeline/05-dev/quality-reports

if [[ ! -f .pipeline/01-idea/_inputs/brief.md ]]; then
  cat > .pipeline/01-idea/_inputs/brief.md <<EOF
# Initial brief for ${TICKET}

Replace this with the real brief, stakeholder discussion notes, recorded
workshop transcript, or whatever raw material starts this feature.

The capturing-idea-as-artifact skill turns this into a compliant idea.md.
EOF
fi

cat <<EOF

Branch: $BRANCH
.pipeline/ directories seeded.

Next steps:
  1. Edit .pipeline/01-idea/_inputs/brief.md with the real brief
  2. Run: claude
  3. Tell Claude: "Apply SDLC pipeline stage 01 — generate idea.md from the brief"
  4. Validate: bash pipeline/validators/check-idea.sh .pipeline/01-idea/idea.md
EOF
