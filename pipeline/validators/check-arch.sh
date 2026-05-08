#!/usr/bin/env bash
# check-arch.sh — validate stage 04 architecture/ directory against conventions/04-architecture/
#
# Usage: ./check-arch.sh <path-to-04-architecture/>
# Exit 0 = pass, exit 1 = fail, exit 2 = bad invocation. Prints human-readable list of failures.

set -u

DIR="${1:-}"
if [[ -z "$DIR" ]]; then
  echo "Usage: $0 <path-to-04-architecture/>" >&2
  exit 2
fi
if [[ ! -d "$DIR" ]]; then
  echo "FAIL: directory not found: $DIR" >&2
  exit 1
fi

errors=()

check_file() {
  local f="$1"
  if [[ ! -f "$DIR/$f" ]]; then
    errors+=("missing required file: $f")
  fi
}

# 1. Required files exist.
check_file "architecture.md"
check_file "tech-stack.md"
check_file "data-model.md"
check_file "api-contracts.md"

# 2. ADR directory exists and contains at least one ADR file.
ADR_DIR="$DIR/adr"
if [[ ! -d "$ADR_DIR" ]]; then
  errors+=("missing required directory: adr/")
else
  adr_count=$(find "$ADR_DIR" -maxdepth 1 -type f -name 'ADR-*.md' | wc -l | tr -d ' ')
  if (( adr_count < 1 )); then
    errors+=("adr/: must contain at least one ADR-NNN-<slug>.md file")
  fi

  # 3. Each ADR file must have all required H2 sections.
  required_adr_sections=(
    "## Context"
    "## Decision"
    "## Consequences"
    "## Alternatives Considered"
  )
  while IFS= read -r adr; do
    [[ -z "$adr" ]] && continue
    base=$(basename "$adr")
    for section in "${required_adr_sections[@]}"; do
      if ! grep -qxF "$section" "$adr"; then
        errors+=("$base: missing section '$section'")
      fi
    done
    # Both positive and negative consequence blocks required.
    cons_block=$(awk '/^## Consequences$/{flag=1; next} /^## /{flag=0} flag' "$adr")
    if ! echo "$cons_block" | grep -qF '**Positive**'; then
      errors+=("$base: Consequences section missing '**Positive**' block")
    fi
    if ! echo "$cons_block" | grep -qF '**Negative**'; then
      errors+=("$base: Consequences section missing '**Negative**' block")
    fi
    # Alternatives Considered: at least 2 bullet entries.
    alt_block=$(awk '/^## Alternatives Considered$/{flag=1; next} /^## /{flag=0} flag' "$adr")
    alt_bullets=$(echo "$alt_block" | grep -cE '^- ')
    if (( alt_bullets < 2 )); then
      errors+=("$base: Alternatives Considered must list at least 2 alternatives, found $alt_bullets")
    fi
  done < <(find "$ADR_DIR" -maxdepth 1 -type f -name 'ADR-*.md')
fi

# 4. data-model.md entities reference glossary.
DM="$DIR/data-model.md"
if [[ -f "$DM" ]]; then
  if ! grep -qE '\[.*\]\(.*(glossary\.md|PRODUCT\.md)' "$DM"; then
    errors+=("data-model.md: no entity references the glossary (expected '[term](.../glossary.md...)' or '[term](.../PRODUCT.md...)' link)")
  fi
fi

# 5. api-contracts.md endpoints reference screens.
AC="$DIR/api-contracts.md"
if [[ -f "$AC" ]]; then
  if ! grep -qE '(S-[0-9]{2,}|Screen:)' "$AC"; then
    errors+=("api-contracts.md: no endpoint references a screen (expected 'S-NN' or 'Screen:' marker)")
  fi
fi

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $DIR conforms to 04-architecture conventions"
  exit 0
fi

echo "FAIL: $DIR has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
