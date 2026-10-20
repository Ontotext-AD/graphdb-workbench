#!/usr/bin/env bash
# Interactive driving with the globally installed Playwright CLI (`npm i -g @playwright/cli`).
# Usage: pw.sh <run-id> <playwright-cli command> [args...]
#   pw.sh 20261008-1700 open http://localhost:9000/repository     # starts session verify-wb-<run-id> (headless chrome)
#   pw.sh 20261008-1700 open --headed http://localhost:9000/      # visible window, the user can watch
#   pw.sh 20261008-1700 snapshot --filename=repos.yml              # ARIA tree with refs, saved as evidence
#   pw.sh 20261008-1700 click 'role=button[name="Create"]'
#   pw.sh 20261008-1700 screenshot --filename=03-created.png
#   pw.sh 20261008-1700 wait '#wb-repositories-addRepositoryLink' [timeout-ms]   # helper: wait until visible
#   pw.sh 20261008-1700 wait-gone '.modal' [timeout-ms]                          # helper: wait until hidden/detached
# playwright-cli does not wait for a selector to appear: after open/goto/route changes, `wait` (or snapshot and
# use refs) before clicking, or the click fails with 'does not match any elements'.
# Runs inside the run's evidence dir, so every snapshot/screenshot/console log lands there, not in the repo.
set -uo pipefail
source "$(dirname "$0")/env.sh"

RUN_ID="${1:?usage: pw.sh <run-id> <playwright-cli command> [args...]}"; shift
[[ $# -gt 0 ]] || { echo "missing playwright-cli command" >&2; exit 64; }
command -v playwright-cli >/dev/null || { echo "playwright-cli not on PATH: npm i -g @playwright/cli" >&2; exit 127; }

OUT="$EVIDENCE_ROOT/$RUN_ID/playwright"
mkdir -p "$OUT" "$STATE_DIR/runs"
touch "$STATE_DIR/runs/$RUN_ID"   # lets cleanup.sh find this run's repositories and browser session
load_run "$RUN_ID"

cmd="$1"; shift
# `@/route` expands to the run's workbench URL (dev stack or container, with its context path).
args=(); for a in "$@"; do [[ "$a" == @/* ]] && a="$WB_URL/${a#@/}"; args+=("$a"); done; set -- "${args[@]}"
if [[ "$cmd" == "wait" || "$cmd" == "wait-gone" ]]; then
  sel="${1:?usage: pw.sh <run-id> $cmd <selector> [timeout-ms]}"; timeout="${2:-15000}"
  state=visible; [[ "$cmd" == "wait-gone" ]] && state=hidden
  js_sel="$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$sel")"
  set -- "async page => { await page.locator($js_sel).first().waitFor({state: '$state', timeout: $timeout}); return 'ok'; }"
  cmd=run-code
fi
if [[ "$cmd" == "open" ]]; then
  # Chrome (installed system browser) unless the caller picked one.
  [[ " $* " == *" --browser"* ]] || set -- --browser=chrome "$@"
fi
cd "$OUT" && exec playwright-cli -s="verify-wb-$RUN_ID" "$cmd" "$@"
