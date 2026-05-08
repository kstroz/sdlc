#!/usr/bin/env bash
# check-coverage-mapping.sh — verify every US-NNN story declared in plan.md is mapped in tests-plan.md.
#
# Usage: ./check-coverage-mapping.sh <path-to-tests-plan.md> <path-to-plan.md>
# Exit 0 = pass, exit 1 = validation failed, exit 2 = bad invocation.

set -u

TESTS_PLAN="${1:-}"
PLAN="${2:-}"
if [[ -z "$TESTS_PLAN" || -z "$PLAN" ]]; then
  echo "Usage: $0 <path-to-tests-plan.md> <path-to-plan.md>" >&2
  exit 2
fi
if [[ ! -f "$TESTS_PLAN" ]]; then
  echo "FAIL: tests-plan.md not found: $TESTS_PLAN" >&2
  exit 1
fi
if [[ ! -f "$PLAN" ]]; then
  echo "FAIL: plan.md not found: $PLAN" >&2
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

# 3. Every US-NNN referenced in plan.md must appear in the E2E coverage block.
story_ids=$(grep -oE 'US-[0-9]{3}' "$PLAN" | sort -u)

if [[ -z "$story_ids" ]]; then
  errors+=("plan.md: no US-NNN story references found")
else
  e2e_block=$(awk '
    /^## E2E coverage$/ {flag=1; next}
    /^## /              {flag=0}
    flag {print}
  ' "$TESTS_PLAN")

  while IFS= read -r sid; do
    [[ -z "$sid" ]] && continue
    if ! echo "$e2e_block" | grep -qE "(^|[^A-Za-z0-9])${sid}([^0-9]|$)"; then
      errors+=("E2E coverage missing for $sid (declared in plan.md)")
    fi
  done <<< "$story_ids"
fi

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $TESTS_PLAN covers every US-NNN from $PLAN"
  exit 0
fi

echo "FAIL: $TESTS_PLAN has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
