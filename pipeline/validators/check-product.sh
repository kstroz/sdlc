#!/usr/bin/env bash
# check-product.sh — validate PRODUCT.md against conventions/product-template.md
#
# Usage: ./check-product.sh <path-to-PRODUCT.md>
# Exit 0 = pass, exit 1 = fail, exit 2 = bad invocation.

set -u

FILE="${1:-}"
if [[ -z "$FILE" ]]; then
  echo "Usage: $0 <path-to-PRODUCT.md>" >&2
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

# 1. Frontmatter.
check "frontmatter: missing opening ---"  "head -n1 \"$FILE\" | grep -qx -- '---'"
check "frontmatter: missing 'id:'"        "awk '/^---$/{n++;next} n==1' \"$FILE\" | grep -qE '^id:'"
check "frontmatter: missing 'created:'"   "awk '/^---$/{n++;next} n==1' \"$FILE\" | grep -qE '^created:'"
check "frontmatter: missing 'version:'"   "awk '/^---$/{n++;next} n==1' \"$FILE\" | grep -qE '^version:'"

# 2. Required top-level sections.
check "missing section: ## Target segment" "grep -qxF '## Target segment' \"$FILE\""
check "missing section: ## Personas"       "grep -qxF '## Personas' \"$FILE\""
check "missing section: ## Glossary"       "grep -qxF '## Glossary' \"$FILE\""

# 3. At least one persona heading.
check "personas: no ### P-NN heading found" "grep -qE '^### P-[0-9]{2}' \"$FILE\""

# 4. Each persona must have required fields and a sourced quote.
persona_ids=$(grep -oE '^### P-[0-9]{2}' "$FILE" | awk '{print $2}')
while IFS= read -r pid; do
  [[ -z "$pid" ]] && continue
  block=$(awk -v id="### $pid" '
    $0 ~ "^"id"( |$)" {flag=1; next}
    /^### / {flag=0}
    flag {print}
  ' "$FILE")
  for field in "Role" "Context" "Goals" "Frustrations" "Tech literacy" "Quote"; do
    if ! echo "$block" | grep -qF "**${field}**"; then
      errors+=("persona $pid: missing field '${field}'")
    fi
  done
  if ! echo "$block" | grep -qE '_inputs/.*\.md:L[0-9]+'; then
    errors+=("persona $pid: Quote missing '_inputs/<file>.md:L<line>' source reference")
  fi
done <<< "$persona_ids"

# 5. At least one glossary entry.
check "glossary: no ### <Term> heading found" "grep -qE '^### .+' \"$FILE\""

# 6. Each glossary entry must have Definition and Source.
in_glossary=false
while IFS= read -r line; do
  if [[ "$line" == "## Glossary" ]]; then
    in_glossary=true
    continue
  fi
  if [[ "$in_glossary" == true && "$line" =~ ^##[^#] ]]; then
    in_glossary=false
  fi
  if [[ "$in_glossary" == true && "$line" =~ ^###\ .+ ]]; then
    term="${line#### }"
    block=$(awk -v h="### $term" '
      $0 == h {flag=1; next}
      /^### / {flag=0}
      flag {print}
    ' "$FILE")
    if ! echo "$block" | grep -qF '**Definition**'; then
      errors+=("glossary '$term': missing Definition field")
    fi
    if ! echo "$block" | grep -qF '**Source**'; then
      errors+=("glossary '$term': missing Source field")
    fi
  fi
done < "$FILE"

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $FILE conforms to product-template.md"
  exit 0
fi

echo "FAIL: $FILE has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
