#!/usr/bin/env bash
# check-spec.sh — validate stage 02 artifacts against conventions/02-spec/
#
# Validates prd.md (feature brief) and all story files under stories/.
#
# Usage: ./check-spec.sh <path-to-02-spec-dir>
# Exit 0 = pass, exit 1 = fail, exit 2 = bad invocation.

set -u

DIR="${1:-}"
if [[ -z "$DIR" ]]; then
  echo "Usage: $0 <path-to-02-spec-dir>" >&2
  exit 2
fi
if [[ ! -d "$DIR" ]]; then
  echo "FAIL: directory not found: $DIR" >&2
  exit 1
fi

PRD="$DIR/prd.md"
STORIES_DIR="$DIR/stories"
errors=()

# ── prd.md ────────────────────────────────────────────────────────────────────

if [[ ! -f "$PRD" ]]; then
  errors+=("missing required file: prd.md")
else
  check_prd() {
    local label="$1" cmd="$2"
    if ! eval "$cmd" >/dev/null 2>&1; then
      errors+=("prd.md: $label")
    fi
  }

  check_prd "frontmatter missing opening ---"  "head -n1 \"$PRD\" | grep -qx -- '---'"
  check_prd "frontmatter missing 'id:'"        "awk '/^---$/{n++;next} n==1' \"$PRD\" | grep -qE '^id:'"
  check_prd "frontmatter missing 'jira:'"      "awk '/^---$/{n++;next} n==1' \"$PRD\" | grep -qE '^jira:'"
  check_prd "frontmatter missing 'created:'"   "awk '/^---$/{n++;next} n==1' \"$PRD\" | grep -qE '^created:'"
  check_prd "frontmatter missing 'version:'"   "awk '/^---$/{n++;next} n==1' \"$PRD\" | grep -qE '^version:'"

  check_prd "missing section: ## Overview"                    "grep -qxF '## Overview' \"$PRD\""
  check_prd "missing section: ## Epics"                       "grep -qxF '## Epics' \"$PRD\""
  check_prd "missing section: ## Non-functional requirements" "grep -qxF '## Non-functional requirements' \"$PRD\""
  check_prd "missing section: ## Out of scope"                "grep -qxF '## Out of scope' \"$PRD\""

  # Overview must link to an idea ID.
  overview_block=$(awk '/^## Overview$/{flag=1;next} /^## /{flag=0} flag' "$PRD")
  if ! echo "$overview_block" | grep -qE 'I-[0-9]+'; then
    errors+=("prd.md: overview must link to idea ID matching I-[0-9]+")
  fi

  # Epics table: at least 1 data row.
  epics_block=$(awk '/^## Epics$/{flag=1;next} /^## /{flag=0} flag' "$PRD")
  epic_rows=$(echo "$epics_block" | grep -E '^\| E-[0-9]{2}' | wc -l | tr -d ' ')
  if (( epic_rows < 1 )); then
    errors+=("prd.md: epics table must have at least 1 E-NN row")
  fi

  # Every US-NNN referenced in epics table must have a story file.
  story_ids_in_prd=$(echo "$epics_block" | grep -oE 'US-[0-9]{3}' | sort -u)
  while IFS= read -r sid; do
    [[ -z "$sid" ]] && continue
    slug_file=$(find "$STORIES_DIR" -maxdepth 1 -name "${sid}-*.md" 2>/dev/null | head -1)
    exact_file="$STORIES_DIR/${sid}.md"
    if [[ -z "$slug_file" && ! -f "$exact_file" ]]; then
      errors+=("prd.md: story $sid referenced in epics table has no file in stories/")
    fi
  done <<< "$story_ids_in_prd"

  # NFR table: at least 3 data rows with numeric values.
  nfr_block=$(awk '/^## Non-functional requirements$/{flag=1;next} /^## /{flag=0} flag' "$PRD")
  nfr_data=$(echo "$nfr_block" | grep -E '^\|' | grep -v '^|[-| ]*|$' | grep -v 'ID.*Category' | grep -E '[0-9]' | wc -l | tr -d ' ')
  if (( nfr_data < 3 )); then
    errors+=("prd.md: non-functional requirements needs ≥ 3 rows with numeric targets, found $nfr_data")
  fi

  # Out of scope: at least 1 bullet.
  oos_block=$(awk '/^## Out of scope$/{flag=1;next} /^## /{flag=0} flag' "$PRD")
  if ! echo "$oos_block" | grep -qE '^- '; then
    errors+=("prd.md: out of scope needs at least 1 bullet item")
  fi
