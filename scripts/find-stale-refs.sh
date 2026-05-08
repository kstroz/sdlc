#!/usr/bin/env bash
# Usage: bash scripts/find-stale-refs.sh
# Purpose: Scan repo for stale ID schemes (FR-NNN, J-NN) and legacy filenames replaced by the US-NNN / 02-spec/stories/ migration.

set -u

SCAN_PATHS=(".pipeline" "pipeline" ".claude" "app/src")
ROOT_GLOBS=("./*.md" "./*.txt" "./*.json" "./*.yml" "./*.yaml")

PATTERNS=(
  '\bFR-[0-9]{3}\b'
  '\bJ-[0-9]{2}\b'
  'functional-requirements\.md'
  'user-journeys\.md'
)

LABELS=(
  "FR-NNN (replaced by US-NNN)"
  "J-NN (replaced by US-NNN)"
  "functional-requirements.md (replaced by 02-spec/stories/)"
  "user-journeys.md (replaced by 02-spec/stories/)"
)

EXCLUDE_DIRS=(--exclude-dir=.git --exclude-dir=node_modules)
EXCLUDE_FILES=(--exclude=find-stale-refs.sh --exclude=*.stackdump)

total=0
exit_code=0

for i in "${!PATTERNS[@]}"; do
  pattern="${PATTERNS[$i]}"
  label="${LABELS[$i]}"
  echo "=== ${label} ==="

  matches=""
  for p in "${SCAN_PATHS[@]}"; do
    if [ -e "$p" ]; then
      out=$(grep -rEnH "${EXCLUDE_DIRS[@]}" "${EXCLUDE_FILES[@]}" "$pattern" "$p" 2>/dev/null || true)
      if [ -n "$out" ]; then
        matches="${matches}${out}"$'\n'
      fi
    fi
  done

  root_out=$(grep -EnH "${EXCLUDE_FILES[@]}" "$pattern" "${ROOT_GLOBS[@]}" 2>/dev/null || true)
  if [ -n "$root_out" ]; then
    matches="${matches}${root_out}"$'\n'
  fi

  matches="${matches%$'\n'}"

  if [ -z "$matches" ]; then
    echo "(none)"
  else
    echo "$matches"
    count=$(printf '%s\n' "$matches" | grep -c '')
    total=$((total + count))
    exit_code=1
  fi
  echo ""
done

echo "=== Summary ==="
echo "Total stale references found: ${total}"
exit "$exit_code"
