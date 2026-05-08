#!/usr/bin/env bash
# check-idea.sh — validate stage 01 idea.md against conventions/01-idea/idea-template.md
#
# Usage: ./check-idea.sh <path-to-idea.md>
# Exit 0 = pass, exit 1 = fail. Prints human-readable list of failures.

set -u

FILE="${1:-}"
if [[ -z "$FILE" ]]; then
  echo "Usage: $0 <path-to-idea.md>" >&2
  exit 2
fi
if [[ ! -f "$FILE" ]]; then
  echo "FAIL: file not found: $FILE" >&2
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

# 1. Frontmatter present with required keys.
check "frontmatter: missing opening ---" "head -n1 \"$FILE\" | grep -qx -- '---'"
check "frontmatter: missing 'id:'"         "awk '/^---$/{n++;next} n==1' \"$FILE\" | grep -qE '^id:'"
check "frontmatter: missing 'jira:'"       "awk '/^---$/{n++;next} n==1' \"$FILE\" | grep -qE '^jira:'"
check "frontmatter: missing 'created:'"    "awk '/^---$/{n++;next} n==1' \"$FILE\" | grep -qE '^created:'"
check "frontmatter: missing 'version:'"    "awk '/^---$/{n++;next} n==1' \"$FILE\" | grep -qE '^version:'"

# 2. Required H2 sections present.
required_sections=(
  "## Problem"
  "## Hypothesis"
  "## Target user (high-level)"
  "## Success criteria"
  "## Out-of-scope"
  "## Sources"
)
for section in "${required_sections[@]}"; do
  check "missing section: $section" "grep -qxF '$section' \"$FILE\""
done

# 3. Hypothesis must be falsifiable: contains the four required phrases.
hyp_block=$(awk '/^## Hypothesis$/{flag=1; next} /^## /{flag=0} flag' "$FILE")
for phrase in "We believe" "for" "result in" "measured by"; do
  if ! echo "$hyp_block" | grep -qiF "$phrase"; then
    errors+=("hypothesis: missing required phrase '$phrase'")
  fi
done

# 4. Success criteria: at least 3 bullets, each with a digit.
crit_block=$(awk '/^## Success criteria$/{flag=1; next} /^## /{flag=0} flag' "$FILE")
crit_bullets=$(echo "$crit_block" | grep -cE '^- ')
crit_bullets_with_digit=$(echo "$crit_block" | grep -cE '^- .*[0-9]')
if (( crit_bullets < 3 )); then
  errors+=("success criteria: need at least 3 bullets, found $crit_bullets")
fi
if (( crit_bullets_with_digit < crit_bullets )); then
  errors+=("success criteria: every bullet must contain a numeric value")
fi

# 5. Out-of-scope: at least 1 bullet.
oos_block=$(awk '/^## Out-of-scope$/{flag=1; next} /^## /{flag=0} flag' "$FILE")
oos_bullets=$(echo "$oos_block" | grep -cE '^- ')
if (( oos_bullets < 1 )); then
  errors+=("out-of-scope: need at least 1 bullet")
fi

# 6. Sources: at least 1 bullet OR the literal "Initial brief only."
src_block=$(awk '/^## Sources$/{flag=1; next} /^## /{flag=0} flag' "$FILE")
src_bullets=$(echo "$src_block" | grep -cE '^- ')
if (( src_bullets < 1 )) && ! echo "$src_block" | grep -qF "Initial brief only."; then
  errors+=("sources: need at least 1 bullet or the literal 'Initial brief only.'")
fi

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $FILE conforms to idea-template.md"
  exit 0
fi

echo "FAIL: $FILE has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
