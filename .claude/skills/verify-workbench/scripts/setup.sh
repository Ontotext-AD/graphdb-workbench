#!/usr/bin/env bash
# Setup data beyond repositories (those: repo.sh), on the run's GraphDB. REST, for setup only.
# Usage: setup.sh <run-id> <what> [args]
#   setup.sh RID location gdb [URI]          # attach a remote GraphDB location (default: the run's GraphDB itself)
#   setup.sh RID location sparql <repo-id>   # attach a repository of the run's GraphDB as a SPARQL endpoint location
#   setup.sh RID graph-config <repo-id> <name>   # a Visual graph config (start mode: search) on that repository
# Container runs only: locations and graph configs are GraphDB-wide, not per repository, so on the shared dev
#   GraphDB they would outlive cleanup.sh.
# location: the GraphDB attaches itself under http://localhost:7200 (its address inside the container); the UI
#   lists it as a remote location with "Recursive location detected" instead of its repositories: enough for the
#   location list/edit/detach UI, not for browsing a remote repository.
#   SPARQL locations need basic auth even with security off: admin/root is sent.
# Security on (security.sh on): the calls log in as admin/root.
# Prints GraphDB's answer. Exit 0 = done, 1 = GraphDB refused (answer shown), 64 = bad usage.
set -uo pipefail
source "$(dirname "$0")/env.sh"

usage() { echo "usage: setup.sh <run-id> location gdb [URI] | location sparql <repo-id> | graph-config <repo-id> <name>" >&2; exit 64; }
RUN_ID="${1:-}"; WHAT="${2:-}"; [[ -n "$RUN_ID" && -n "$WHAT" ]] || usage; shift 2
load_run "$RUN_ID"; gdb_auth   # credentials once security.sh turned security on
[[ "$RUN_MODE" == container ]] || { echo "setup.sh needs a container run: what it creates is GraphDB-wide and would outlive cleanup.sh" >&2; exit 64; }
mkdir -p "$STATE_DIR/runs"
touch "$STATE_DIR/runs/$RUN_ID"

post() {   # <path> <json> [header] -> prints the answer, returns 1 on non-2xx
  local resp code
  resp="$(gcurl -s -m 60 -w '\n%{http_code}' -X POST "$GDB_URL/$1" -H 'Content-Type: application/json' ${3:+-H "$3"} -d "$2")"
  code="${resp##*$'\n'}"
  echo "$code ${resp%$'\n'*}"
  [[ "$code" == 2* ]]
}

case "$WHAT" in
  location)
    case "${1:-}" in
      gdb)
        body="$(python3 -c 'import json,sys; print(json.dumps({"uri": sys.argv[1], "locationType": "GDB", "authType": "none"}))' "${2:-http://localhost:7200}")" ;;
      sparql)
        [[ -n "${2:-}" ]] || usage
        body="$(python3 -c 'import json,sys; print(json.dumps({"uri": "http://localhost:7200/repositories/" + sys.argv[1], "locationType": "SPARQL", "authType": "basic", "username": "admin", "password": "root"}))' "$2")" ;;
      *) usage ;;
    esac
    post rest/locations "$body" || exit 1 ;;
  graph-config)
    [[ -n "${1:-}" && -n "${2:-}" ]] || usage
    body="$(python3 -c 'import json,sys; print(json.dumps({"name": sys.argv[1], "startMode": "search", "startQueryIncludeInferred": True, "startQuerySameAs": True, "shared": False}))' "$2")"
    post rest/explore-graph/config "$body" "X-GraphDB-Repository: $1" || exit 1 ;;
  *) usage ;;
esac
