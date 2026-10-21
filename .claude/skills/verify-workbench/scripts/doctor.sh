#!/usr/bin/env bash
# Read-only health check: is this instance worth driving? Exit 0 = OK (warnings allowed), 1 = do not drive.
# Usage: doctor.sh [--run-id ID] [--tree PATH]
#   --run-id ID  check the container stack of that run (container.sh up) instead of the shared dev stack
#   --tree PATH  checkout the dev stack must be serving (default: git toplevel of $PWD)
set -uo pipefail
source "$(dirname "$0")/env.sh"

RUN_ID=""; TREE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-id) RUN_ID="$2"; shift 2 ;;
    --tree) TREE="$2"; shift 2 ;;
    *) echo "unknown arg $1" >&2; exit 64 ;;
  esac
done
[[ -n "$RUN_ID" ]] && load_run "$RUN_ID"

fail=0
ok()   { echo "OK    $*"; }
warn() { echo "WARN  $*"; }
bad()  { echo "FAIL  $*"; fail=1; }

ver_json="$(curl -s -m 5 "$GDB_URL/rest/info/version" || true)"
if [[ -n "$ver_json" ]]; then ok "GraphDB $GDB_URL: $ver_json"; else bad "GraphDB not answering at $GDB_URL"; fi

sec="$(curl -s -m 5 "$GDB_URL/rest/security" || true)"
if [[ "$sec" == "false" ]]; then ok "security disabled (recipes assume this)"
else bad "security is '$sec' - recipes assume security OFF; log-in flows are not scripted"; fi

if [[ "$RUN_MODE" == container ]]; then
  ok "container stack of run $RUN_ID serving $RUN_TREE"
  # GraphDB answers 406 to a page request without Accept: text/html.
  c="$(curl -s -o /dev/null -m 5 -H 'Accept: text/html' -w '%{http_code}' "$WB_URL/")"; [[ "$c" == 200 ]] && ok "$WB_URL/ -> 200" || bad "$WB_URL/ -> $c (container.sh up --run-id $RUN_ID)"
  bundle="$(grep -oE 'main\.[a-f0-9]+\.js' "$RUN_TREE/dist/index.html" 2>/dev/null | head -1)"
  [[ -n "$bundle" && "$(http_code "$WB_URL/$bundle")" == 200 ]] && ok "serves this tree's dist/ ($bundle)" \
    || warn "served bundle != $RUN_TREE/dist ($bundle) - run container.sh rebuild --run-id $RUN_ID"
  [[ "$WB_URL" =~ ^https?://[^/]+/.+ ]] && ok "context path /${WB_URL#*://*/} - drive with pw.sh, check with check-paths.sh (no Cypress)"
else
for u in "$WB_URL/" http://localhost:9002/workbenchApp.js http://localhost:9003/ontotext-workbench-api.js; do
  c="$(http_code "$u")"; [[ "$c" == 200 ]] && ok "$u -> 200" || bad "$u -> $c (run launch.sh)"
done
want="$(cd "${TREE:-$PWD}" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null)"
have="$(dev_stack_tree)"
if [[ -z "$have" ]]; then warn "cannot tell which checkout serves :9000 (process not ours?)"
elif [[ -n "$want" && "$have" != "$want" ]]; then bad "dev stack on :9000 serves $have, not $want - verify this tree with container.sh up"
else ok "dev stack serves $have"; fi
fi

if [[ "$RUN_MODE" != container ]]; then
checkout_ver="$(node -p "require('$REPO_ROOT/package.json').version" 2>/dev/null)"
served_ver="$(curl -s -m 5 "$WB_URL/" | grep -oE 'workbenchApp\.js\?v=[^"]+' | head -1 | cut -d= -f2)"
if [[ "$served_ver" == "$checkout_ver" ]]; then ok "served version $served_ver matches checkout"
else warn "served version '$served_ver' != checkout '$checkout_ver' - stack started before the checkout changed; source edits hot-reload, webpack/config changes need a restart"; fi

if [[ -f "$STATE_DIR/stack.pid" ]] && kill -0 "$(cat "$STATE_DIR/stack.pid")" 2>/dev/null; then
  ok "stack owned by verify-workbench (pgid $(cat "$STATE_DIR/stack.pid"))"
else
  warn "stack NOT started by verify-workbench - shared with the user; drive only verify-* repositories, never stop it"
fi
fi

if [[ -x "$E2E_DIR/node_modules/.bin/cypress" ]]; then ok "cypress $("$E2E_DIR/node_modules/.bin/cypress" --version 2>/dev/null | head -1)"
else warn "cypress missing (only drive.sh needs it) - run: npm run install:local"; fi
if command -v playwright-cli >/dev/null; then
  ok "playwright-cli $(playwright-cli --version 2>/dev/null)"
  sessions="$(playwright-cli list 2>/dev/null | grep -oE 'verify-wb-[^ :]+' | sort -u | tr '\n' ' ')"
  [[ -n "$sessions" ]] && warn "open browser sessions: $sessions(close via cleanup.sh --run-id <id>)"
else
  warn "playwright-cli missing - interactive driving unavailable: npm i -g @playwright/cli"
fi
command -v google-chrome >/dev/null && ok "google-chrome present" || warn "google-chrome missing; drive.sh falls back to electron"

[[ "$RUN_MODE" != container ]] && leftovers="$(curl -s -m 5 "$GDB_URL/rest/repositories" | grep -oE '"id":"verify-[^"]+"' | cut -d'"' -f4 | tr '\n' ' ')"
[[ "$RUN_MODE" == container ]] || { [[ -z "$leftovers" ]] && ok "no leftover verify-* repositories" || warn "leftover repositories: $leftovers (cleanup.sh --all-repos)"; }

pgrep -f "Cypress.*--run-project.*$E2E_DIR" >/dev/null && warn "another Cypress run is active on this repo - do not run two drives in parallel"

echo "evidence root: $EVIDENCE_ROOT"
exit $fail
