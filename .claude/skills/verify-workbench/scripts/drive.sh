#!/usr/bin/env bash
# Run ONE Cypress spec against the run's stack and keep the evidence. The only way this skill runs Cypress.
# Usage: drive.sh <spec> [--run-id ID] [--headed] [--timeout SECONDS] [--stall SECONDS] [--allow-flaky]
#                 [--retries N] [--repeat N]
#   spec: exactly one file, either
#     - a verify spec (.claude/skills/verify-workbench/specs/, or your own anywhere): copied next to
#       verify-support.js and run with the base cypress.config.js, or
#     - an existing spec of the run's tree (e2e-tests/e2e-legacy|e2e-security|...): run in place with the
#       config of its directory (e2e-legacy/guides -> cypress-guides, e2e-legacy -> cypress-legacy,
#       e2e-security -> cypress-security, e2e-flaky -> cypress-flaky).
#   Both: no video, baseUrl = the run's stack (container run: that tree's Cypress and specs).
#   --retries   Cypress test retries (default 0). CI runs with 2: a test red here but green in CI may be a flake.
#   --repeat    run the spec N times in a row (flake hunting); evidence per iteration in <spec-name>/iter-<i>/.
#               Prints `repeat: P/N passed` at the end; exit 0 only if every iteration passed.
#   --timeout   hard cap per run (default 600) -> exit 124.
#   --stall     kill the run after this many seconds without new output (default 120) -> exit 125.
#               A silent run is a hung run (missing license, endless polling); report it, do not wait.
#   --allow-flaky  e2e-flaky/ specs are refused without it.
#   Empties the tree's e2e-tests/cypress/downloads first (with another Cypress run on that tree active: only
#   files older than 2 minutes), so a download check cannot pass on a file an earlier run left behind.
#   Security: a spec that leaves GraphDB security ON (e2e-security specs) is detected after the run; on a
#   container stack drive.sh switches it off again (admin/root), on the dev stack it reports FAIL.
#   Prints progress (spec start, each passed/failed test, totals) while it runs; the full log is cypress.log.
#   Run it in the background (run_in_background, Monitor) and read its output: piped into `tail`, the progress
#   lines arrive only at the end.
#   Last stdout line: the evidence directory.
# Exit code = Cypress exit code, or 124/125 as above; 64 bad usage or a refused spec (e2e-flaky without
# --allow-flaky, a spec of another checkout), 65 context-path stack refused (its Steps intercept absolute paths
# that never match under the prefix: drive it with pw.sh + check-paths.sh), 66 no such spec file,
# 69 Cypress not installed in the run's tree.
set -uo pipefail
source "$(dirname "$0")/env.sh"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

SPEC="${1:?usage: drive.sh <spec> [--run-id ID] [--headed] [--timeout S] [--stall S] [--allow-flaky] [--retries N] [--repeat N]}"; shift
RUN_ID="$(date +%Y%m%d-%H%M%S)"
TIMEOUT=600
STALL=120
FLAKY=0
RETRIES=0
REPEAT=1
HEADED=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-id) RUN_ID="$2"; shift 2 ;;
    --headed) HEADED=(--headed); shift ;;
    --timeout) TIMEOUT="$2"; shift 2 ;;
    --stall) STALL="$2"; shift 2 ;;
    --allow-flaky) FLAKY=1; shift ;;
    --retries) RETRIES="${2:-}"; [[ "$RETRIES" =~ ^[0-9]+$ ]] || { echo "--retries needs a number" >&2; exit 64; }; shift 2 ;;
    --repeat) REPEAT="${2:-}"; [[ "$REPEAT" =~ ^[1-9][0-9]*$ ]] || { echo "--repeat needs a number >= 1" >&2; exit 64; }; shift 2 ;;
    *) echo "unknown arg $1" >&2; exit 64 ;;
  esac
