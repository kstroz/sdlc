#!/usr/bin/env bash
# check-ux.sh — validate stage 03 UX directory against conventions/03-ux/*.
#
# Usage: ./check-ux.sh <path-to-03-ux-dir>
# Exit 0 = pass, exit 1 = validation failed, exit 2 = bad invocation.

set -u

DIR="${1:-}"
if [[ -z "$DIR" ]]; then
  echo "Usage: $0 <path-to-03-ux-dir>" >&2
  exit 2
fi
if [[ ! -d "$DIR" ]]; then
  echo "FAIL: directory not found: $DIR" >&2
  exit 1
fi

SCREENS="$DIR/screens.md"
FLOWS="$DIR/ux-flows.md"
INTERACTIONS="$DIR/interactions.md"
TOKENS="$DIR/design-tokens.md"

errors=()

# 1. All four required files must exist.
for f in "$SCREENS" "$FLOWS" "$INTERACTIONS" "$TOKENS"; do
  if [[ ! -f "$f" ]]; then
    errors+=("missing required file: $f")
  fi
done

# Stop early if any file is missing — downstream checks would be misleading.
if (( ${#errors[@]} > 0 )); then
  echo "FAIL: $DIR has ${#errors[@]} issue(s):"
  for e in "${errors[@]}"; do echo "  - $e"; done
  exit 1
fi

# Collect screen IDs from screens.md (lines like "## S-NN — ...").
screen_ids=$(grep -oE '^## S-[0-9]+' "$SCREENS" | awk '{print $2}' | sort -u)
if [[ -z "$screen_ids" ]]; then
  errors+=("screens.md: no '## S-NN' headings found")
fi

# 2. Each screen has all 5 required states mentioned in interactions.md
#    under its own '## S-NN' section.
required_states=("Default" "Loading" "Empty" "Error" "Disabled")
while IFS= read -r sid; do
  [[ -z "$sid" ]] && continue
  # Extract the section for this screen from interactions.md.
  section=$(awk -v id="$sid" '
    $0 ~ "^## "id"([ \t]|$|—)" {flag=1; next}
    flag && /^## / {flag=0}
    flag {print}
  ' "$INTERACTIONS")
  if [[ -z "$section" ]]; then
    errors+=("interactions.md: missing section for $sid")
    continue
  fi
  for state in "${required_states[@]}"; do
    if ! echo "$section" | grep -qE "^- \*\*${state}\*\*:[[:space:]]+.+"; then
      errors+=("interactions.md: $sid missing required state '$state' (must be a non-empty bold-keyed bullet)")
    fi
  done
done <<< "$screen_ids"

# 3. Each flow in ux-flows.md must reference at least one journey ID.
flow_headings=$(grep -nE '^## F-[0-9]+' "$FLOWS" || true)
if [[ -z "$flow_headings" ]]; then
  errors+=("ux-flows.md: no '## F-NN' flow headings found")
else
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    if ! echo "$line" | grep -qE 'journey:[[:space:]]*J-[0-9]+'; then
      errors+=("ux-flows.md: flow heading missing '(journey: J-NN)' — $line")
    fi
  done <<< "$flow_headings"
fi

# 4. Every S-NN referenced in ux-flows.md must exist in screens.md.
flow_screen_refs=$(grep -oE 'S-[0-9]+' "$FLOWS" | sort -u || true)
while IFS= read -r ref; do
  [[ -z "$ref" ]] && continue
  if ! echo "$screen_ids" | grep -qx -- "$ref"; then
    errors+=("ux-flows.md: references $ref which has no heading in screens.md")
  fi
done <<< "$flow_screen_refs"

# 5. design-tokens.md must contain all 6 required category headings.
required_categories=("## Color" "## Typography" "## Spacing" "## Radius" "## Shadow" "## Motion")
for cat in "${required_categories[@]}"; do
  if ! grep -qxF "$cat" "$TOKENS"; then
    errors+=("design-tokens.md: missing category heading '$cat'")
  fi
done

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $DIR conforms to conventions/03-ux/*"
  exit 0
fi

echo "FAIL: $DIR has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
