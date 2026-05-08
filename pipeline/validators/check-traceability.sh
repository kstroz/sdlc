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

# PRODUCT.md lives one level above .pipeline/
PRODUCT_FILE="$(dirname "$ROOT")/PRODUCT.md"

errors=()

add_error() {
  errors+=("$1:$2: $3")
}

# block_body <file> <start-line>
# Echoes lines from start-line until the next heading of equal-or-shallower depth.
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

# ---- Stage 02: stories → P-NN persona + _inputs/ source ----------------------
STORIES_DIR="$ROOT/02-spec/stories"
if [[ -d "$STORIES_DIR" ]]; then
  while IFS= read -r story_file; do
    [[ -z "$story_file" ]] && continue

    # Statement must reference a P-NN persona.
    if ! grep -qE '\bP-[0-9]+\b' "$story_file"; then
      add_error "$story_file" "1" "story statement missing P-NN persona reference"
    else
      # Every P-NN referenced must exist in PRODUCT.md.
      if [[ -f "$PRODUCT_FILE" ]]; then
        while IFS= read -r pref; do
          [[ -z "$pref" ]] && continue
          if ! grep -qE "^### ${pref}([ \t]|$|—)" "$PRODUCT_FILE"; then
            add_error "$story_file" "1" "references $pref which has no heading in PRODUCT.md"
          fi
        done < <(grep -oE '\bP-[0-9]+\b' "$story_file" | sort -u)
      fi
    fi

    # Source field must point to _inputs/.
    if ! grep -qE '^## Source' "$story_file"; then
      add_error "$story_file" "1" "missing ## Source section"
    elif ! grep -A5 '^## Source' "$story_file" | grep -qE '_inputs/'; then
      add_error "$story_file" "1" "## Source does not reference _inputs/ file"
    fi
  done < <(find "$STORIES_DIR" -type f -name 'US-*.md' 2>/dev/null | sort)
fi

# ---- Stage 03: screens → US-NNN story ----------------------------------------
SCREENS_FILE="$ROOT/03-ux/screens.md"
if [[ -f "$SCREENS_FILE" ]]; then
  # Each screen is an H2 heading "## S-NN — ...". Require a US-NNN reference in body.
  while IFS=: read -r line sid; do
    [[ -z "$line" ]] && continue
    body=$(block_body "$SCREENS_FILE" "$line")
    if ! echo "$body" | grep -qE '\bUS-[0-9]+\b'; then
      add_error "$SCREENS_FILE" "$line" "$sid missing required story reference (US-NNN)"
    else
      # Each US-NNN referenced must have a story file.
      if [[ -d "$STORIES_DIR" ]]; then
        while IFS= read -r uref; do
          [[ -z "$uref" ]] && continue
          num="${uref#US-}"
          if ! find "$STORIES_DIR" -type f -name "US-${num}-*.md" 2>/dev/null | grep -q .; then
            if ! find "$STORIES_DIR" -type f -name "US-${num}.md" 2>/dev/null | grep -q .; then
              add_error "$SCREENS_FILE" "$line" "$sid references $uref but no story file found in stories/"
            fi
          fi
        done < <(echo "$body" | grep -oE '\bUS-[0-9]+\b' | sort -u)
      fi
    fi
  done < <(grep -nE '^## S-[0-9]+' "$SCREENS_FILE" \
    | sed -E 's/^([0-9]+):## (S-[0-9]+).*/\1:\2/')
fi

# ---- Stage 04: data-model entity → PRODUCT.md glossary + US-NNN --------------
DATA_FILE="$ROOT/04-architecture/data-model.md"
if [[ -f "$DATA_FILE" ]]; then
  while IFS=: read -r line heading; do
    [[ -z "$line" ]] && continue
    body=$(block_body "$DATA_FILE" "$line")
    if ! echo "$body" | grep -qE 'PRODUCT\.md#'; then
      add_error "$DATA_FILE" "$line" "entity '$heading' missing PRODUCT.md glossary link"
    fi
    if ! echo "$body" | grep -qE '\bUS-[0-9]+\b'; then
      add_error "$DATA_FILE" "$line" "entity '$heading' missing story link (US-NNN)"
    fi
  done < <(grep -nE '^### ' "$DATA_FILE" | sed -E 's/^([0-9]+):### (.*)$/\1:\2/')
fi

# ---- Stage 04: API endpoint → screen -----------------------------------------
API_FILE="$ROOT/04-architecture/api-contracts.md"
if [[ ! -f "$API_FILE" ]]; then
  # Fallback to legacy name.
  API_FILE="$ROOT/04-architecture/api.md"
fi
if [[ -f "$API_FILE" ]]; then
  while IFS=: read -r line heading; do
    [[ -z "$line" ]] && continue
    body=$(block_body "$API_FILE" "$line")
    if ! echo "$body" | grep -qE '\bS-[0-9]+\b'; then
      add_error "$API_FILE" "$line" "endpoint '$heading' missing screen reference (S-NN)"
    fi
  done < <(grep -nE '^### ' "$API_FILE" | sed -E 's/^([0-9]+):### (.*)$/\1:\2/')
fi

# ---- Stage 04: ADR → NFR-NN or named constraint ------------------------------
ADR_DIR="$ROOT/04-architecture/adr"
if [[ -d "$ADR_DIR" ]]; then
  while IFS= read -r adr; do
    [[ -z "$adr" ]] && continue
    if ! grep -qE '(NFR-[0-9]+|constraint)' "$adr"; then
      add_error "$adr" "1" "ADR missing link to NFR-NNN or named constraint"
    fi
  done < <(find "$ADR_DIR" -type f -name 'ADR-*.md' 2>/dev/null | sort)
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
