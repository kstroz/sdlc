#!/usr/bin/env bash
# check-traceability.sh — validate cross-stage upstream links across a .pipeline/ tree.
#
# Reads every artifact present and checks the minimum upstream-link rules from
# pipeline/conventions/_global/traceability.md. Stages that do not exist on the
# branch are skipped (graceful for in-progress branches).
#
# Usage: ./check-traceability.sh <path-to-.pipeline-dir>
# Exit 0 = pass, 1 = missing/broken links, 2 = bad invocation.

set -u

ROOT="${1:-}"
if [[ -z "$ROOT" ]]; then
  echo "Usage: $0 <path-to-.pipeline-dir>" >&2
  exit 2
fi
if [[ ! -d "$ROOT" ]]; then
  echo "FAIL: directory not found: $ROOT" >&2
  exit 2
fi

errors=()

# add_error <file> <line> <message>
add_error() {
  errors+=("$1:$2: $3")
}

# find_id_blocks <file> <id-prefix>
# Prints each block as "LINE:ID" for every H2/H3 heading whose text starts with
# the given prefix (e.g. "P-01", "JTBD-02", "FR-014").
find_id_blocks() {
  local file="$1" prefix="$2"
  grep -nE "^(##|###) ${prefix}-[0-9]+" "$file" 2>/dev/null \
    | sed -E "s/^([0-9]+):(##|###) (${prefix}-[0-9]+).*/\1:\3/"
}

# block_body <file> <start-line>
# Echoes the lines from start-line until the next heading of equal-or-shallower depth.
block_body() {
  local file="$1" start="$2"
  awk -v s="$start" '
    NR==s { depth = match($0, /[^#]/) - 1; print; next }
    NR>s {
      if ($0 ~ /^#+ /) {
        d = match($0, /[^#]/) - 1
        if (d <= depth) exit
      }
      print
    }
  ' "$file"
}

# require_link <file> <block-line> <id> <pattern> <label>
# Fails if the block body does not contain a link matching <pattern>.
require_link() {
  local file="$1" line="$2" id="$3" pattern="$4" label="$5"
  local body
  body=$(block_body "$file" "$line")
  if ! echo "$body" | grep -qE "$pattern"; then
    add_error "$file" "$line" "$id missing required upstream link to $label"
  fi
}

# ---- Stage 02: personas → JTBD ------------------------------------------------
PERSONAS_FILE="$ROOT/02-spec/personas.md"
JTBD_FILE="$ROOT/02-spec/jtbd.md"
if [[ -f "$PERSONAS_FILE" ]]; then
  while IFS=: read -r line id; do
    [[ -z "$line" ]] && continue
    require_link "$PERSONAS_FILE" "$line" "$id" 'JTBD-[0-9]+' "JTBD-NN"
  done < <(find_id_blocks "$PERSONAS_FILE" "P")
fi

# ---- Stage 02: journeys → personas -------------------------------------------
JOURNEYS_FILE="$ROOT/02-spec/user-journeys.md"
if [[ -f "$JOURNEYS_FILE" ]]; then
  while IFS=: read -r line id; do
    [[ -z "$line" ]] && continue
    require_link "$JOURNEYS_FILE" "$line" "$id" 'P-[0-9]+' "P-NN"
  done < <(find_id_blocks "$JOURNEYS_FILE" "J")
fi

# ---- Stage 02: FR → journey ---------------------------------------------------
FR_FILE="$ROOT/02-spec/functional-requirements.md"
if [[ -f "$FR_FILE" ]]; then
  while IFS=: read -r line id; do
    [[ -z "$line" ]] && continue
    require_link "$FR_FILE" "$line" "$id" 'J-[0-9]+' "J-NN"
  done < <(find_id_blocks "$FR_FILE" "FR")
fi

# ---- Stage 03: screens → journey step ----------------------------------------
SCREENS_FILE="$ROOT/03-ux/screens.md"
if [[ -f "$SCREENS_FILE" ]]; then
  while IFS=: read -r line id; do
    [[ -z "$line" ]] && continue
    require_link "$SCREENS_FILE" "$line" "$id" 'J-[0-9]+' "J-NN"
  done < <(find_id_blocks "$SCREENS_FILE" "S")
fi

# ---- Stage 04: data-model entity → glossary + journey ------------------------
DATA_FILE="$ROOT/04-architecture/data-model.md"
if [[ -f "$DATA_FILE" ]]; then
  # Each entity is an H3 heading. Require a glossary.md link AND a J-NN link.
  while IFS=: read -r line heading; do
    [[ -z "$line" ]] && continue
    body=$(block_body "$DATA_FILE" "$line")
    if ! echo "$body" | grep -qE 'glossary\.md#'; then
      add_error "$DATA_FILE" "$line" "entity '$heading' missing glossary link"
    fi
    if ! echo "$body" | grep -qE 'J-[0-9]+'; then
      add_error "$DATA_FILE" "$line" "entity '$heading' missing journey link"
    fi
  done < <(grep -nE '^### ' "$DATA_FILE" | sed -E 's/^([0-9]+):### (.*)$/\1:\2/')
fi

# ---- Stage 04: API endpoint → screen -----------------------------------------
API_FILE="$ROOT/04-architecture/api.md"
if [[ -f "$API_FILE" ]]; then
  while IFS=: read -r line heading; do
    [[ -z "$line" ]] && continue
    body=$(block_body "$API_FILE" "$line")
    if ! echo "$body" | grep -qE 'S-[0-9]+'; then
      add_error "$API_FILE" "$line" "endpoint '$heading' missing screen (S-NN) link"
    fi
  done < <(grep -nE '^### ' "$API_FILE" | sed -E 's/^([0-9]+):### (.*)$/\1:\2/')
fi

# ---- Stage 04: ADR → NFR or constraint ---------------------------------------
ADR_DIR="$ROOT/04-architecture/adr"
if [[ -d "$ADR_DIR" ]]; then
  while IFS= read -r adr; do
    [[ -z "$adr" ]] && continue
    if ! grep -qE '(NFR-[0-9]+|constraint)' "$adr"; then
      add_error "$adr" "1" "ADR missing link to NFR-NNN or named constraint"
    fi
  done < <(find "$ADR_DIR" -type f -name 'ADR-*.md' 2>/dev/null)
fi

# ---- Result -------------------------------------------------------------------
if (( ${#errors[@]} == 0 )); then
  echo "PASS: $ROOT — traceability links satisfied (or stages not yet present)"
  exit 0
fi

echo "FAIL: $ROOT has ${#errors[@]} traceability issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
