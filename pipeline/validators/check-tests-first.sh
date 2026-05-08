#!/usr/bin/env bash
# check-tests-first.sh — verify that test commits precede impl commits for done tasks.
#
# Usage: ./check-tests-first.sh <path-to-05-dev-dir> <path-to-repo>
# Exit 0 = pass, exit 1 = validation failed, exit 2 = bad invocation.
#
# For each tasks/T-NNN.md with Status: done, the script:
#   1. Reads "Files touched" entries.
#   2. Walks `git log --reverse --format=%H:%s -- <file>` for those paths.
#   3. Confirms a commit whose subject begins with `test(` or `tests:` precedes
#      every commit whose subject begins with `feat(` or `fix(`.
# Soft-warn if the subject convention is not detectable; hard-fail only if
# the task touches code files but has zero test files.

set -u

DIR="${1:-}"
REPO="${2:-}"
if [[ -z "$DIR" || -z "$REPO" ]]; then
  echo "Usage: $0 <path-to-05-dev-dir> <path-to-repo>" >&2
  exit 2
fi
if [[ ! -d "$DIR" ]]; then
  echo "FAIL: 05-dev directory not found: $DIR" >&2
  exit 1
fi
if [[ ! -d "$REPO/.git" && ! -f "$REPO/.git" ]]; then
  echo "FAIL: not a git repo: $REPO" >&2
  exit 1
fi

TASKS_DIR="$DIR/tasks"
if [[ ! -d "$TASKS_DIR" ]]; then
  echo "FAIL: tasks/ directory not found: $TASKS_DIR" >&2
  exit 1
fi

errors=()
warnings=()

# Helper: is path a test file?
is_test_path() {
  local p="$1"
  case "$p" in
    *.test.*|*.spec.*|*/__tests__/*|*/tests/*|*/test/*|*.e2e.*|*/e2e/*) return 0 ;;
    *) return 1 ;;
  esac
}

# Iterate done tasks.
for task_file in "$TASKS_DIR"/T-*.md; do
  [[ -e "$task_file" ]] || continue
  tid=$(basename "$task_file" .md)

  status=$(awk '
    /^## Status$/ {flag=1; next}
    /^## /        {flag=0}
    flag && NF    {print; exit}
  ' "$task_file" | tr -d '[:space:]')
  [[ "$status" != "done" ]] && continue

  # Extract files touched: bullets under "## Files touched" with `path` in backticks.
  files=$(awk '
    /^## Files touched$/ {flag=1; next}
    /^## /               {flag=0}
    flag
  ' "$task_file" | grep -oE '`[^`]+`' | tr -d '`')

  if [[ -z "$files" ]]; then
    warnings+=("$tid: no Files touched entries (or only literal 'none — non-code task')")
    continue
  fi

  has_test=0
  has_code=0
  while IFS= read -r p; do
    [[ -z "$p" ]] && continue
    if is_test_path "$p"; then
      has_test=1
    else
      has_code=1
    fi
  done <<< "$files"

  if (( has_code == 1 && has_test == 0 )); then
    errors+=("$tid: touches code paths but no test files listed")
    continue
  fi

  # Walk git log per file, look for test- vs impl-subject ordering.
  detected_pattern=0
  while IFS= read -r p; do
    [[ -z "$p" ]] && continue
    log=$(git -C "$REPO" log --reverse --format='%H:%s' -- "$p" 2>/dev/null || true)
    [[ -z "$log" ]] && continue

    first_test_idx=-1
    first_impl_idx=-1
    idx=0
    while IFS= read -r line; do
      subject="${line#*:}"
      case "$subject" in
        test\(*|tests:*|test:*)
          (( first_test_idx == -1 )) && first_test_idx=$idx
          detected_pattern=1
          ;;
        feat\(*|fix\(*|feat:*|fix:*)
          (( first_impl_idx == -1 )) && first_impl_idx=$idx
          detected_pattern=1
          ;;
      esac
      idx=$((idx + 1))
    done <<< "$log"

    if (( detected_pattern == 1 && first_impl_idx != -1 )); then
      if (( first_test_idx == -1 || first_test_idx > first_impl_idx )); then
        errors+=("$tid: impl commit precedes test commit for $p")
      fi
    fi
  done <<< "$files"

  if (( detected_pattern == 0 )); then
    warnings+=("$tid: commit-subject convention (test(/feat() not detected; cannot verify tests-first")
  fi
done

if (( ${#warnings[@]} > 0 )); then
  echo "WARN: ${#warnings[@]} advisory(ies):"
  for w in "${warnings[@]}"; do
    echo "  - $w"
  done
fi

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $DIR — tests-first ordering verified for all done tasks"
  exit 0
fi

echo "FAIL: $DIR has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
