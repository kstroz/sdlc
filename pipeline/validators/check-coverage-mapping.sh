#!/usr/bin/env bash
# check-coverage-mapping.sh — verify every J-NN journey is mapped in tests-plan.md.
#
# Usage: ./check-coverage-mapping.sh <path-to-tests-plan.md> <path-to-user-journeys.md>
# Exit 0 = pass, exit 1 = validation failed, exit 2 = bad invocation.

set -u

TESTS_PLAN="${1:-}"
JOURNEYS="${2:-}"
if [[ -z "$TESTS_PLAN" || -z "$JOURNEYS" ]]; then
  echo "Usage: $0 <path-to-tests-plan.md> <path-to-user-journeys.md>" >&2
  exit 2
fi
if [[ ! -f "$TESTS_PLAN" ]]; then
  echo "FAIL: tests-plan.md not found: $TESTS_PLAN" >&2
  exit 1
fi
if [[ ! -f "$JOURNEYS" ]]; then
  echo "FAIL: user-journeys.md not found: $JOURNEYS" >&2
  exit 1
fi

errors=()

# 1. tests-plan.md must have an E2E coverage section.
if ! grep -qxF "## E2E coverage" "$TESTS_PLAN"; then
  errors+=("tests-plan.md: missing '## E2E coverage' section")
fi

# 2. tests-plan.md must have a Unit coverage section.
if ! grep -qxF "## Unit coverage" "$TESTS_PLAN"; then
  errors+=("tests-plan.md: missing '## Unit coverage' section")
fi

# 3. Every J-NN heading from user-journeys.md must appear in the E2E coverage block.
journey_ids=$(grep -oE '^## J-[0-9]{2}' "$JOURNEYS" | awk '{print $2}' | sort -u)

if [[ -z "$journey_ids" ]]; then
  errors+=("user-journeys.md: no journey headings matching '## J-NN'")
else
  e2e_block=$(awk '
    /^## E2E coverage$/ {flag=1; next}
    /^## /              {flag=0}
    flag {print}
  ' "$TESTS_PLAN")

  while IFS= read -r jid; do
    [[ -z "$jid" ]] && continue
    if ! echo "$e2e_block" | grep -qE "(^|[^A-Za-z0-9])${jid}([^0-9]|$)"; then
      errors+=("E2E coverage missing for $jid (declared in user-journeys.md)")
    fi
  done <<< "$journey_ids"
fi

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $TESTS_PLAN covers every J-NN from $JOURNEYS"
  exit 0
fi

echo "FAIL: $TESTS_PLAN has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
