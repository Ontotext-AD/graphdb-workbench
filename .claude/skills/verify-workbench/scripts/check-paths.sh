#!/usr/bin/env bash
# Context-path check for an interactive run: every request the page made to the stack's origin must stay under
# the run's workbench URL (e.g. http://localhost:7211/graphdb/). Run it after a scenario, before closing.
# Usage: check-paths.sh <run-id> [--save NAME]
#   Exit 0 = nothing escaped, 1 = at least one request left the context path (listed), 2 = no data.
#   Also lists same-origin responses >= 400 (WARN only: some are expected, see SKILL.md Gotchas).
#   --save NAME writes the full request log to the run's evidence dir as NAME (default: requests.txt).
set -uo pipefail
source "$(dirname "$0")/env.sh"

RUN_ID="${1:?usage: check-paths.sh <run-id> [--save NAME]}"; shift
SAVE=requests.txt
[[ "${1:-}" == "--save" ]] && SAVE="$2"
load_run "$RUN_ID"

base="${WB_URL%/}/"
origin="$(echo "$WB_URL" | grep -oE '^https?://[^/]+')"
log="$EVIDENCE_ROOT/$RUN_ID/playwright/$SAVE"
"$(dirname "$0")/pw.sh" "$RUN_ID" requests --static > "$log" 2>&1
lines="$(grep -E '^[0-9]+\. \[[A-Z]+\] ' "$log")"
[[ -n "$lines" ]] || { echo "no requests recorded for session verify-wb-$RUN_ID (open a page first)"; exit 2; }

same="$(echo "$lines" | grep -F "] $origin/")"
escaped="$(echo "$same" | grep -vF "] $base")"
errors="$(echo "$same" | grep -E '=> \[[45][0-9]{2}\]')"
echo "checked $(echo "$same" | wc -l) same-origin requests against $base (log: $log)"
[[ -n "$errors" ]] && { echo "WARN  responses >= 400:"; echo "$errors" | sed 's/^/      /'; }
if [[ -n "$escaped" ]]; then
  echo "FAIL  requests outside $base:"; echo "$escaped" | sed 's/^/      /'; exit 1
fi
echo "OK    no request left $base"
