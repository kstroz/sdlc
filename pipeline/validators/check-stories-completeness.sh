#!/usr/bin/env bash
# check-stories-completeness.sh — validate every US-NNN referenced in plan.md
# has a corresponding story file under 02-spec/stories/.
#
# Closes the gap between check-spec.sh (which only checks US-NNN listed in the
# prd.md epics table) and check-plan.sh (which checks each task references some
# US-NNN, but not that the story file exists).
#
# Usage: ./check-stories-completeness.sh <path-to-plan.md> <path-to-stories-dir>
# Run with: bash pipeline/validators/check-stories-completeness.sh \
#               .pipeline/05-dev/plan.md .pipeline/02-spec/stories
# Exit 0 = pass, exit 1 = validation failed, exit 2 = bad invocation.

set -u

PLAN="${1:-}"
STORIES_DIR="${2:-}"

if [[ -z "$PLAN" || -z "$STORIES_DIR" ]]; then
  echo "Usage: $0 <path-to-plan.md> <path-to-stories-dir>" >&2
  exit 2
fi

if [[ ! -f "$PLAN" ]]; then
  echo "FAIL: plan.md not found: $PLAN" >&2
  exit 1
fi

if [[ ! -d "$STORIES_DIR" ]]; then
  echo "FAIL: stories directory not found: $STORIES_DIR" >&2
  exit 1
fi

errors=()

# Collect every unique US-NNN referenced anywhere in plan.md.
story_ids=$(grep -oE 'US-[0-9]{3}' "$PLAN" | sort -u)

if [[ -z "$story_ids" ]]; then
  echo "PASS: $PLAN references no US-NNN IDs (nothing to verify)"
  exit 0
fi

# For each ID, accept either stories/<US-NNN>.md or stories/<US-NNN>-*.md.
while IFS= read -r sid; do
  [[ -z "$sid" ]] && continue
  exact_file="$STORIES_DIR/${sid}.md"
  slug_file=$(find "$STORIES_DIR" -maxdepth 1 -name "${sid}-*.md" 2>/dev/null | head -1)
  if [[ ! -f "$exact_file" && -z "$slug_file" ]]; then
    errors+=("$sid: no story file found — expected: stories/${sid}-<slug>.md")
  fi
done <<< "$story_ids"

if (( ${#errors[@]} == 0 )); then
  echo "PASS: every US-NNN in $PLAN has a story file in $STORIES_DIR"
  exit 0
fi

echo "FAIL: $PLAN has ${#errors[@]} missing story file(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
