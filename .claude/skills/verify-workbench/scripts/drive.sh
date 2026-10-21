#!/usr/bin/env bash
# Run ONE Cypress spec against the run's stack and keep the evidence. The only way this skill runs Cypress.
# Usage: drive.sh <spec> [--run-id ID] [--headed] [--timeout SECONDS] [--stall SECONDS] [--allow-flaky]
#   spec: exactly one file, either
#     - a verify spec (.claude/skills/verify-workbench/specs/, or your own anywhere): copied next to
#       verify-support.js and run with the base cypress.config.js, or
#     - an existing spec of the run's tree (e2e-tests/e2e-legacy|e2e-security|...): run in place with the
#       config of its directory (e2e-legacy/guides -> cypress-guides, e2e-legacy -> cypress-legacy,
#       e2e-security -> cypress-security, e2e-flaky -> cypress-flaky).
#   Both: retries 0, no video, baseUrl = the run's stack (container run: that tree's Cypress and specs).
#   --timeout   hard cap for the whole run (default 600) -> exit 124.
#   --stall     kill the run after this many seconds without new output (default 120) -> exit 125.
#               A silent run is a hung run (missing license, endless polling); report it, do not wait.
#   --allow-flaky  e2e-flaky/ specs are refused without it.
#   Prints progress (spec start, each passed/failed test, totals) while it runs; the full log is cypress.log.
#   Last stdout line: the evidence directory. Exit code = Cypress exit code, or 124/125 as above.
set -uo pipefail
source "$(dirname "$0")/env.sh"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

SPEC="${1:?usage: drive.sh <spec> [--run-id ID] [--headed] [--timeout S] [--stall S] [--allow-flaky]}"; shift
RUN_ID="$(date +%Y%m%d-%H%M%S)"
TIMEOUT=600
STALL=120
FLAKY=0
HEADED=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-id) RUN_ID="$2"; shift 2 ;;
    --headed) HEADED=(--headed); shift ;;
    --timeout) TIMEOUT="$2"; shift 2 ;;
    --stall) STALL="$2"; shift 2 ;;
    --allow-flaky) FLAKY=1; shift ;;
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
OUT="$EVIDENCE_ROOT/$RUN_ID/$NAME"
WORK="$SPEC_SCRATCH/$RUN_ID"
# Never mix or delete evidence: an earlier drive of the same spec+run-id is moved aside.
[[ -e "$OUT" ]] && mv "$OUT" "$OUT.prev-$(date +%H%M%S)"
mkdir -p "$OUT" "$WORK" "$STATE_DIR/runs"
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
echo "run-id=$RUN_ID spec=$SPEC config=$BASE_CONFIG browser=$BROWSER url=$WB_URL evidence=$OUT"

# Wrapper config: the base config's e2e.retries beats --config retries=0, and its
# junit reporter / video deletion are noise for a verification run.
cat > "$WORK/verify.config.js" <<JS
import base from '../../../$BASE_CONFIG';
export default {
    ...base,
    screenshotsFolder: '$OUT/screenshots',
    trashAssetsBeforeRuns: false,
    video: false,
    reporter: 'spec',
    e2e: {...base.e2e, baseUrl: '$WB_URL', specPattern: '$RUN_SPEC', retries: {runMode: 0, openMode: 0}},
    env: {...base.env, RUN_ID: '$RUN_ID', EVIDENCE_DIR: '$OUT'$ENV_OVERRIDES}
};
JS

LOG="$OUT/cypress.log"
: > "$LOG"
cd "$E2E_DIR"
# Own session/process group, so a kill takes Cypress, its browser and its server down together.
setsid npx cypress run "${HEADED[@]}" \
  --config-file "cypress/verify/$RUN_ID/verify.config.js" \
  --browser "$BROWSER" \
  --spec "$RUN_SPEC" \
  > "$LOG" 2>&1 &
CPID=$!

PROGRESS='Running:|✓|✔|✖|^ +[0-9]+\) |[0-9]+ (passing|failing|pending)|Error:'
shown=0; start=$SECONDS; code=""
show_new() {
  local n; n=$(wc -l < "$LOG")
  (( n > shown )) && sed -n "$((shown + 1)),${n}p" "$LOG" | grep -E "$PROGRESS"
  shown=$n
}
stop_run() {   # <exit code> <reason>
  echo "$2 - killing the run (full log: $LOG)"
  kill -TERM -- "-$CPID" 2>/dev/null; sleep 5; kill -KILL -- "-$CPID" 2>/dev/null
  code=$1
}
while kill -0 "$CPID" 2>/dev/null; do
  sleep 2
  show_new
  if (( $(date +%s) - $(stat -c %Y "$LOG") > STALL )); then
    stop_run 125 "STALLED: no output for ${STALL}s"; break
  elif (( SECONDS - start > TIMEOUT )); then
    stop_run 124 "TIMEOUT: still running after ${TIMEOUT}s"; break
  fi
done
wait "$CPID" 2>/dev/null; rc=$?
show_new
code="${code:-$rc}"

{ echo "run_id=$RUN_ID"; echo "spec=$SPEC"; echo "config=$BASE_CONFIG"; echo "url=$WB_URL"; echo "exit_code=$code"; echo "git=$(git -C "$E2E_DIR" rev-parse --short HEAD)"; date -Is; } > "$OUT/summary.txt"
rm -rf "$WORK"; rmdir "$SPEC_SCRATCH" 2>/dev/null   # scaffolding only; evidence stays in $OUT
echo "exit_code=$code"
echo "$OUT"
exit "$code"
