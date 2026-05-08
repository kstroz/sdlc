#!/usr/bin/env bash
# check-plan.sh — validate stage 05.1 plan.md against conventions/05-dev/plan-template.md
#
# Usage: ./check-plan.sh <path-to-05-dev/plan.md>
# Exit 0 = pass, exit 1 = validation failed, exit 2 = bad invocation.

set -u

FILE="${1:-}"
if [[ -z "$FILE" ]]; then
  echo "Usage: $0 <path-to-05-dev/plan.md>" >&2
  exit 2
fi
if [[ ! -f "$FILE" ]]; then
  echo "FAIL: file not found: $FILE" >&2
  exit 1
fi

DIR=$(dirname "$FILE")
TASKS_DIR="$DIR/tasks"
errors=()

# 1. Frontmatter present with required keys.
if ! head -n1 "$FILE" | grep -qx -- '---'; then
  errors+=("frontmatter: missing opening '---'")
fi
fm_block=$(awk '/^---$/{n++;next} n==1' "$FILE")
for key in id jira created version; do
  if ! echo "$fm_block" | grep -qE "^${key}:"; then
    errors+=("frontmatter: missing '${key}:'")
  fi
done

# 2. Required top-level sections.
required_sections=(
  "## Scope summary"
  "## Tasks"
  "## Out-of-plan"
)
for section in "${required_sections[@]}"; do
  if ! grep -qxF "$section" "$FILE"; then
    errors+=("missing section: $section")
  fi
done

# 3. Collect task IDs from H3 headings: ### T-NNN — <label>
task_ids=$(grep -oE '^### T-[0-9]{3}' "$FILE" | awk '{print $2}')
if [[ -z "$task_ids" ]]; then
  errors+=("tasks: no '### T-NNN' headings found")
fi

# 4. For each task, validate required fields and detail link.
while IFS= read -r tid; do
  [[ -z "$tid" ]] && continue
  block=$(awk -v id="### $tid" '
    $0 ~ "^"id"( |$)" {flag=1; next}
    /^### / {flag=0}
    /^## /  {flag=0}
    flag {print}
  ' "$FILE")

  if ! echo "$block" | grep -qE 'US-[0-9]{3}'; then
    errors+=("$tid: no US-NNN reference in Stories")
  fi
  if ! echo "$block" | grep -qE '(\*\*Files touched\*\*|^- \*\*Files touched\*\*)'; then
    errors+=("$tid: missing 'Files touched' field")
  fi
  if ! echo "$block" | grep -qE '(\*\*Acceptance\*\*|^- \*\*Acceptance\*\*)'; then
    errors+=("$tid: missing 'Acceptance' field")
  fi

  # Detail file must exist on disk.
  detail="$TASKS_DIR/${tid}.md"
  if [[ ! -f "$detail" ]]; then
    errors+=("$tid: detail file missing: tasks/${tid}.md")
  fi
done <<< "$task_ids"

# 5. Reverse check: every tasks/T-NNN.md must be referenced from plan.md.
if [[ -d "$TASKS_DIR" ]]; then
  for f in "$TASKS_DIR"/T-*.md; do
    [[ -e "$f" ]] || continue
    base=$(basename "$f" .md)
    if ! echo "$task_ids" | grep -qxF "$base"; then
      errors+=("orphan task file: tasks/${base}.md not referenced by plan.md")
    fi
  done
fi

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $FILE conforms to plan-template.md"
  exit 0
fi

echo "FAIL: $FILE has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
