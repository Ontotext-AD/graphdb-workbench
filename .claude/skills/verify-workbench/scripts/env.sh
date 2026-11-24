# Shared settings for the verify-workbench helpers. Sourced, not executed.
# `<script> -h|--help` (as the first or second argument) prints the script's header comment and exits.
# Sourced without arguments, this file sees the calling script's own arguments.
case "${1:-} ${2:-}" in
  -h\ *|--help\ *|*\ -h|*\ --help) awk 'NR>1 && /^#/ {sub(/^# ?/, ""); print; next} NR>1 {exit}' "$0"; exit 0 ;;
esac
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
E2E_DIR="$REPO_ROOT/e2e-tests"
WB_URL="${WB_URL:-http://localhost:9000}"
GDB_URL="${GDB_URL:-http://localhost:7200}"
# Instance state (pid of a stack WE started, its log). Not evidence.
STATE_DIR="${VERIFY_WB_STATE:-$HOME/.cache/verify-workbench/state}"
# Evidence root. Survives cleanup on purpose.
EVIDENCE_ROOT="${VERIFY_WB_OUT:-$HOME/.cache/verify-workbench/runs}"
# Throwaway specs are copied here: e2e-tests/cypress/ is git-ignored.
SPEC_SCRATCH="$E2E_DIR/cypress/verify"
mkdir -p "$STATE_DIR" "$EVIDENCE_ROOT"

http_code() { curl -s -o /dev/null -m 5 -w '%{http_code}' "$1"; }

# Run ids that own docker objects (container.sh up, cluster.sh up): lowercase letters, digits and '-', so the
# docker name is the id itself and '_' (compose's separator in network and volume names) never occurs in one.
valid_run_id() { [[ "$1" =~ ^[a-z0-9][a-z0-9-]*$ ]]; }
require_run_id() {
  valid_run_id "$1" || { echo "--run-id '$1': use lowercase letters, digits and '-' only (it names docker objects)" >&2; exit 64; }
}
# Docker name of a run: compose project of its container stack, and the prefix of every docker object it owns.
run_project() { echo "verify-wb-$1"; }

# Run that owns a docker object, from what the object carries: the verify-wb.run label (sidecars the helpers
# start), else its compose project label (every container, network and volume of a run's stack), else its name
# (verify-wb-<rid> or verify-wb-<rid>_<x>; an unlabelled verify-wb-<rid>-<x> belongs to run <rid>-<x>).
docker_owner() {   # <name> <compose project label> <verify-wb.run label>
  local n
  if [[ -n "$3" ]]; then echo "$3"
  elif [[ "$2" == verify-wb-* ]]; then echo "${2#verify-wb-}"
  elif [[ "$1" == verify-wb-* ]]; then n="${1#verify-wb-}"; echo "${n%%_*}"
  fi
}
# Every docker object (containers, networks, volumes) as "<kind> <name> <owner run>", owner possibly empty.
docker_objects() {
  local kind fmt='{{.Name}}|{{.Label "com.docker.compose.project"}}|{{.Label "verify-wb.run"}}' name proj run
  for kind in container network volume; do
    case "$kind" in
      container) docker ps -a --format "${fmt/.Name/.Names}" ;;
      network) docker network ls --format "$fmt" ;;
      volume) docker volume ls --format "$fmt" ;;
    esac 2>/dev/null | while IFS='|' read -r name proj run; do
      echo "$kind $name $(docker_owner "$name" "$proj" "$run")"
    done
  done
}

# A port is taken when anything listens on it or a docker container publishes it (a container that is still
# starting publishes its port before anything listens). Pick ports under flock "$STATE_DIR/port.lock", held
# until the container that binds the port is created: parallel runs otherwise pick the same one.
port_taken() {
  ss -ltn 2>/dev/null | grep -qE "[:.]$1\b" && return 0
  docker ps -a --format '{{.Ports}}' 2>/dev/null | grep -qE "[:.]$1->"
}
free_port() {   # [<first, default 7210> [<end, exclusive, default 7300>]] -> first free port, or return 1
  local p
  for ((p = ${1:-7210}; p < ${2:-7300}; p++)); do
    port_taken "$p" || { echo "$p"; return 0; }
  done
  return 1
}

# A run started with `container.sh up` has its own stack: point WB_URL/GDB_URL (and Cypress) at it.
# Dev-stack runs have no MODE line and keep the defaults above.
load_run() {
  local f="$STATE_DIR/runs/$1"
  [[ -f "$f" ]] && grep -q '^MODE=container' "$f" || return 0
  RUN_MODE=container
  WB_URL="$(sed -n 's/^WB_URL=//p' "$f")"; GDB_URL="$(sed -n 's/^GDB_URL=//p' "$f")"
  RUN_TREE="$(sed -n 's/^TREE=//p' "$f")"
  E2E_DIR="$RUN_TREE/e2e-tests"; SPEC_SCRATCH="$E2E_DIR/cypress/verify"
}
RUN_MODE=dev

# Checkout a dev server on :9000 was started from (cwd of the listening process), empty if unknown.
dev_stack_tree() {
  local pid; pid="$(ss -ltnp 2>/dev/null | grep -E '[:.]9000\b' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)"
  [[ -n "$pid" ]] && git -C "$(readlink "/proc/$pid/cwd")" rev-parse --show-toplevel 2>/dev/null
}

# REST setup on a container run whose security is on (security.sh on): log in as the throwaway admin (admin/root)
# and send its token, or basic auth when the login form is off (OpenID only). Never on the dev stack: that GraphDB
# is the user's. Call after load_run; then use gcurl instead of curl for GraphDB calls.
GDB_AUTH=()
gdb_auth() {
  GDB_AUTH=()
  [[ "$RUN_MODE" == container && "$(curl -s -m 10 "$GDB_URL/rest/security")" == true ]] || return 0
  local t; t="$(curl -s -m 10 -D - -o /dev/null -X POST -H 'Content-Type: application/json' \
    -d '{"username":"admin","password":"root"}' "$GDB_URL/rest/login" | sed -n 's/^[Aa]uthorization: *//p' | tr -d '\r')"
  if [[ -n "$t" ]]; then GDB_AUTH=(-H "Authorization: $t"); else GDB_AUTH=(-u admin:root); fi
}
gcurl() { curl "${GDB_AUTH[@]}" "$@"; }
