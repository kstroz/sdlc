#!/usr/bin/env bash
# check-spec.sh — validate stage 02 prd.md against conventions/02-spec/prd-template.md
#
# Usage: ./check-spec.sh <path-to-02-spec-dir>
# Exit 0 = pass, exit 1 = fail, exit 2 = bad invocation.

set -u

DIR="${1:-}"
if [[ -z "$DIR" ]]; then
  echo "Usage: $0 <path-to-02-spec-dir>" >&2
  exit 2
fi
if [[ ! -d "$DIR" ]]; then
  echo "FAIL: directory not found: $DIR" >&2
  exit 1
fi

FILE="$DIR/prd.md"
if [[ ! -f "$FILE" ]]; then
  echo "FAIL: missing required file: prd.md" >&2
  exit 1
fi

errors=()

check() {
  local label="$1"
  local cmd="$2"
  if ! eval "$cmd" >/dev/null 2>&1; then
    errors+=("$label")
  fi
}

# 1. Frontmatter.
check "frontmatter: missing opening ---"  "head -n1 \"$FILE\" | grep -qx -- '---'"
check "frontmatter: missing 'id:'"        "awk '/^---$/{n++;next} n==1' \"$FILE\" | grep -qE '^id:'"
check "frontmatter: missing 'jira:'"      "awk '/^---$/{n++;next} n==1' \"$FILE\" | grep -qE '^jira:'"
check "frontmatter: missing 'created:'"   "awk '/^---$/{n++;next} n==1' \"$FILE\" | grep -qE '^created:'"
check "frontmatter: missing 'version:'"   "awk '/^---$/{n++;next} n==1' \"$FILE\" | grep -qE '^version:'"

# 2. Required top-level sections.
check "missing section: ## Overview"                    "grep -qxF '## Overview' \"$FILE\""
check "missing section: ## Epics"                       "grep -qxF '## Epics' \"$FILE\""
check "missing section: ## Non-functional requirements" "grep -qxF '## Non-functional requirements' \"$FILE\""
check "missing section: ## Out of scope"                "grep -qxF '## Out of scope' \"$FILE\""

# 3. Overview must reference an idea ID.
overview_block=$(awk '/^## Overview$/{flag=1; next} /^## /{flag=0} flag' "$FILE")
if ! echo "$overview_block" | grep -qE 'I-[0-9]+'; then
  errors+=("overview: must link to idea ID matching I-[0-9]+")
fi

# 4. At least one epic heading.
check "epics: no ### E-NN heading found" "grep -qE '^### E-[0-9]{2}' \"$FILE\""

# 5. Each epic must contain at least one user story.
epic_ids=$(grep -oE '^### E-[0-9]{2}' "$FILE" | awk '{print $2}')
while IFS= read -r eid; do
  [[ -z "$eid" ]] && continue
  block=$(awk -v id="### $eid" '
    $0 ~ "^"id"( |$)" {flag=1; next}
    /^### E-/ {flag=0}
    flag {print}
  ' "$FILE")
  if ! echo "$block" | grep -qE '^#### US-[0-9]{3}'; then
    errors+=("epic $eid: contains no #### US-NNN story")
  fi
done <<< "$epic_ids"

# 6. Each user story: statement, priority, acceptance criteria, source.
story_ids=$(grep -oE '^#### US-[0-9]{3}' "$FILE" | awk '{print $2}')
while IFS= read -r sid; do
  [[ -z "$sid" ]] && continue
  block=$(awk -v id="#### $sid" '
    $0 ~ "^"id"( |$)" {flag=1; next}
    /^#### / {flag=0}
    flag {print}
  ' "$FILE")

  for phrase in "As a" "I want to" "so that"; do
    if ! echo "$block" | grep -qiF "$phrase"; then
      errors+=("story $sid: missing required phrase '$phrase' in statement")
    fi
  done

  if ! echo "$block" | grep -qE '\*\*Priority\*\*:\s*(MUST|SHOULD|COULD)'; then
    errors+=("story $sid: missing or invalid Priority (must be MUST, SHOULD, or COULD)")
  fi

  ac_block=$(echo "$block" | awk '/\*\*Acceptance criteria\*\*/{flag=1; next} /^\*\*[A-Z]/{flag=0} flag')
  if ! echo "$ac_block" | grep -qiE 'given.*when.*then|given'; then
    errors+=("story $sid: acceptance criteria missing Given/when/then")
  fi

  if ! echo "$block" | grep -qE '_inputs/.*\.md'; then
    errors+=("story $sid: missing Source with _inputs/ reference")
  fi
done <<< "$story_ids"

# 7. NFR table: at least 3 data rows, each with a digit.
nfr_block=$(awk '/^## Non-functional requirements$/{flag=1; next} /^## /{flag=0} flag' "$FILE")
nfr_rows=$(echo "$nfr_block" | grep -cE '^\|[^|]+\|[^|]+\|[^|]+\|' || true)
if (( nfr_rows < 4 )); then  # header + separator + at least 3 data rows = 5 lines minimum, but be lenient
  nfr_data_rows=$(echo "$nfr_block" | grep -E '^\|' | grep -v '^|[-| ]*|$' | grep -v 'ID.*Category' | grep -cE '[0-9]' || true)
  if (( nfr_data_rows < 3 )); then
    errors+=("non-functional requirements: need at least 3 rows with numeric targets, found $nfr_data_rows")
  fi
fi

# 8. Out of scope: at least 1 bullet.
oos_block=$(awk '/^## Out of scope$/{flag=1; next} /^## /{flag=0} flag' "$FILE")
oos_bullets=$(echo "$oos_block" | grep -cE '^- ' || true)
if (( oos_bullets < 1 )); then
  errors+=("out of scope: need at least 1 bullet item")
fi

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $FILE conforms to prd-template.md"
  exit 0
fi

echo "FAIL: $FILE has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
