#!/usr/bin/env bash
# check-spec.sh — validate stage 02 specification artifacts against conventions/02-spec/*.md
#
# Usage: ./check-spec.sh <path-to-02-spec-dir>
# Exit 0 = pass, exit 1 = validation failed, exit 2 = bad invocation.

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

errors=()
advisories=()

# Required files at the gate.
required_files=(
  "glossary.md"
  "personas.md"
  "jobs-to-be-done.md"
  "user-journeys.md"
  "functional-requirements.md"
  "non-functional-requirements.md"
)

for f in "${required_files[@]}"; do
  if [[ ! -f "$DIR/$f" ]]; then
    errors+=("missing required file: $f")
  fi
done

# Frontmatter check: opening line must be ---.
for f in "${required_files[@]}"; do
  path="$DIR/$f"
  [[ -f "$path" ]] || continue
  if ! head -n1 "$path" | grep -qx -- '---'; then
    errors+=("$f: missing opening frontmatter line '---'")
  fi
done

# Personas: every P-NN block must link to ≥ 1 JTBD-NN somewhere in its block.
personas_path="$DIR/personas.md"
if [[ -f "$personas_path" ]]; then
  persona_ids=$(grep -oE '^## P-[0-9]{2}' "$personas_path" | awk '{print $2}')
  if [[ -z "$persona_ids" ]]; then
    errors+=("personas.md: no persona headings matching '## P-NN'")
  else
    while IFS= read -r pid; do
      [[ -z "$pid" ]] && continue
      block=$(awk -v id="## $pid" '
        $0 ~ "^"id"( |$)" {flag=1; next}
        /^## / {flag=0}
        flag {print}
      ' "$personas_path")
      if ! echo "$block" | grep -qE 'JTBD-[0-9]+'; then
        errors+=("personas.md: $pid has no JTBD-NN link")
      fi
    done <<< "$persona_ids"
  fi
fi

# Journeys: every J-NN block must link to ≥ 1 P-NN.
journeys_path="$DIR/user-journeys.md"
if [[ -f "$journeys_path" ]]; then
  journey_ids=$(grep -oE '^## J-[0-9]{2}' "$journeys_path" | awk '{print $2}')
  if [[ -z "$journey_ids" ]]; then
    errors+=("user-journeys.md: no journey headings matching '## J-NN'")
  else
    while IFS= read -r jid; do
      [[ -z "$jid" ]] && continue
      block=$(awk -v id="## $jid" '
        $0 ~ "^"id"( |$)" {flag=1; next}
        /^## / {flag=0}
        flag {print}
      ' "$journeys_path")
      if ! echo "$block" | grep -qE 'P-[0-9]{2}'; then
        errors+=("user-journeys.md: $jid has no P-NN link")
      fi
    done <<< "$journey_ids"
  fi
fi

# FRs: every line starting with FR- (in headings or refs) — we look at FR headings
# and require each block to reference a J-NN ID.
fr_path="$DIR/functional-requirements.md"
if [[ -f "$fr_path" ]]; then
  fr_ids=$(grep -oE '^## FR-[0-9]{3}' "$fr_path" | awk '{print $2}')
  if [[ -z "$fr_ids" ]]; then
    errors+=("functional-requirements.md: no FR headings matching '## FR-NNN'")
  else
    while IFS= read -r fid; do
      [[ -z "$fid" ]] && continue
      block=$(awk -v id="## $fid" '
        $0 ~ "^"id"( |$)" {flag=1; next}
        /^## / {flag=0}
        flag {print}
      ' "$fr_path")
      if ! echo "$block" | grep -qE 'J-[0-9]{2}'; then
        errors+=("functional-requirements.md: $fid has no J-NN journey link")
      fi
    done <<< "$fr_ids"
  fi
fi

# Glossary coverage (advisory): pull capitalized words from personas/journeys/FRs and
# warn for any not present in glossary.md as a `## Term` heading.
glossary_path="$DIR/glossary.md"
if [[ -f "$glossary_path" ]]; then
  glossary_terms=$(grep -E '^## ' "$glossary_path" | sed -E 's/^## //; s/ *$//' | tr '[:upper:]' '[:lower:]')

  collect_capitalized() {
    local file="$1"
    [[ -f "$file" ]] || return 0
    grep -oE '\b[A-Z][a-zA-Z]{3,}\b' "$file" \
      | sort -u \
      | tr '[:upper:]' '[:lower:]'
  }

  cap_words=$( {
    collect_capitalized "$personas_path"
    collect_capitalized "$journeys_path"
    collect_capitalized "$fr_path"
  } | sort -u )

  # Common English / structural words to ignore (lowercased).
  ignore_words=" given when then must should could none pending tbd as a so that the and or for with role context goals frustrations quote priority statement source trigger steps success alternate paths persona personas journey journeys requirement requirements high medium low jtbd-tbd "

  while IFS= read -r w; do
    [[ -z "$w" ]] && continue
    if [[ "$ignore_words" == *" $w "* ]]; then
      continue
    fi
    if echo "$glossary_terms" | grep -qxF "$w"; then
      continue
    fi
    advisories+=("glossary coverage: '$w' used in personas/journeys/requirements but not in glossary.md")
  done <<< "$cap_words"
fi

# Print advisories (do not fail the gate on these).
if (( ${#advisories[@]} > 0 )); then
  echo "ADVISORY: ${#advisories[@]} glossary coverage hint(s):"
  for a in "${advisories[@]}"; do
    echo "  - $a"
  done
fi

if (( ${#errors[@]} == 0 )); then
  echo "PASS: $DIR conforms to stage 02 conventions"
  exit 0
fi

echo "FAIL: $DIR has ${#errors[@]} issue(s):"
for e in "${errors[@]}"; do
  echo "  - $e"
done
exit 1
