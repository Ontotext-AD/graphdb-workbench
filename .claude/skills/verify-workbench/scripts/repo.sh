#!/usr/bin/env bash
# Setup data: create repositories verify-<run-id>-<suffix> on the run's GraphDB (dev or container stack).
# cleanup.sh --run-id finds and deletes them. Security on (security.sh on, container runs): logs in as admin/root.
# Usage: repo.sh <run-id> [options] <suffix>...
#   repo.sh pw-1700 a b c                          # -> verify-pw-1700-a, verify-pw-1700-b, verify-pw-1700-c
#   repo.sh pw-1700 --ruleset owl2-rl a            # GraphDB repository with another ruleset
#   repo.sh pw-1700 --param enableContextIndex=true --param title=Demo a
#   repo.sh pw-1700 --autocomplete a               # + autocomplete index enabled and READY
#   repo.sh pw-1700 --type fedx --member verify-pw-1700-a --member verify-pw-1700-b fed
#   repo.sh pw-1700 --system                       # SystemRepository (container runs only)
# Options apply to every suffix of the call:
#   --param KEY=VALUE  override a template param (repeatable). graphdb: the params of
#                      e2e-tests/fixtures/repo-template.json (the template `cy.createRepository` uses); fedx: of
#                      GET /rest/repositories/default-config/fedx. Unknown keys are added.
#   --ruleset NAME     = --param ruleset=NAME (template: rdfsplus-optimized; e.g. empty, rdfs, owl-horst, owl2-rl)
#   --type graphdb|fedx  default graphdb.
#   --member ID        fedx only, repeatable: a local repository of the run as a read-only FedX member.
#   --autocomplete     enable the autocomplete index of each created repository and wait until it is READY.
#   --system           also create SystemRepository from the template (Graph Navigator keeps its settings there;
#                      GraphDB does not create it itself yet). Container runs only: on the shared dev GraphDB
#                      cleanup.sh would never remove it. Already present -> reused. Suffixes are then optional.
# Prints one created id per line. Exit 1 if any step failed (GraphDB's answer is shown), 64 on bad usage.
set -uo pipefail
source "$(dirname "$0")/env.sh"

usage() { echo "usage: repo.sh <run-id> [--param K=V]... [--ruleset R] [--type graphdb|fedx] [--member ID]... [--autocomplete] [--system] <suffix>..." >&2; exit 64; }
RUN_ID="${1:-}"; [[ -n "$RUN_ID" && "$RUN_ID" != -* ]] || usage; shift
PARAMS=(); MEMBERS=(); TYPE=graphdb; AUTOCOMPLETE=0; SYSTEM=0; SUFFIXES=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --param) [[ "${2:-}" == ?*=* ]] || { echo "--param needs KEY=VALUE" >&2; exit 64; }; PARAMS+=("$2"); shift 2 ;;
    --ruleset) [[ -n "${2:-}" ]] || { echo "--ruleset needs a name" >&2; exit 64; }; PARAMS+=("ruleset=$2"); shift 2 ;;
    --type) TYPE="${2:-}"; shift 2 ;;
    --member) [[ -n "${2:-}" ]] || { echo "--member needs a repository id" >&2; exit 64; }; MEMBERS+=("$2"); shift 2 ;;
    --autocomplete) AUTOCOMPLETE=1; shift ;;
    --system) SYSTEM=1; shift ;;
    -*) echo "unknown arg $1" >&2; exit 64 ;;
    *) SUFFIXES+=("$1"); shift ;;
  esac
