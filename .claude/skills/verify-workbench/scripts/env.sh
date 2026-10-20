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
