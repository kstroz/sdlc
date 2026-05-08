#!/usr/bin/env bash
# test-ralph-hook.sh — Smoke test for the ralph-loop stop hook.
#
# Exercises .claude/hooks/stop-hook.sh end-to-end without starting a real
# ralph-loop session. Two scenarios:
#   1. Continuation: assistant emitted ordinary output → hook should "block"
#      and feed the prompt back, incrementing iteration 1 → 2.
#   2. Completion: assistant emitted <promise>DONE</promise> → hook should
#      acknowledge completion and remove the state file.
#
# Usage:
#   bash scripts/test-ralph-hook.sh                  # auto-detect repo root
#   bash scripts/test-ralph-hook.sh /path/to/repo    # explicit repo root
#
# Exits 0 if all scenarios pass, 1 otherwise.

set -euo pipefail

# --- ANSI colors ----------------------------------------------------------
GREEN=$'\033[0;32m'
RED=$'\033[0;31m'
RESET=$'\033[0m'

pass() { printf '%sPASS%s %s\n' "$GREEN" "$RESET" "$1"; }
fail() { printf '%sFAIL%s %s\n' "$RED" "$RESET" "$1"; }

# --- Resolve repo root ----------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO="${1:-$DEFAULT_REPO}"

HOOK="$REPO/.claude/hooks/stop-hook.sh"
if [[ ! -f "$HOOK" ]]; then
  fail "stop-hook not found at: $HOOK"
  exit 1
fi

# --- Dependency check -----------------------------------------------------
if ! command -v jq >/dev/null 2>&1; then
  echo "SKIP: jq not found on PATH (the hook itself depends on jq)."
  exit 0
fi

# --- Temp workspace -------------------------------------------------------
TMP_BASE="$(mktemp -d)"
WORK="$TMP_BASE/ralph-hook-test-$$"
mkdir -p "$WORK/.claude"
cleanup() { rm -rf "$TMP_BASE"; }
trap cleanup EXIT

STATE_FILE="$WORK/.claude/ralph-loop.local.md"
TRANSCRIPT="$WORK/transcript.jsonl"

write_state() {
  local iteration="$1"
  cat > "$STATE_FILE" <<EOF
---
active: true
iteration: $iteration
session_id: test-session
max_iterations: 5
completion_promise: "DONE"
started_at: 2026-05-07T00:00:00Z
---
test prompt
EOF
}

write_transcript_text() {
  local text="$1"
  local content
  content=$(jq -c -n --arg t "$text" '[{type:"text",text:$t}]')
  jq -c -n --argjson c "$content" \
    '{role:"assistant",message:{role:"assistant",content:$c}}' \
    > "$TRANSCRIPT"
}

run_hook() {
  local stdin_json="$1"
  # Hook reads RALPH_STATE_FILE relative to CWD; cd into the temp workspace.
  ( cd "$WORK" && printf '%s' "$stdin_json" | bash "$HOOK" )
}

OVERALL=0

# =========================================================================
# Scenario 1 — Continuation
# =========================================================================
SCEN="scenario 1: continuation increments iteration and blocks exit"
write_state 1
write_transcript_text "hello world"

STDIN_JSON=$(jq -c -n \
  --arg sid "test-session" \
  --arg tp "$TRANSCRIPT" \
  '{session_id:$sid, transcript_path:$tp}')

set +e
OUT=$(run_hook "$STDIN_JSON")
RC=$?
set -e

ERRORS=()
[[ $RC -eq 0 ]] || ERRORS+=("exit code: expected 0, got $RC")

DECISION=$(printf '%s' "$OUT" | jq -r '.decision // ""' 2>/dev/null || echo "")
REASON=$(printf '%s' "$OUT" | jq -r '.reason // ""' 2>/dev/null || echo "")
[[ "$DECISION" == "block" ]] || ERRORS+=("decision: expected 'block', got '$DECISION'")
# State body is "test prompt" with a trailing newline from the heredoc.
case "$REASON" in
  "test prompt"|"test prompt"$'\n') ;;
  *) ERRORS+=("reason: expected 'test prompt' (with optional trailing newline), got: $(printf '%q' "$REASON")");;
esac

NEW_ITER=$(grep '^iteration:' "$STATE_FILE" 2>/dev/null | sed 's/iteration: *//' || echo "")
[[ "$NEW_ITER" == "2" ]] || ERRORS+=("iteration: expected '2' in state file, got '$NEW_ITER'")

if [[ ${#ERRORS[@]} -eq 0 ]]; then
  pass "$SCEN"
else
  fail "$SCEN"
  for e in "${ERRORS[@]}"; do printf '       - %s\n' "$e"; done
  printf '       --- stdout ---\n%s\n       --------------\n' "$OUT"
  OVERALL=1
fi

# =========================================================================
# Scenario 2 — Completion via <promise>DONE</promise>
# =========================================================================
SCEN="scenario 2: <promise>DONE</promise> completes loop and removes state"
write_state 1
write_transcript_text "All work is done. <promise>DONE</promise>"

set +e
OUT=$(run_hook "$STDIN_JSON")
RC=$?
set -e

ERRORS=()
[[ $RC -eq 0 ]] || ERRORS+=("exit code: expected 0, got $RC")

if ! printf '%s' "$OUT" | grep -q "Detected <promise>DONE</promise>"; then
  ERRORS+=("stdout missing completion message 'Detected <promise>DONE</promise>'")
fi

if [[ -e "$STATE_FILE" ]]; then
  ERRORS+=("state file should be removed but still exists at $STATE_FILE")
fi

if [[ ${#ERRORS[@]} -eq 0 ]]; then
  pass "$SCEN"
else
  fail "$SCEN"
  for e in "${ERRORS[@]}"; do printf '       - %s\n' "$e"; done
  printf '       --- stdout ---\n%s\n       --------------\n' "$OUT"
  OVERALL=1
fi

exit $OVERALL