done
[[ "$TYPE" == graphdb || "$TYPE" == fedx ]] || { echo "--type must be graphdb or fedx" >&2; exit 64; }
[[ ${#MEMBERS[@]} -eq 0 || "$TYPE" == fedx ]] || { echo "--member needs --type fedx" >&2; exit 64; }
[[ ${#SUFFIXES[@]} -gt 0 || $SYSTEM -eq 1 ]] || usage
load_run "$RUN_ID"; gdb_auth   # credentials once security.sh turned security on
if [[ $SYSTEM -eq 1 && "$RUN_MODE" != container ]]; then
  echo "--system needs a container run: SystemRepository on the shared GraphDB would outlive cleanup.sh" >&2; exit 64
fi
mkdir -p "$STATE_DIR/runs"
touch "$STATE_DIR/runs/$RUN_ID"   # lets cleanup.sh find this run's repositories

GRAPHDB_TEMPLATE="$E2E_DIR/fixtures/repo-template.json"
[[ -f "$GRAPHDB_TEMPLATE" ]] || GRAPHDB_TEMPLATE="$REPO_ROOT/e2e-tests/fixtures/repo-template.json"
# GraphDB matches params by their label, not their key. repo.sh takes every param's label from the run's live
# default-config, so each --param override applies whatever labels the template file carries.
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
gcurl -sf -m 10 "$GDB_URL/rest/repositories/default-config/$TYPE" > "$TMP/defaults.json" \
  || { echo "FAIL: cannot read $GDB_URL/rest/repositories/default-config/$TYPE" >&2; exit 1; }
GRAPHDB_DEFAULTS="$TMP/defaults.json"
if [[ "$TYPE" == fedx ]]; then
  TEMPLATE="$TMP/defaults.json"
  gcurl -sf -m 10 "$GDB_URL/rest/repositories/default-config/graphdb" > "$TMP/graphdb-defaults.json" \
    || { echo "FAIL: cannot read $GDB_URL/rest/repositories/default-config/graphdb" >&2; exit 1; }
  GRAPHDB_DEFAULTS="$TMP/graphdb-defaults.json"
else
  TEMPLATE="$GRAPHDB_TEMPLATE"
fi

# <template> <defaults> <id> <param count> <KEY=VALUE>... <member>... -> request body on stdout.
# FedX config values must be strings ("true", not true): GraphDB fails with cast errors otherwise.
build_body() {
  python3 - "$@" <<'PY'
import json, sys
tpl, dflt, rid, n = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
params, members = sys.argv[5:5 + n], sys.argv[5 + n:]
t = json.load(open(tpl))
d = json.load(open(dflt)).get("params", {})
t["id"] = rid
t["title"] = t.get("title") or ""          # null -> "Missing parameter Repository description"
for k in ("location", "sesameType"):
    t.pop(k, None)
p = t.setdefault("params", {})
for k, v in p.items():
    if k in d:
        v["label"] = d[k]["label"]
p.setdefault("id", dict(d.get("id", {"name": "id", "label": "Repository ID"})))["value"] = rid
for kv in params:
    k, v = kv.split("=", 1)
    if k not in d:
        print(f"WARN: {k} is not a param of this GraphDB's default-config; GraphDB may ignore it", file=sys.stderr)
    p.setdefault(k, dict(d.get(k, {"name": k, "label": k})))["value"] = v
    if k == "title":
        t["title"] = v
if t.get("type") == "fedx":
    p["member"]["value"] = [{"store": "ResolvableRepository", "repositoryName": m,
                             "respectRights": "true", "writable": "false"} for m in members]
print(json.dumps(t))
PY
}

post_repo() {   # <body on stdin> <id>
  local resp code
  resp="$(gcurl -s -m 30 -w '\n%{http_code}' -X POST "$GDB_URL/rest/repositories" -H 'Content-Type: application/json' -d @-)"
  code="${resp##*$'\n'}"
  [[ "$code" == 2* ]] && return 0
  echo "FAIL $1 -> $code ${resp%$'\n'*}" >&2; return 1
}

enable_autocomplete() {   # <id>: enable, then poll /rest/autocomplete/status until READY (60 s)
  local h="X-GraphDB-Repository: $1" st="" i
  gcurl -sf -m 10 -X POST -H "$h" "$GDB_URL/rest/autocomplete/enabled?enabled=true" >/dev/null \
    || { echo "FAIL $1: cannot enable autocomplete" >&2; return 1; }
  for ((i = 0; i < 60; i++)); do
    st="$(gcurl -s -m 5 -H "$h" "$GDB_URL/rest/autocomplete/status" | tr -d '"')"
    case "$st" in
      READY) return 0 ;;
      ERROR|CANCELED) echo "FAIL $1: autocomplete index $st" >&2; return 1 ;;
    esac
    sleep 1
  done
  echo "FAIL $1: autocomplete index not READY after 60s (status: $st)" >&2; return 1
}

rc=0
if [[ $SYSTEM -eq 1 ]]; then
  if gcurl -s -m 10 "$GDB_URL/rest/repositories" | grep -q '"id":"SystemRepository"'; then
    echo "SystemRepository"
  elif build_body "$GRAPHDB_TEMPLATE" "$GRAPHDB_DEFAULTS" SystemRepository 0 | post_repo SystemRepository; then
    echo "SystemRepository"
  else
    rc=1
  fi
fi
for suffix in "${SUFFIXES[@]}"; do
  id="verify-$RUN_ID-$suffix"
  build_body "$TEMPLATE" "$TMP/defaults.json" "$id" "${#PARAMS[@]}" "${PARAMS[@]}" "${MEMBERS[@]}" | post_repo "$id" || { rc=1; continue; }
  if [[ $AUTOCOMPLETE -eq 1 ]]; then enable_autocomplete "$id" || { rc=1; continue; }; fi
  echo "$id"
done
exit $rc
