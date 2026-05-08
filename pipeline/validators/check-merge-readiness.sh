#!/usr/bin/env bash
# check-merge-readiness.sh — verify stage 05 is ready to merge.
#
# Usage: ./check-merge-readiness.sh <path-to-05-dev-dir>
# Exit 0 = pass, exit 1 = validation failed, exit 2 = bad invocation.
#
# Aggregates: both approval files signed off, changelog references the ticket,
# all four quality reports pass, coverage mapping passes.

set -u

DIR="${1:-}"
if [[ -z "$DIR" ]]; then
  echo "Usage: $0 <path-to-05-dev-dir>" >&2
  exit 2
fi
if [[ ! -d "$DIR" ]]; then
  echo "FAIL: 05-dev directory not found: $DIR" >&2
  exit 1
fi

errors=()

# Resolve sibling paths: <branch>/.pipeline/05-dev/  →  <branch>/.pipeline/02-spec/
PIPELINE_ROOT=$(cd "$DIR/.." 2>/dev/null && pwd)
JOURNEYS="$PIPELINE_ROOT/02-spec/user-journeys.md"
TESTS_PLAN="$DIR/tests-plan.md"
QUALITY_DIR="$DIR/quality-reports"
CHANGELOG="$DIR/changelog.md"
APPROVAL_PLAN="$DIR/_approval-plan.json"
APPROVAL_MERGE="$DIR/_approval-merge.json"

# 1. Both approval files exist and have decision: approved.
check_approval() {
  local path="$1"
  local label="$2"
  if [[ ! -f "$path" ]]; then
    errors+=("$label: file missing: $(basename "$path")")
    return
  fi
  # Match decision: "approved" or "decision":"approved" (with optional whitespace).
  if ! grep -qE '"decision"[[:space:]]*:[[:space:]]*"approved"' "$path"; then
    errors+=("$label: decision is not 'approved' in $(basename "$path")")
  fi
}
check_approval "$APPROVAL_PLAN"  "plan approval"
check_approval "$APPROVAL_MERGE" "merge approval"

# 2. Changelog exists and references the ticket from plan.md frontmatter.
if [[ ! -f "$CHANGELOG" ]]; then
  errors+=("changelog: $(basename "$CHANGELOG") missing")
else
  PLAN="$DIR/plan.md"
  if [[ -f "$PLAN" ]]; then
    ticket=$(awk '/^---$/{n++;next} n==1' "$PLAN" | awk -F': *' '/^jira:/{print $2; exit}' | tr -d '[:space:]')
    if [[ -n "$ticket" ]]; then
      if ! grep -qF "$ticket" "$CHANGELOG"; then
        errors+=("changelog: does not mention ticket '$ticket' from plan.md")
      fi
    else
      errors+=("plan.md: missing 'jira:' frontmatter — cannot cross-check changelog ticket")
    fi
  else
    errors+=("plan.md missing — cannot determine current ticket")
  fi
fi

# 3. Quality reports — delegate to check-quality-thresholds.sh if available, else inline.
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
QT="$SCRIPT_DIR/check-quality-thresholds.sh"
if [[ -x "$QT" ]]; then
  if ! "$QT" "$QUALITY_DIR" >/dev/null 2>&1; then
    errors+=("quality-reports: check-quality-thresholds.sh failed against $QUALITY_DIR")
  fi
else
  if [[ ! -d "$QUALITY_DIR" ]]; then
    errors+=("quality-reports: directory missing")
  fi
fi

# 4. Coverage mapping — delegate to check-coverage-mapping.sh if available.
CM="$SCRIPT_DIR/check-coverage-mapping.sh"
if [[ -x "$CM" ]]; then
  if [[ -f "$TESTS_PLAN" && -f "$JOURNEYS" ]]; then
    if ! "$CM" "$TESTS_PLAN" "$JOURNEYS" >/dev/null 2>&1; then
      errors+=("coverage mapping: check-coverage-mapping.sh failed")
    fi
  else
    [[ -f "$TESTS_PLAN" ]] || errors+=("tests-plan.md missing")
    [[ -f "$JOURNEYS" ]]   || errors+=("user-journeys.md missing at $JOURNEYS")
  fi
fi

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $DIR is ready to merge"
  exit 0
fi

echo "FAIL: $DIR has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
