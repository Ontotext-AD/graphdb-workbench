#!/usr/bin/env bash
# Interactive driving with the globally installed Playwright CLI (`npm i -g @playwright/cli`).
# Usage: pw.sh <run-id> <playwright-cli command | helper> [args...]
#   pw.sh 20261008-1700 open http://localhost:9000/repository     # starts session verify-wb-<run-id> (headless chrome)
#   pw.sh 20261008-1700 open --headed @/                          # visible window, the user can watch
#   pw.sh 20261008-1700 snapshot --filename=repos.yml              # ARIA tree with refs, saved as evidence
#   pw.sh 20261008-1700 click 'role=button[name="Create"]'
#   pw.sh 20261008-1700 screenshot --filename=03-created.png       # whole viewport
#   pw.sh 20261008-1700 screenshot '#wb-export' --filename=btn.png # one element (ref or selector), cropped
# `@/route` in any argument expands to the run's workbench URL. Anything not listed below goes to playwright-cli
# unchanged (`playwright-cli --help`): route/unroute, requests, console, press, localstorage-*, set-color-scheme, ...
# Helpers:
#   wait <selector> [ms]             wait until visible            wait-gone <selector> [ms]  until hidden/detached
#   wait-url <url-part> [ms]         wait until the page URL contains it (`@/sparql` works)
#   wait-fn '<js>' [ms]              wait until a page-side expression or `() => …` is truthy
#   js '<js>' [target]               page-side JS, raw result: an expression, statements (last value or `return`),
#                                    or a function (`el => …` with a target). Strings print unquoted.
#                                    `eval` takes the same input with playwright-cli's output.
#   run-code '<code>'                Playwright code: `async page => …`, or statements (wrapped as one)
#   nav <route>                      in-app navigation without reload (singleSpa.navigateToUrl), e.g. nav sparql
#   theme light|dark|os [light|dark] store the theme mode as the settings page does, reload, print what applies;
#                                    `os dark` also emulates the OS color scheme (OS-follow mode)
#   select-repo <id> [location]      select a repository as the header selector persists it, reload, read back
#   focus                            the focused element (shadow DOM aware), its :focus-visible and focus ring
#   tabwalk <n> [--shift]            press Tab n times for real; one focus line per press
#   css <selector> <prop> [:state]   computed value + the CSS rules that declare it (sheet:line, cascade order),
#                                    var() values resolved; :hover/:focus-visible/... forces that state first
#   errors                           console errors incl. uncaught page errors; removes the dev-stack webpack
#                                    error overlay (it blocks clicks) and prints its text
# Code that returns nothing prints `NOTE … returned undefined`.
# Every call is capped at VERIFY_WB_PW_TIMEOUT seconds (default 120; exit 124). Sessions idle-close after
# VERIFY_WB_PW_IDLE_MS (default 4 h); a call to a closed session re-opens it at the last URL and exits 75:
# browser storage (theme, selected repository) starts empty again, re-apply it and re-run the command.
# `open` on an open session restarts the browser (routes and storage dropped, WARN); navigate with goto or nav.
# playwright-cli does not wait for a selector to appear: after open/goto/route changes, `wait` (or snapshot and
# use refs) before clicking, or the click fails with 'does not match any elements'.
# Runs inside the run's evidence dir, so every snapshot/screenshot/console log lands there, not in the repo.
set -uo pipefail
source "$(dirname "$0")/env.sh"
HELPERS="$(cd "$(dirname "$0")/pw" && pwd)"

