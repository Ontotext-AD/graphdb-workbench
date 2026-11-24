#!/usr/bin/env bash
# Tear down what verify-workbench created. Never touches evidence.
# Usage: cleanup.sh (--run-id ID ... | --all-runs | --all-repos) [--stop-stack]
#        cleanup.sh                      # lists the recorded runs (exit 0), removes nothing
#   --run-id ID    close Playwright session verify-wb-ID and either remove the run's container stack
#                  (container.sh up runs) or delete repositories verify-ID-* on the shared GraphDB (dev runs),
#                  plus its saved visual graphs named verify-ID-* (GraphDB-wide, not per repository).
#                  A stack whose `up` failed before recording the run is found by its stack dir.
#                  Also removes every docker object (container, network, volume) the run owns, also without a
#                  run record or stack dir: labelled verify-wb.run=ID (sidecars: start yours with
#                  `--label verify-wb.run=ID`), of compose project verify-wb-ID, or unlabelled and named exactly
#                  verify-wb-ID or verify-wb-ID_*. An unlabelled verify-wb-ID-<x> belongs to run ID-<x>, never ID.
#   --all-runs     the same for every run recorded in state - including other agents' runs in progress
#   --all-repos    delete every repository whose id starts with verify- on the shared GraphDB
#   --stop-stack   also stop the dev stack, ONLY if launch.sh started it
set -uo pipefail
source "$(dirname "$0")/env.sh"

RUNS=(); ALL_RUNS=0; ALL_REPOS=0; STOP=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-id) RUNS+=("$2"); shift 2 ;;
    --all-runs) ALL_RUNS=1; shift ;;
    --all-repos) ALL_REPOS=1; shift ;;
    --stop-stack) STOP=1; shift ;;
    *) echo "unknown arg $1" >&2; exit 64 ;;
  esac
done
if [[ $ALL_RUNS -eq 1 ]]; then
  for f in "$STATE_DIR"/runs/*; do [[ -e "$f" ]] && RUNS+=("$(basename "$f")"); done
elif [[ ${#RUNS[@]} -eq 0 && $ALL_REPOS -eq 0 && $STOP -eq 0 ]]; then
  # State is shared by every agent on the machine: without a run named, only list it.
  echo "recorded runs (cleanup.sh --run-id <id>):"
  ls -1 "$STATE_DIR/runs" 2>/dev/null | sed 's/^/  /'
  exit 0
fi

SHARED_GDB_URL="$GDB_URL"; DEV_E2E_DIR="$E2E_DIR"; DEV_WB_URL="$WB_URL"
delete_repos() {   # <prefix> on the shared GraphDB
  local id
  for id in $(curl -s -m 10 "$SHARED_GDB_URL/rest/repositories" | grep -oE '"id":"verify-[^"]+"' | cut -d'"' -f4); do
    [[ "$id" == "$1"* ]] && echo "delete repository $id -> $(curl -s -o /dev/null -m 60 -w '%{http_code}' -X DELETE "$SHARED_GDB_URL/rest/repositories/$id")"
  done
}
# Saved visual graphs are GraphDB-wide (not per repository): delete the ones named <prefix>* on the shared GraphDB.
delete_saved_graphs() {   # <prefix>
  local id
  for id in $(curl -s -m 10 "$SHARED_GDB_URL/rest/explore-graph/saved" | jq -r --arg p "$1" '.[]? | select(.name | startswith($p)) | .id' 2>/dev/null); do
    echo "delete saved graph $id -> $(curl -s -o /dev/null -m 30 -w '%{http_code}' -X DELETE "$SHARED_GDB_URL/rest/explore-graph/saved/$id")"
  done
}

# Docker objects the run owns (docker_owner in env.sh, rule in --help). Its compose project goes first (it takes
# its own networks and volumes), then loose containers, networks and volumes.
sweep_docker() {   # <run-id>
  command -v docker >/dev/null || return 0
  local rid="$1" p kind name owner
  p="$(run_project "$rid")"
  if [[ -n "$(docker ps -aq --filter "label=com.docker.compose.project=$p" 2>/dev/null)" ]]; then
    echo "remove compose project $p"; docker compose -p "$p" down -v --remove-orphans -t 5 >/dev/null 2>&1
  fi
  docker_objects | while read -r kind name owner; do
    [[ "$owner" == "$rid" ]] || continue
    echo "remove $kind $name"
    case "$kind" in
      container) docker rm -f -v "$name" >/dev/null ;;
      network) docker network rm "$name" >/dev/null ;;
      volume) docker volume rm "$name" >/dev/null ;;
    esac
  done
}

[[ $ALL_REPOS -eq 1 ]] && delete_repos "verify-"

for rid in "${RUNS[@]}"; do
  # Close this run's Playwright CLI session (only ours: sessions are named verify-wb-<run-id>).
  if command -v playwright-cli >/dev/null && playwright-cli list 2>/dev/null | grep -q "verify-wb-$rid\b"; then
    echo "close browser session verify-wb-$rid"
    playwright-cli -s="verify-wb-$rid" close >/dev/null 2>&1
  fi
  RUN_MODE=dev; E2E_DIR="$DEV_E2E_DIR"; SPEC_SCRATCH="$E2E_DIR/cypress/verify"; WB_URL="$DEV_WB_URL"
  load_run "$rid"
  if [[ "$RUN_MODE" == container ]]; then
    "$(dirname "$0")/container.sh" down --run-id "$rid"   # its GraphDB, data and staged dist go with it
  else
    delete_repos "verify-$rid-"; delete_saved_graphs "verify-$rid-"
    # A stack whose `up` failed before recording the run.
    [[ -d "$STATE_DIR/stacks/$rid" ]] && "$(dirname "$0")/container.sh" down --run-id "$rid"
  fi
  sweep_docker "$rid"   # sidecars the run started next to its stack
  rm -rf "${SPEC_SCRATCH:?}/$rid" "$STATE_DIR/runs/$rid"
done

if [[ $STOP -eq 1 ]]; then
  if [[ -f "$STATE_DIR/stack.pid" ]]; then
    pgid="$(cat "$STATE_DIR/stack.pid")"
    if kill -0 "$pgid" 2>/dev/null; then
      echo "stopping dev stack process group $pgid"
      kill -TERM -- "-$pgid" 2>/dev/null; sleep 3; kill -KILL -- "-$pgid" 2>/dev/null
    fi
    rm -f "$STATE_DIR/stack.pid"
  else
    echo "dev stack was not started by verify-workbench - leaving it running"
  fi
fi
echo "evidence kept under $EVIDENCE_ROOT"
