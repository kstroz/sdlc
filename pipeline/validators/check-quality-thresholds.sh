#!/usr/bin/env bash
# check-quality-thresholds.sh — verify the four quality reports exist and pass.
#
# Usage: ./check-quality-thresholds.sh <path-to-05-dev/quality-reports>
# Exit 0 = pass, exit 1 = validation failed, exit 2 = bad invocation.
#
# Hard-fail if any report contains a line starting with 'FAIL:'.
# Soft-warn (still exit 0) if any report contains a line starting with 'WARN:'.

set -u

DIR="${1:-}"
if [[ -z "$DIR" ]]; then
  echo "Usage: $0 <path-to-05-dev/quality-reports>" >&2
  exit 2
fi
if [[ ! -d "$DIR" ]]; then
  echo "FAIL: directory not found: $DIR" >&2
  exit 1
fi

required_reports=(
  "modularity.md"
  "ui-logic-separation.md"
  "user-dead-ends.md"
  "logic-gaps.md"
)

errors=()
warnings=()
total_fail=0
total_warn=0

for r in "${required_reports[@]}"; do
  path="$DIR/$r"
  if [[ ! -f "$path" ]]; then
    errors+=("missing required report: $r")
    continue
  fi
  fail_count=$(grep -cE '^FAIL:' "$path" || true)
  warn_count=$(grep -cE '^WARN:' "$path" || true)
  total_fail=$(( total_fail + fail_count ))
  total_warn=$(( total_warn + warn_count ))
  if (( fail_count > 0 )); then
    errors+=("$r: $fail_count FAIL line(s)")
  fi
  if (( warn_count > 0 )); then
    warnings+=("$r: $warn_count WARN line(s)")
  fi
done

if (( ${#warnings[@]} > 0 )); then
  echo "WARN: ${#warnings[@]} advisory(ies); total WARN lines: $total_warn"
  for w in "${warnings[@]}"; do
    echo "  - $w"
  done
fi

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $DIR — all four quality reports present, 0 FAIL lines"
  exit 0
fi

echo "FAIL: $DIR has ${#errors[@]} issue(s); total FAIL lines: $total_fail"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
