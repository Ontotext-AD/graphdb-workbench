#!/usr/bin/env bash
# Smoke sweep: visit every route of the run's stack, let it settle, record h1/title, console errors, page errors,
# failed same-origin requests (>= 400) and a screenshot per route. Known noise (scripts/compare/noise.txt) is
# counted but not failed.
# Usage: smoke.sh <run-id> [--repo ID] [--theme light|dark] [--viewport 1440x900] [--settle MS]
#                 [--baseline RUN-ID] [route...]
#   smoke.sh vm-1700 --repo verify-vm-1700-s          # all routes; create the repo first (repo.sh vm-1700 s)
#   smoke.sh vm-1700 import sparql-new                 # just these
#   smoke.sh vm-1700 --baseline vm-base                # fail only on errors that run vm-base's sweep did not have
# --baseline compares per route with that run's smoke.json, ignoring origin/port, ?v=, timestamps and verify-*
# repository ids, so a master stack swept first turns "errors" into "new errors" (bare routes such as
# /resource/edit or /domain-range-graph answer 500 without parameters on master too).
# Default routes are read from the served build itself: legacy PluginRegistry 'route' urls without parameters
# (packages/legacy-workbench/src/js/angular/*/plugin.js) plus the Angular routes /sparql-new, /graph-navigator.
# Output: table (route, new/old errors, noise count, visible h1, final path when redirected); per-route detail,
# smoke.json and screenshots in <evidence root>/<run-id>/smoke/.
# Exit 0 = no new errors (outside noise.txt and the baseline), 1 = new errors, 2 = the sweep itself failed.
set -uo pipefail
source "$(dirname "$0")/env.sh"

RUN_ID="${1:?usage: smoke.sh <run-id> [options] [route...], see --help}"; shift
OPTS=(); ROUTES=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo|--theme|--viewport|--settle) OPTS+=("$1" "$2"); shift 2 ;;
    --baseline)
      b="$EVIDENCE_ROOT/$2/smoke/smoke.json"
      [[ -f "$b" ]] || { echo "FAIL: no sweep of run $2 ($b)" >&2; exit 2; }
      OPTS+=(--baseline "$b"); shift 2 ;;
    -*) echo "unknown arg $1" >&2; exit 64 ;;
    *) ROUTES+=("$1"); shift ;;
  esac
done
load_run "$RUN_ID"
export PW_CORE="$(npm root -g)/@playwright/cli/node_modules/playwright-core"
[[ -d "$PW_CORE" ]] || { echo "playwright-core not found under the global @playwright/cli: npm i -g @playwright/cli" >&2; exit 2; }
export PW_CHROME="${PW_CHROME:-$(command -v google-chrome || command -v chromium)}"

OUT="$EVIDENCE_ROOT/$RUN_ID/smoke"
mkdir -p "$OUT" "$STATE_DIR/runs"
touch "$STATE_DIR/runs/$RUN_ID"
echo "smoke $WB_URL as run $RUN_ID"
node "$(dirname "$0")/compare/smoke.cjs" --base "$WB_URL" --out "$OUT" "${OPTS[@]}" -- "${ROUTES[@]}"
rc=$?
echo "$OUT"
exit $rc