done
[[ -f "$SPEC" ]] || { echo "no such spec file: $SPEC (one spec file, never a directory or a whole suite)" >&2; exit 66; }
SPEC="$(realpath "$SPEC")"
load_run "$RUN_ID"   # container run: drive its stack with the Cypress of its own tree
# The repo's Steps/commands intercept absolute paths (cy.intercept('/rest/locations')), which never match
# under a context path: a Cypress run there hangs or fails on the harness, not on the app. Use pw.sh.
if [[ "$WB_URL" =~ ^https?://[^/]+/.+ ]]; then
  echo "drive.sh cannot drive a context-path stack ($WB_URL): drive it with pw.sh + check-paths.sh" >&2; exit 65
fi
[[ -x "$E2E_DIR/node_modules/.bin/cypress" ]] || { echo "cypress missing in $E2E_DIR (npm run install:local)" >&2; exit 69; }

# An existing spec of the run's tree runs in place with its directory's config; anything else is a verify spec.
REPO_SPEC=""
if [[ "$SPEC" == "$E2E_DIR"/e2e-* ]]; then
  REPO_SPEC="${SPEC#"$E2E_DIR"/}"
elif [[ "$SPEC" == */e2e-tests/e2e-* ]]; then
  echo "$SPEC belongs to another checkout than the run's ($E2E_DIR): pass the spec of the tree under test" >&2; exit 64
fi
case "$REPO_SPEC" in
  "") BASE_CONFIG=cypress.config.js ;;
  e2e-flaky/*)
    [[ $FLAKY -eq 1 ]] || { echo "e2e-flaky spec refused (known flaky; pass --allow-flaky to run it anyway)" >&2; exit 64; }
    BASE_CONFIG=cypress-flaky.config.js ;;
  e2e-legacy/guides/*) BASE_CONFIG=cypress-guides.config.js ;;
  e2e-legacy/*) BASE_CONFIG=cypress-legacy.config.js ;;
  e2e-security/*) BASE_CONFIG=cypress-security.config.js ;;
  *) BASE_CONFIG=cypress.config.js ;;
esac

NAME="$(basename "$SPEC" .js)"; NAME="${NAME%.cy}"; NAME="${NAME%.spec}"
SPEC_OUT="$EVIDENCE_ROOT/$RUN_ID/$NAME"
WORK="$SPEC_SCRATCH/$RUN_ID"
# Never mix or delete evidence: an earlier drive of the same spec+run-id is moved aside.
[[ -e "$SPEC_OUT" ]] && mv "$SPEC_OUT" "$SPEC_OUT.prev-$(date +%H%M%S)"
mkdir -p "$SPEC_OUT" "$WORK" "$STATE_DIR/runs"
touch "$STATE_DIR/runs/$RUN_ID"   # lets cleanup.sh find this run's repositories
if [[ -n "$REPO_SPEC" ]]; then
  RUN_SPEC="$REPO_SPEC"
  # The repo's specs rely on the default user-data stub, so their env stays as the base config sets it.
  ENV_OVERRIDES=""
else
  cp "$SPEC" "$WORK/$NAME.cy.js"
  cp "$SKILL_DIR/specs/verify-support.js" "$WORK/verify-support.js"
  RUN_SPEC="cypress/verify/$RUN_ID/$NAME.cy.js"
  ENV_OVERRIDES=", set_default_user_data: false"
fi

BROWSER=electron; command -v google-chrome >/dev/null && BROWSER=chrome
echo "run-id=$RUN_ID spec=$SPEC config=$BASE_CONFIG browser=$BROWSER url=$WB_URL retries=$RETRIES repeat=$REPEAT evidence=$SPEC_OUT"

security_on() { [[ "$(curl -s -m 10 "$GDB_URL/rest/security")" == true ]]; }
SECURITY_BEFORE=off; security_on && SECURITY_BEFORE=on
# Leaves GraphDB's security as it was before the spec. Container stack: switch it off again; dev stack: report.
restore_security() {
  [[ $SECURITY_BEFORE == off ]] && security_on || return 0
  if [[ "$RUN_MODE" != container ]]; then
    echo "FAIL: the spec left security ON on the shared GraphDB $GDB_URL - switch it off (admin) before the next run"
    return 0
  fi
  gdb_auth   # admin/root of the run's throwaway GraphDB
  if gcurl -s -m 10 -o /dev/null -X POST "$GDB_URL/rest/security" -H 'Content-Type: application/json' -d 'false' \
       && ! security_on; then
    echo "security: the spec left it ON - switched off again"
  else
    echo "FAIL: the spec left security ON and admin/root cannot switch it off - recreate the stack (container.sh up)"
  fi
}

# Download checks read e2e-tests/cypress/downloads; trashAssetsBeforeRuns is off (it would trash evidence),
# so stale files are removed here. Another Cypress run on this tree may be between a download and its check:
# then only files older than 2 minutes go.
clear_downloads() {
  local dir="$E2E_DIR/cypress/downloads"
  [[ -d "$dir" ]] || return 0
  if pgrep -f "Cypress.*--run-project.*$E2E_DIR" >/dev/null; then
    find "$dir" -type f -mmin +2 -delete
    echo "WARN: another Cypress run on $E2E_DIR is active - kept its cypress/downloads files of the last 2 minutes"
  else
    find "$dir" -mindepth 1 -delete
  fi
}

PROGRESS='Running:|✓|✔|✖|^ +[0-9]+\) |[0-9]+ (passing|failing|pending)|Error:'
run_once() {   # <evidence dir> -> sets code
  local out="$1" log="$1/cypress.log" cpid rc shown=0 start=$SECONDS
  code=""
  mkdir -p "$out"
  # Wrapper config: the base config's e2e.retries beats --config retries=N, and its
  # junit reporter / video deletion are noise for a verification run.
  cat > "$WORK/verify.config.js" <<JS
import base from '../../../$BASE_CONFIG';
export default {
    ...base,
    screenshotsFolder: '$out/screenshots',
    trashAssetsBeforeRuns: false,
    video: false,
    reporter: 'spec',
    e2e: {...base.e2e, baseUrl: '$WB_URL', specPattern: '$RUN_SPEC', retries: {runMode: $RETRIES, openMode: 0}},
    env: {...base.env, RUN_ID: '$RUN_ID', EVIDENCE_DIR: '$out'$ENV_OVERRIDES}
};
JS
  clear_downloads
  : > "$log"
  # Own session/process group, so a kill takes Cypress, its browser and its server down together.
  (cd "$E2E_DIR" && exec setsid npx cypress run "${HEADED[@]}" \
    --config-file "cypress/verify/$RUN_ID/verify.config.js" \
    --browser "$BROWSER" \
    --spec "$RUN_SPEC") > "$log" 2>&1 &
  cpid=$!
  show_new() {
    local n; n=$(wc -l < "$log")
    (( n > shown )) && sed -n "$((shown + 1)),${n}p" "$log" | grep -E "$PROGRESS"
    shown=$n
  }
  stop_run() {   # <exit code> <reason>
    echo "$2 - killing the run (full log: $log)"
    kill -TERM -- "-$cpid" 2>/dev/null; sleep 5; kill -KILL -- "-$cpid" 2>/dev/null
    code=$1
  }
  while kill -0 "$cpid" 2>/dev/null; do
    sleep 2
    show_new
    if (( $(date +%s) - $(stat -c %Y "$log") > STALL )); then
      stop_run 125 "STALLED: no output for ${STALL}s"; break
    elif (( SECONDS - start > TIMEOUT )); then
      stop_run 124 "TIMEOUT: still running after ${TIMEOUT}s"; break
    fi
  done
  wait "$cpid" 2>/dev/null; rc=$?
  show_new
  code="${code:-$rc}"
  restore_security
  { echo "run_id=$RUN_ID"; echo "spec=$SPEC"; echo "config=$BASE_CONFIG"; echo "url=$WB_URL"; echo "retries=$RETRIES"
    echo "exit_code=$code"; echo "git=$(git -C "$E2E_DIR" rev-parse --short HEAD)"; date -Is; } > "$out/summary.txt"
}

if [[ $REPEAT -eq 1 ]]; then
  run_once "$SPEC_OUT"; final=$code
else
  passed=0; final=0; results=()
  for ((i = 1; i <= REPEAT; i++)); do
    echo "=== iteration $i/$REPEAT"
    run_once "$SPEC_OUT/iter-$i"
    echo "iteration $i: exit_code=$code"
    results+=("$code")
    if [[ "$code" == 0 ]]; then passed=$((passed + 1)); elif [[ $final == 0 ]]; then final=$code; fi
  done
  echo "repeat: $passed/$REPEAT passed (exit codes: ${results[*]})" | tee "$SPEC_OUT/summary.txt"
fi
rm -rf "$WORK"; rmdir "$SPEC_SCRATCH" 2>/dev/null   # scaffolding only; evidence stays in $SPEC_OUT
echo "exit_code=$final"
echo "$SPEC_OUT"
exit "$final"