fi

# ── stories/ ──────────────────────────────────────────────────────────────────

if [[ ! -d "$STORIES_DIR" ]]; then
  errors+=("missing required directory: stories/")
else
  story_files=$(find "$STORIES_DIR" -maxdepth 1 -name 'US-*.md' | sort)
  story_count=$(echo "$story_files" | grep -c 'US-' || true)

  if (( story_count < 1 )); then
    errors+=("stories/: no US-NNN-*.md files found")
  fi

  while IFS= read -r sf; do
    [[ -z "$sf" ]] && continue
    base=$(basename "$sf")

    check_story() {
      local label="$1" cmd="$2"
      if ! eval "$cmd" >/dev/null 2>&1; then
        errors+=("$base: $label")
      fi
    }

    check_story "frontmatter missing opening ---"  "head -n1 \"$sf\" | grep -qx -- '---'"
    check_story "frontmatter missing 'id:'"        "awk '/^---$/{n++;next} n==1' \"$sf\" | grep -qE '^id:'"
    check_story "frontmatter missing 'epic:'"      "awk '/^---$/{n++;next} n==1' \"$sf\" | grep -qE '^epic:'"
    check_story "frontmatter missing 'priority:'"  "awk '/^---$/{n++;next} n==1' \"$sf\" | grep -qE '^priority:'"
    check_story "frontmatter missing 'status:'"    "awk '/^---$/{n++;next} n==1' \"$sf\" | grep -qE '^status:'"

    # priority must be MUST, SHOULD, or COULD.
    priority=$(awk '/^---$/{n++;next} n==1 && /^priority:/' "$sf" | sed 's/priority: *//')
    if [[ "$priority" != "MUST" && "$priority" != "SHOULD" && "$priority" != "COULD" ]]; then
      errors+=("$base: priority must be MUST, SHOULD, or COULD — got '$priority'")
    fi

    # status must be todo, in-progress, or done.
    status=$(awk '/^---$/{n++;next} n==1 && /^status:/' "$sf" | sed 's/status: *//')
    if [[ "$status" != "todo" && "$status" != "in-progress" && "$status" != "done" ]]; then
      errors+=("$base: status must be todo, in-progress, or done — got '$status'")
    fi

    # Statement section: required phrases.
    stmt_block=$(awk '/^## Statement$/{flag=1;next} /^## /{flag=0} flag' "$sf")
    for phrase in "As a" "I want to" "so that"; do
      if ! echo "$stmt_block" | grep -qiF "$phrase"; then
        errors+=("$base: statement missing required phrase '$phrase'")
      fi
    done

    # Acceptance criteria: at least 1 Given/when/then bullet.
    ac_block=$(awk '/^## Acceptance criteria$/{flag=1;next} /^## /{flag=0} flag' "$sf")
    if ! echo "$ac_block" | grep -qiE 'given'; then
      errors+=("$base: acceptance criteria missing 'Given' — use Given/when/then format")
    fi

    # Source: must reference _inputs/.
    src_block=$(awk '/^## Source$/{flag=1;next} /^## /{flag=0} flag' "$sf")
    if ! echo "$src_block" | grep -qE '_inputs/'; then
      errors+=("$base: source section missing _inputs/ reference")
    fi

    # epic field must reference an E-NN that exists in prd.md.
    epic_val=$(awk '/^---$/{n++;next} n==1 && /^epic:/' "$sf" | sed 's/epic: *//')
    if [[ -f "$PRD" ]] && ! grep -qF "$epic_val" "$PRD"; then
      errors+=("$base: epic '$epic_val' not found in prd.md epics table")
    fi

  done <<< "$story_files"
fi

# ── result ────────────────────────────────────────────────────────────────────

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $DIR conforms to stage 02 conventions"
  exit 0
fi

echo "FAIL: $DIR has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
