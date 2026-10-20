#!/usr/bin/env bash
# Accessibility check with the IBM Equal Access engine (WCAG_2_2 rule set) — the checker GDB-14287's definition
# of done is measured with. Prints the VIOLATION/FAIL results per page; the full report (incl. potential
# violations and recommendations) goes to <evidence root>/<run-id>/a11y/a11y-report.json with a screenshot per page.
# Usage: a11y.sh <run-id> [--repo ID] [route...]
#   a11y.sh a11y-1700 --repo kiko                   # the epic's in-scope pages on the run's stack
#   a11y.sh a11y-1700 --repo kiko import            # one page
# Routes default to the epic scope: home, import, graphs, sparql, repository, settings, license.
# --repo selects that repository first (pages like import/graphs/sparql render little without one); on a
# container stack create it first (REST is fine for setup). The page must show the state under test: content that
# only renders after an action (a dialog, an expanded tree) is not checked unless you check it interactively.
# Exit 0 = no violations, 1 = violations found, 2 = the check itself failed.
set -uo pipefail
source "$(dirname "$0")/env.sh"

RUN_ID="${1:?usage: a11y.sh <run-id> [--repo ID] [route...]}"; shift
REPO=-
if [[ "${1:-}" == "--repo" ]]; then REPO="${2:?--repo needs an id}"; shift 2; fi
ROUTES=("$@"); [[ ${#ROUTES[@]} -gt 0 ]] || ROUTES=("" import graphs sparql repository settings license)
load_run "$RUN_ID"

# The engine is installed once in a cache dir, outside the repo; Playwright comes from the global CLI.
export A11Y_HOME="${VERIFY_WB_A11Y_HOME:-$HOME/.cache/verify-workbench/a11y}"
if [[ ! -d "$A11Y_HOME/node_modules/accessibility-checker-engine" ]]; then
  mkdir -p "$A11Y_HOME" && (cd "$A11Y_HOME" && npm init -y >/dev/null &&
    npm i --silent --no-audit --no-fund accessibility-checker-engine@4.0.34 >/dev/null) ||
    { echo "cannot install accessibility-checker-engine into $A11Y_HOME" >&2; exit 2; }
fi
export PW_CORE="$(npm root -g)/@playwright/cli/node_modules/playwright-core"
[[ -d "$PW_CORE" ]] || { echo "playwright-core not found under the global @playwright/cli: npm i -g @playwright/cli" >&2; exit 2; }
export A11Y_CHROME="${A11Y_CHROME:-$(command -v google-chrome || command -v chromium)}"

OUT="$EVIDENCE_ROOT/$RUN_ID/a11y"
mkdir -p "$OUT" "$STATE_DIR/runs"
touch "$STATE_DIR/runs/$RUN_ID"
echo "checking $WB_URL as run $RUN_ID (repo: $REPO)"
node "$(dirname "$0")/a11y-check.cjs" "$WB_URL" "$REPO" "$OUT" "${ROUTES[@]}"
rc=$?
echo "$OUT"
exit $rc
