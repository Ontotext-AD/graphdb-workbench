#!/usr/bin/env bash
# Start the workbench dev stack (root-config :9000, Angular :9002, api :9003) unless one is already up.
# Usage: launch.sh [--timeout SECONDS]   (default 900; a cold Angular build takes minutes)
set -euo pipefail
source "$(dirname "$0")/env.sh"

TIMEOUT=900
[[ "${1:-}" == "--timeout" ]] && TIMEOUT="$2"

ready() {
  [[ "$(http_code "$WB_URL/")" == 200 ]] \
    && [[ "$(http_code http://localhost:9002/workbenchApp.js)" == 200 ]] \
    && [[ "$(http_code http://localhost:9003/ontotext-workbench-api.js)" == 200 ]]
}

if [[ "$(http_code "$GDB_URL/rest/info/version")" != 200 ]]; then
  echo "FAIL: no GraphDB at $GDB_URL. Start a GraphDB backend first (this skill does not manage it)." >&2
  exit 2
fi

if [[ -f "$STATE_DIR/stack.pid" ]] && kill -0 "$(cat "$STATE_DIR/stack.pid")" 2>/dev/null; then
  echo "Stack already started by verify-workbench (pgid $(cat "$STATE_DIR/stack.pid")), waiting for readiness."
elif ss -ltn 2>/dev/null | grep -qE ':(9000|9002|9003)\b'; then
  if ready; then
    # Same version in every worktree, so only the serving process's cwd tells whose code this is.
    want="$(git rev-parse --show-toplevel 2>/dev/null)"; have="$(dev_stack_tree)"
    if [[ -n "$have" && -n "$want" && "$have" != "$want" ]]; then
      echo "FAIL: the dev stack on :9000 serves $have, not this checkout ($want)." >&2
      echo "      Verify this tree in its own stack: container.sh up --run-id <id> (see SKILL.md)." >&2
      exit 9
    fi
    echo "REUSING: a dev stack not started by verify-workbench is serving $WB_URL (${have:-checkout unknown}). It will NOT be stopped by cleanup."
    exit 0
  fi
  echo "FAIL: ports 9000/9002/9003 are partly taken by something not ready. Inspect with: ss -ltnp | grep -E ':900[023]'" >&2
  exit 3
else
  echo "Starting 'npm run start' (log: $STATE_DIR/stack.log)"
  cd "$REPO_ROOT"
  # setsid => own process group, so cleanup kills exactly this tree.
  setsid nohup npm run start >"$STATE_DIR/stack.log" 2>&1 < /dev/null &
  echo $! > "$STATE_DIR/stack.pid"
fi

for ((i = 0; i < TIMEOUT; i += 5)); do
  if ready; then echo "READY: $WB_URL"; exit 0; fi
  sleep 5
done
echo "FAIL: not ready after ${TIMEOUT}s. Tail of log:" >&2
tail -n 40 "$STATE_DIR/stack.log" >&2 || true
exit 4
