#!/usr/bin/env bash
# Setup data: create repositories verify-<run-id>-<suffix> on the run's GraphDB (dev or container stack),
# from the same template the e2e `cy.createRepository` uses. cleanup.sh --run-id finds and deletes them.
# Usage: repo.sh <run-id> <suffix>...
#   repo.sh pw-1700 a b c     # -> verify-pw-1700-a, verify-pw-1700-b, verify-pw-1700-c
#   Prints one created id per line. Exit 1 if any creation failed (GraphDB's answer is shown).
set -uo pipefail
source "$(dirname "$0")/env.sh"

RUN_ID="${1:?usage: repo.sh <run-id> <suffix>...}"; shift
[[ $# -gt 0 ]] || { echo "usage: repo.sh <run-id> <suffix>..." >&2; exit 64; }
load_run "$RUN_ID"
mkdir -p "$STATE_DIR/runs"
touch "$STATE_DIR/runs/$RUN_ID"   # lets cleanup.sh find this run's repositories

TEMPLATE="$E2E_DIR/fixtures/repo-template.json"
[[ -f "$TEMPLATE" ]] || TEMPLATE="$REPO_ROOT/e2e-tests/fixtures/repo-template.json"
rc=0
for suffix in "$@"; do
  id="verify-$RUN_ID-$suffix"
  body="$(python3 -c 'import json,sys; t=json.load(open(sys.argv[1])); t["id"]=sys.argv[2]; print(json.dumps(t))' "$TEMPLATE" "$id")"
  resp="$(curl -s -m 30 -w '\n%{http_code}' -X POST "$GDB_URL/rest/repositories" -H 'Content-Type: application/json' -d "$body")"
  code="${resp##*$'\n'}"
  if [[ "$code" == 2* ]]; then
    echo "$id"
  else
    echo "FAIL $id -> $code ${resp%$'\n'*}" >&2; rc=1
  fi
done
exit $rc