RUN_ID="${1:?usage: pw.sh <run-id> <playwright-cli command> [args...]}"; shift
[[ $# -gt 0 ]] || { echo "missing playwright-cli command" >&2; exit 64; }
command -v playwright-cli >/dev/null || { echo "playwright-cli not on PATH: npm i -g @playwright/cli" >&2; exit 127; }
export NO_UPDATE_NOTIFIER=1   # playwright-cli otherwise prints an "Update available" banner once a day
PW_TIMEOUT="${VERIFY_WB_PW_TIMEOUT:-120}"
SESSION="verify-wb-$RUN_ID"

OUT="$EVIDENCE_ROOT/$RUN_ID/playwright"
mkdir -p "$OUT" "$STATE_DIR/runs"
touch "$STATE_DIR/runs/$RUN_ID"   # lets cleanup.sh find this run's repositories and browser session
load_run "$RUN_ID"
LAST_URL_FILE="$OUT/.last-url"

cmd="$1"; shift; CMD="$cmd"
# `@/route` expands to the run's workbench URL (dev stack or container, with its context path).
args=(); for a in "$@"; do [[ "$a" == @/* ]] && a="$WB_URL/${a#@/}"; args+=("$a"); done; set -- "${args[@]}"

json() { node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' "$1"; }
usage() { echo "usage: pw.sh <run-id> $cmd $1" >&2; exit 64; }
set_args() { args=("$@"); }
# A function literal: `async …`, `function …`, `x => …`, `(a, b) => …`.
FN_RE='^[[:space:]]*(async[[:space:]]|function[[:space:](]|[A-Za-z_$][A-Za-z0-9_$]*[[:space:]]*=>|\([^)]*\)[[:space:]]*=>)'
is_fn() { [[ "$1" =~ $FN_RE ]]; }
is_expr() { node -e 'try { new (Object.getPrototypeOf(async function () {}).constructor)("return (" + process.argv[1] + "\n)"); } catch (e) { process.exit(1); }' "$1"; }
# run-code with a helper file from scripts/pw/: async page => (<file>)(page, <json args>), raw output.
helper() { cmd=run-code; set_args "async page => ($(cat "$HELPERS/$1.js"))(page, $2)" --raw; RAW_UNQUOTE=1; }
RAW_UNQUOTE=0; NOTE_UNDEFINED=0

case "$cmd" in
  click|dblclick|fill|hover|select|check|uncheck|drag|drop)
    [[ -n "${1:-}" ]] || usage "<target> …   (the target is empty: pass a snapshot ref or a selector)" ;;
  wait|wait-gone)
    [[ -n "${1:-}" ]] || usage "<selector> [timeout-ms]"
    state=visible; [[ "$cmd" == "wait-gone" ]] && state=hidden
    cmd=run-code; set_args "async page => { await page.locator($(json "$1")).first().waitFor({state: '$state', timeout: ${2:-15000}}); return 'ok'; }" --raw; RAW_UNQUOTE=1 ;;
  wait-url)
    [[ -n "${1:-}" ]] || usage "<url-part> [timeout-ms]"
    cmd=run-code; RAW_UNQUOTE=1
    set_args "async page => { await page.waitForURL(u => u.href.includes($(json "$1")), {timeout: ${2:-15000}}); return page.url(); }" --raw ;;
  wait-fn)
    [[ -n "${1:-}" ]] || usage "'<js expression | () => …>' [timeout-ms]"
    fn="$1"; is_fn "$fn" || fn="() => ($fn)"
    cmd=run-code; set_args "async page => { await page.waitForFunction($fn, undefined, {timeout: ${2:-15000}}); return 'ok'; }" --raw; RAW_UNQUOTE=1 ;;
  js|eval)
    [[ -n "${1:-}" ]] || usage "'<expression | statements | function>' [target]"
    code="$1"; shift
    # Statements: with `return`/`await` they become an async function body, otherwise eval() returns the value
    # of the last statement (`a = 1; a + 1` -> 2).
    if ! is_fn "$code" && ! is_expr "$code"; then
      if [[ "$code" =~ (^|[^A-Za-z0-9_$])(return|await)([^A-Za-z0-9_$]|$) ]]; then code="async () => { $code
}"; else code="() => eval($(json "$code"))"; fi
    fi
    if [[ "$cmd" == js ]]; then RAW_UNQUOTE=1; [[ " $* " == *" --raw "* ]] || set -- "$@" --raw; fi
    cmd=eval; NOTE_UNDEFINED=1; set_args "$code" "$@" ;;
  run-code)
    if [[ -n "${1:-}" && "$1" != --* ]] && ! is_fn "$1"; then
      code="$1"; shift; set_args "async page => { $code
}" "$@"
    fi
    NOTE_UNDEFINED=1 ;;
  nav)
    [[ -n "${1:-}" ]] || usage "<route>   (e.g. sparql, graphs?repositoryId=x)"
    url="$1"; [[ "$url" == http* ]] || url="$WB_URL/${url#/}"
    cmd=run-code; RAW_UNQUOTE=1
    set_args "async page => { await page.evaluate(u => window.singleSpa.navigateToUrl(u), $(json "$url")); await page.waitForURL(u => u.href.startsWith($(json "${url%%\?*}")), {timeout: 15000}); return page.url(); }" --raw ;;
  theme)
    mode="${1:-}"; os="${2:-}"
    [[ "$mode" =~ ^(light|dark|os)$ && "$os" =~ ^(|light|dark)$ ]] || usage "light|dark|os [light|dark]"
    [[ "$mode" == os ]] && mode=system
    helper theme "{\"wbUrl\": $(json "$WB_URL"), \"mode\": \"$mode\", \"os\": \"$os\"}" ;;
  select-repo)
    [[ -n "${1:-}" ]] || usage "<repository-id> [location]"
    helper select-repo "{\"wbUrl\": $(json "$WB_URL"), \"id\": $(json "$1"), \"location\": $(json "${2:-}")}" ;;
  focus)
    cmd=run-code; RAW_UNQUOTE=1
    set_args "async page => page.evaluate($(json "($(cat "$HELPERS/describe-focus.js"))()"))" --raw ;;
  tabwalk)
    [[ "${1:-}" =~ ^[0-9]+$ ]] || usage "<n> [--shift]"
    shift_tab=false; [[ "${2:-}" == "--shift" ]] && shift_tab=true
    helper tabwalk "{\"n\": $1, \"shift\": $shift_tab, \"describe\": $(json "$(cat "$HELPERS/describe-focus.js")")}" ;;
  css)
    [[ -n "${1:-}" && -n "${2:-}" ]] || usage "<selector> <css-property> [:hover|:focus|:focus-visible|:active ...]"
    states="$(printf '%s\n' "${@:3}" | sed -n 's/^:\{0,1\}\([a-z-]\{1,\}\)$/"\1"/p' | paste -sd, -)"
    helper css "{\"selector\": $(json "$1"), \"prop\": $(json "$2"), \"states\": [$states]}" ;;
  errors)
    "$0" "$RUN_ID" console error || exit $?
    echo "### Webpack overlay"
    helper errors "{}" ;;
  open)
    # `open` on a live session starts a fresh browser: routes and browser storage are gone. `goto` keeps them.
    playwright-cli list 2>/dev/null | grep -A1 -E "^- $SESSION:" | grep -q 'status: open' \
      && echo "WARN $SESSION is already open: open restarts the browser (routes, theme, selected repository are dropped); goto navigates and keeps them" >&2
    # Chrome (installed system browser) and a long idle timeout, unless the caller picked them.
    [[ " $* " == *" --browser"* ]] || set_args --browser=chrome "${args[@]}"
    [[ " $* " == *" --idle-timeout"* ]] || set_args "--idle-timeout=${VERIFY_WB_PW_IDLE_MS:-14400000}" "${args[@]}" ;;
esac

errf="$(mktemp)"; trap 'rm -f "$errf"' EXIT
out="$(cd "$OUT" && timeout -k 5 "$PW_TIMEOUT" playwright-cli -s="$SESSION" "$cmd" "${args[@]}" 2>"$errf")"; rc=$?

if [[ $rc -eq 124 || $rc -eq 137 ]]; then
  printf '%s\n' "$out"; cat "$errf" >&2
  echo "FAIL pw.sh $cmd: no answer after ${PW_TIMEOUT}s, aborted (VERIFY_WB_PW_TIMEOUT=<s> raises it). The step may still run in the browser; the session stays usable." >&2
  exit 124
fi
if [[ "$cmd" != open ]] && grep -q "is not open" <<<"$out$(cat "$errf")"; then
  url="$(cat "$LAST_URL_FILE" 2>/dev/null)"; url="${url:-$WB_URL/}"
  echo "WARN session $SESSION was closed (idle timeout or browser exit); re-opening it at $url" >&2
  "$0" "$RUN_ID" open "$url" >/dev/null || { echo "FAIL re-open failed; run: pw.sh $RUN_ID open $url" >&2; exit 1; }
  echo "WARN re-opened with empty browser storage: re-apply theme/select-repo, then re-run: pw.sh $RUN_ID $CMD …" >&2
  exit 75
fi

page_url="$(sed -n 's/^- Page URL: //p' <<<"$out" | tail -n 1)"
[[ -n "$page_url" ]] && printf '%s\n' "$page_url" >"$LAST_URL_FILE"

if [[ $RAW_UNQUOTE -eq 1 && $rc -eq 0 && "$out" == \"* ]]; then
  node -e 'let v; try { v = JSON.parse(process.argv[1]); } catch (e) { v = process.argv[1]; } console.log(typeof v === "string" ? v : process.argv[1]);' "$out"
elif [[ -n "$out" ]]; then
  printf '%s\n' "$out"
fi
cat "$errf" >&2
if [[ $NOTE_UNDEFINED -eq 1 && $rc -eq 0 ]] && [[ -z "$out" || "$out" == undefined || "$out" == *$'### Result\nundefined'* \
    || ( "$out" == "### Ran Playwright code"* && "$out" != *"### Result"* ) ]]; then
  echo "NOTE $CMD: the code returned undefined; \`return\` the value you want to see" >&2
fi
exit $rc
