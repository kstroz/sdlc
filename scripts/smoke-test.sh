#!/usr/bin/env bash
# smoke-test.sh — End-to-end smoke test for the SDLC pipeline repo.
#
# Usage:
#   bash scripts/smoke-test.sh
#
# What it does:
#   1. Verifies it's running from the repo root (or cd's to `git rev-parse --show-toplevel`).
#   2. Runs every pipeline validator in pipeline/validators/, capturing PASS/FAIL/SKIP.
#      A validator is SKIPped (not FAILed) when its target artifact is missing —
#      useful on partially-completed branches (e.g. before Stage 05.2 produces tests-plan.md).
#   3. Optionally runs check-stories-completeness.sh if it exists.
#   4. Runs the app smoke checks: `npm test --silent`, `npm run typecheck`, `npm run lint`
#      from app/. SKIPs all three if app/ or app/node_modules/ is missing.
#   5. Prints a summary with PASS/FAIL/SKIP counts and an OVERALL line.
#
# Exit codes:
#   0 — zero FAILs (SKIPs are fine).
#   1 — one or more FAILs.

set -uo pipefail

# ---------------------------------------------------------------------------
# Locate repo root
# ---------------------------------------------------------------------------
if [[ "$(basename "$(pwd)")" != "sdlc" ]]; then
  if root="$(git rev-parse --show-toplevel 2>/dev/null)"; then
    cd "$root" || { echo "Cannot cd to repo root: $root" >&2; exit 1; }
  else
    echo "smoke-test.sh: not in 'sdlc' and not inside a git repo. Aborting." >&2
    exit 1
  fi
fi

# ---------------------------------------------------------------------------
# Colours (TTY only)
# ---------------------------------------------------------------------------
if [ -t 1 ]; then
  C_GREEN=$'\033[32m'
  C_RED=$'\033[31m'
  C_YELLOW=$'\033[33m'
  C_BOLD=$'\033[1m'
  C_RESET=$'\033[0m'
else
  C_GREEN=""; C_RED=""; C_YELLOW=""; C_BOLD=""; C_RESET=""
fi

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
FAILED_NAMES=()

mark_pass() { PASS_COUNT=$((PASS_COUNT+1)); echo "${C_GREEN}PASS${C_RESET}: $1"; }
mark_fail() { FAIL_COUNT=$((FAIL_COUNT+1)); FAILED_NAMES+=("$1"); echo "${C_RED}FAIL${C_RESET}: $1"; }
mark_skip() { SKIP_COUNT=$((SKIP_COUNT+1)); echo "${C_YELLOW}SKIP${C_RESET}: $1 ($2)"; }

# ---------------------------------------------------------------------------
# Run a validator. Args: <name> <input-path-to-check> <command...>
# If the input path is missing, mark SKIP. Otherwise run, treating exit 0 as PASS.
# ---------------------------------------------------------------------------
run_validator() {
  local name="$1"
  local input="$2"
  shift 2
  echo
  echo "${C_BOLD}=== ${name} ===${C_RESET}"
  if [[ ! -e "$input" ]]; then
    mark_skip "$name" "missing: $input"
    return
  fi
  local output rc
  output="$("$@" 2>&1)"
  rc=$?
  echo "$output"
  if [[ $rc -eq 0 ]]; then
    mark_pass "$name"
  elif [[ $rc -eq 1 ]] && grep -qiE "file not found|no such file|not found" <<<"$output"; then
    mark_skip "$name" "artifact not found per validator"
  else
    mark_fail "$name"
  fi
}

# ---------------------------------------------------------------------------
# Validators
# ---------------------------------------------------------------------------
run_validator "check-product"           "PRODUCT.md"                            bash pipeline/validators/check-product.sh PRODUCT.md
run_validator "check-idea"              ".pipeline/01-idea/idea.md"             bash pipeline/validators/check-idea.sh .pipeline/01-idea/idea.md
run_validator "check-spec"              ".pipeline/02-spec"                     bash pipeline/validators/check-spec.sh .pipeline/02-spec
run_validator "check-arch"              ".pipeline/04-architecture"             bash pipeline/validators/check-arch.sh .pipeline/04-architecture
run_validator "check-plan"              ".pipeline/05-dev/plan.md"              bash pipeline/validators/check-plan.sh .pipeline/05-dev/plan.md
run_validator "check-coverage-mapping"  ".pipeline/05-dev/tests-plan.md"        bash pipeline/validators/check-coverage-mapping.sh .pipeline/05-dev/tests-plan.md .pipeline/05-dev/plan.md
run_validator "check-tests-first"       ".pipeline/05-dev"                      bash pipeline/validators/check-tests-first.sh .pipeline/05-dev .
run_validator "check-quality-thresholds" ".pipeline/05-dev/quality-reports"     bash pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports
run_validator "check-merge-readiness"   ".pipeline/05-dev"                      bash pipeline/validators/check-merge-readiness.sh .pipeline/05-dev
run_validator "check-traceability"      ".pipeline"                             bash pipeline/validators/check-traceability.sh .pipeline

# Optional validator
if [[ -f "pipeline/validators/check-stories-completeness.sh" ]]; then
  run_validator "check-stories-completeness" ".pipeline/05-dev/plan.md" \
    bash pipeline/validators/check-stories-completeness.sh .pipeline/05-dev/plan.md .pipeline/02-spec/stories
fi

# ---------------------------------------------------------------------------
# App smoke checks
# ---------------------------------------------------------------------------
echo
echo "${C_BOLD}=== app smoke checks ===${C_RESET}"
if [[ ! -d "app" ]]; then
  mark_skip "app:test"      "app/ missing"
  mark_skip "app:typecheck" "app/ missing"
  mark_skip "app:lint"      "app/ missing — run 05.0 bootstrap"
elif [[ ! -d "app/node_modules" ]]; then
  mark_skip "app:test"      "app/node_modules missing — run 'npm install' in app/"
  mark_skip "app:typecheck" "app/node_modules missing — run 'npm install' in app/"
  mark_skip "app:lint"      "app/node_modules missing — run 'npm install' in app/"
else
  run_app_check() {
    local name="$1"; shift
    echo
    echo "${C_BOLD}--- ${name} ---${C_RESET}"
    ( cd app && "$@" )
    local rc=$?
    if [[ $rc -eq 0 ]]; then mark_pass "$name"; else mark_fail "$name"; fi
  }
  run_app_check "app:test"      npm test --silent
  run_app_check "app:typecheck" npm run typecheck
  run_app_check "app:lint"      npm run lint
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo
echo "${C_BOLD}=== Summary ===${C_RESET}"
echo "  ${C_GREEN}PASS${C_RESET}: ${PASS_COUNT}"
echo "  ${C_RED}FAIL${C_RESET}: ${FAIL_COUNT}"
echo "  ${C_YELLOW}SKIP${C_RESET}: ${SKIP_COUNT}"

if [[ ${FAIL_COUNT} -gt 0 ]]; then
  echo "  Failed checks:"
  for n in "${FAILED_NAMES[@]}"; do
    echo "    - $n"
  done
  echo "${C_BOLD}OVERALL: ${C_RED}FAIL${C_RESET} (${FAIL_COUNT})"
  exit 1
else
  echo "${C_BOLD}OVERALL: ${C_GREEN}PASS${C_RESET}"
  exit 0
fi
