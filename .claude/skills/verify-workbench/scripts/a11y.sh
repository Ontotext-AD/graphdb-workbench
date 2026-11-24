#!/usr/bin/env bash
# Accessibility check with the IBM Equal Access engine (WCAG_2_2 rule set) — the checker GDB-14287's definition
# of done is measured with. Prints the VIOLATION/FAIL results per page; the full report (incl. potential
# violations and recommendations) goes to <evidence root>/<run-id>/a11y/a11y-report.json with a screenshot per page.
# Usage: a11y.sh <run-id> [--repo ID] [--viewport WxH] [route...]   # run the check
#        a11y.sh <run-id> --summary                                 # counts of the run's report
#        a11y.sh <run-id> --baseline <base-run-id>                  # diff the run's report against another run's
#   a11y.sh a11y-1700 --repo kiko                   # the epic's in-scope pages on the run's stack
#   a11y.sh a11y-1700 --repo kiko import            # one page
#   a11y.sh a11y-1700 --viewport 1920x1080 import   # another window size (default 1440x900)
#   a11y.sh a11y-1700 --baseline a11y-master        # what the change adds/fixes vs. a run on master
# Routes default to the epic scope: home, import, graphs, sparql, repository, settings, license.
# --repo selects that repository first (pages like import/graphs/sparql render little without one); on a
# container stack create it first (REST is fine for setup). The page must show the state under test: content that
# only renders after an action (a dialog, an expanded tree) is not checked unless you check it interactively.
# --viewport changes which elements count as obscured/off-screen: compare runs only at the same viewport.
# --summary and --baseline only read existing reports (no browser): counts per level and per rule/level;
#   the baseline diff matches results by route + rule + level + xpath and lists NEW and GONE ones.
# Exit (check, --summary) 0 = no violations, 1 = violations found, 2 = the check itself failed / no report.
# Exit (--baseline) 0 = no new VIOLATION/FAIL, 1 = new violations, 2 = a report is missing.
set -uo pipefail
source "$(dirname "$0")/env.sh"

RUN_ID="${1:?usage: a11y.sh <run-id> [--repo ID] [--viewport WxH] [route...] | --summary | --baseline <run-id>}"; shift
REPO=-; VIEWPORT=1440x900; SUMMARY=0; BASELINE=""; ROUTES=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO="${2:?--repo needs an id}"; shift 2 ;;
    --viewport) VIEWPORT="${2:-}"; [[ "$VIEWPORT" =~ ^[0-9]+x[0-9]+$ ]] || { echo "--viewport needs WxH, e.g. 1920x1080" >&2; exit 64; }; shift 2 ;;
    --summary) SUMMARY=1; shift ;;
    --baseline) BASELINE="${2:?--baseline needs a run id}"; shift 2 ;;
    -*) echo "unknown arg $1" >&2; exit 64 ;;
    *) ROUTES+=("$1"); shift ;;
  esac
done
OUT="$EVIDENCE_ROOT/$RUN_ID/a11y"

if [[ $SUMMARY -eq 1 || -n "$BASELINE" ]]; then
  [[ $SUMMARY -eq 1 && -n "$BASELINE" ]] && { echo "--summary and --baseline are separate calls" >&2; exit 64; }
  BASE_REPORT=""; [[ -n "$BASELINE" ]] && BASE_REPORT="$EVIDENCE_ROOT/$BASELINE/a11y/a11y-report.json"
  python3 - "$OUT/a11y-report.json" "$BASE_REPORT" <<'PY'
import json, sys
from collections import Counter
def load(p):
    try:
        return json.load(open(p))
    except OSError:
        print(f"no report {p} (run the check first)", file=sys.stderr); sys.exit(2)
def flat(report):
    return [dict(r, route=p["route"]) for p in report for r in p["results"]]
cur = load(sys.argv[1])
if not sys.argv[2]:
    res = flat(cur)
    print("viewport:", ", ".join(sorted({p.get("viewport", "1440x900") for p in cur})))
    print("per route (VIOLATION/FAIL, other non-pass):")
    for p in cur:
        print(f"  /{p['route']:<20} {p['violations']:>4} {len(p['results']) - p['violations']:>5}")
    print("per level:")
    for lvl, n in Counter(r["level"] for r in res).most_common():
        print(f"  {n:>5}  {lvl}")
    print("per rule/level:")
    for (rule, lvl), n in Counter((r["rule"], r["level"]) for r in res).most_common():
        print(f"  {n:>5}  {lvl:<26} {rule}")
    sys.exit(1 if any(r["level"] == "VIOLATION/FAIL" for r in res) else 0)
base = load(sys.argv[2])
vp = lambda rep: sorted({p.get("viewport", "1440x900") for p in rep})
if vp(cur) != vp(base):
    print(f"WARN: viewports differ ({vp(cur)} vs baseline {vp(base)}): obscured-element results will differ")
routes = {p["route"] for p in cur} & {p["route"] for p in base}
key = lambda r: (r["route"], r["rule"], r["level"], r["xpath"])
c = {key(r): r for r in flat(cur) if r["route"] in routes}
b = {key(r): r for r in flat(base) if r["route"] in routes}
only = sorted({p["route"] for p in cur} ^ {p["route"] for p in base})
if only:
    print("WARN: routes in only one report (not compared):", ", ".join("/" + r for r in only))
new = [c[k] for k in c if k not in b]; gone = [b[k] for k in b if k not in c]
for title, rows in (("NEW", new), ("GONE", gone)):
    print(f"{title} ({len(rows)}):")
    for r in sorted(rows, key=lambda r: (r["level"] != "VIOLATION/FAIL", r["route"], r["rule"])):
        print(f"  /{r['route']} {r['level']} [{r['rule']}] {r['message']}\n      {r['xpath']}")
nv = sum(r["level"] == "VIOLATION/FAIL" for r in new); gv = sum(r["level"] == "VIOLATION/FAIL" for r in gone)
print(f"VIOLATION/FAIL: {nv} new, {gv} gone, {sum(k[2] == 'VIOLATION/FAIL' for k in c if k in b)} unchanged")
sys.exit(1 if nv else 0)
PY
  exit $?
fi

[[ ${#ROUTES[@]} -gt 0 ]] || ROUTES=("" import graphs sparql repository settings license)
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
export A11Y_VIEWPORT="$VIEWPORT"

mkdir -p "$OUT" "$STATE_DIR/runs"
touch "$STATE_DIR/runs/$RUN_ID"
echo "checking $WB_URL as run $RUN_ID (repo: $REPO, viewport: $VIEWPORT)"
node "$(dirname "$0")/a11y-check.cjs" "$WB_URL" "$REPO" "$OUT" "${ROUTES[@]}"
rc=$?
echo "$OUT"
exit $rc
