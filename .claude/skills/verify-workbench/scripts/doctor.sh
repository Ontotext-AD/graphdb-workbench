#!/usr/bin/env bash
# Read-only health check: is this instance worth driving? Exit 0 = OK (warnings allowed), 1 = do not drive.
# Usage: doctor.sh [--run-id ID] [--tree PATH]
#   --run-id ID  check the container stack of that run (container.sh up) instead of the shared dev stack;
#                an ID with no run record FAILs. Container checks: page, served dist/, GraphDB container alive,
#                no OutOfMemoryError since start, license state, repository states; on a cluster run (cluster.sh)
#                a leader seen from every node.
#   --tree PATH  checkout the dev stack must be serving (default: git toplevel of $PWD)
# Dev stack checks include the webpack dev servers' compile state (a "Compiled with problems" overlay covers the
# page) and npm-linked ontotext-yasgui-web-component. Every run lists verify-wb-* containers and stack dirs that
# no run record owns.
set -uo pipefail
source "$(dirname "$0")/env.sh"

RUN_ID=""; TREE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-id) RUN_ID="$2"; shift 2 ;;
    --tree) TREE="$2"; shift 2 ;;
    *) echo "unknown arg $1" >&2; exit 64 ;;
  esac
done

fail=0
ok()   { echo "OK    $*"; }
warn() { echo "WARN  $*"; }
bad()  { echo "FAIL  $*"; fail=1; }

if [[ -n "$RUN_ID" ]]; then
  if [[ ! -f "$STATE_DIR/runs/$RUN_ID" ]]; then
    bad "no run '$RUN_ID' recorded - start it with container.sh up --run-id $RUN_ID, or drop --run-id to check the dev stack"
    echo "      recorded runs: $(ls -1 "$STATE_DIR/runs" 2>/dev/null | tr '\n' ' ')"
    exit 1
  fi
  load_run "$RUN_ID"
fi

ver_json="$(curl -s -m 5 "$GDB_URL/rest/info/version" || true)"
if [[ -n "$ver_json" ]]; then ok "GraphDB $GDB_URL: $ver_json"; else bad "GraphDB not answering at $GDB_URL"; fi

sec="$(curl -s -m 5 "$GDB_URL/rest/security" || true)"
if [[ "$sec" == "false" ]]; then ok "security disabled (recipes assume this)"
else bad "security is '$sec' - recipes assume security OFF; log-in flows are not scripted"; fi

# Compile state of a webpack dev server, from its live-reload websocket: on connect it sends the overlay config,
# then ok / warnings / errors for the last compilation. Prints: ok | errors N MSG | warnings N MSG | unknown.
dev_compile_state() {   # <ws url>
  node --input-type=module -e '
    const url = process.argv.at(-1);
    const done = (s) => { console.log(s); process.exit(0); };
    setTimeout(() => done("unknown"), 3000);
    let showWarnings = true;
    const first = (d) => { const m = Array.isArray(d) ? d[0] : d; const t = typeof m === "string" ? m : m?.message ?? "";
      return t.replace(/\x1b\[[0-9;]*m/g, "").split("\n").find((l) => l.trim()) ?? ""; };
    try {
      const ws = new WebSocket(url, { headers: { Origin: new URL(url.replace(/^ws/, "http")).origin } });
      ws.onerror = () => done("unknown");
      ws.onmessage = (e) => {
        const { type, data } = JSON.parse(e.data);
        if (type === "overlay") showWarnings = data === true || data?.warnings === true;
        else if (type === "ok" || type === "still-ok") done("ok");
        else if (type === "errors") done(`errors ${data.length} ${first(data)}`);
        else if (type === "warnings") done(showWarnings ? `warnings ${data.length} ${first(data)}` : "ok");
      };
    } catch { done("unknown"); }
  ' "$1" 2>/dev/null || echo unknown
}

if [[ "$RUN_MODE" == container ]]; then
  ok "container stack of run $RUN_ID serving $RUN_TREE"
  # GraphDB answers 406 to a page request without Accept: text/html.
  c="$(curl -s -o /dev/null -m 5 -H 'Accept: text/html' -w '%{http_code}' "$WB_URL/")"; [[ "$c" == 200 ]] && ok "$WB_URL/ -> 200" || bad "$WB_URL/ -> $c (container.sh up --run-id $RUN_ID)"
  rec() { sed -n "s/^$1=//p" "$STATE_DIR/runs/$RUN_ID"; }
  if [[ "$(rec BUNDLED_UI)" == 1 ]]; then
    ok "serves the image's own Workbench (cluster.sh --bundled-ui), not $RUN_TREE/dist"
  else
    bundle="$(grep -oE 'main\.[a-f0-9]+\.js' "$RUN_TREE/dist/index.html" 2>/dev/null | head -1)"
    [[ -n "$bundle" && "$(http_code "$WB_URL/$bundle")" == 200 ]] && ok "serves this tree's dist/ ($bundle)" \
      || warn "served bundle != $RUN_TREE/dist ($bundle) - run container.sh rebuild --run-id $RUN_ID"
  fi
  # Cluster run (cluster.sh): every node must see a leader.
  for nu in $(rec NODE_URLS); do
    st="$(curl -s -m 5 "${nu#*=}/rest/cluster/group/status")"
    leader="$(jq -r 'if type == "array" then (map(select(.nodeState == "LEADER")) | .[0].address // empty) else empty end' <<<"$st" 2>/dev/null)"
    followers="$(jq -r 'if type == "array" then map(select(.nodeState == "FOLLOWER")) | length else 0 end' <<<"$st" 2>/dev/null)"
    [[ -n "$leader" ]] && ok "cluster ${nu%%=*}: leader $leader, $followers follower(s)" \
      || bad "cluster ${nu%%=*}: no leader (${st:0:80}) - cluster.sh status --run-id $RUN_ID; a re-election takes ~30 s"
  done
  [[ "$WB_URL" =~ ^https?://[^/]+/.+ ]] && ok "context path /${WB_URL#*://*/} - drive with pw.sh, check with check-paths.sh (no Cypress)"

  # GraphDB kills itself on OutOfMemoryError (the container exits); a heap that is nearly full hangs it first.
  project="$(sed -n 's/^PROJECT=//p' "$STATE_DIR/runs/$RUN_ID")"
  cid="$(docker ps -aq --filter "label=com.docker.compose.project=$project" --filter label=com.docker.compose.service=graphdb 2>/dev/null | head -1)"
  heap="$(sed -n 's/^HEAP=//p' "$STATE_DIR/runs/$RUN_ID")"; heap="${heap:-4g}"
  if [[ -z "$cid" ]]; then
    bad "no GraphDB container for $project - container.sh up --run-id $RUN_ID"
  else
    read -r cstate started <<<"$(docker inspect -f '{{.State.Status}} {{.State.StartedAt}}' "$cid")"
    [[ "$cstate" == running ]] && ok "GraphDB container $cstate (heap $heap)" \
      || bad "GraphDB container $cstate - container.sh restart --run-id $RUN_ID [--heap 4g]"
    oom="$(docker logs --since "$started" "$cid" 2>&1 | grep -m1 -oE 'OutOfMemoryError[^"]*' | head -c 120)"
    [[ -n "$oom" ]] && bad "GraphDB hit $oom since its start (heap $heap) - container.sh restart --run-id $RUN_ID --heap 4g"
  fi

  lic="$(curl -s -m 5 "$GDB_URL/rest/graphdb-settings/license")"
  if [[ "$(jq -r '.valid' <<<"$lic" 2>/dev/null)" == true ]]; then
    ok "license $(jq -r '"\(.productType // .product // "?"), " + (if .expiryDate == null then "no expiry" elif (.expiryDate|type) == "number" then "expires \(.expiryDate / 1000 | floor | todate | .[0:10])" else "expires \(.expiryDate | tostring | .[0:10])" end)' <<<"$lic")"
  else
    warn "no valid license ($(jq -r '.message // "?"' <<<"$lic" 2>/dev/null | head -c 80)) - repository queries and updates fail with 500 'No license was set'"
  fi
fi

if [[ "$RUN_MODE" != container ]]; then
for u in "$WB_URL/" http://localhost:9002/workbenchApp.js http://localhost:9003/ontotext-workbench-api.js; do
  c="$(http_code "$u")"; [[ "$c" == 200 ]] && ok "$u -> 200" || bad "$u -> $c (run launch.sh)"
done
want="$(cd "${TREE:-$PWD}" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null)"
have="$(dev_stack_tree)"
if [[ -z "$have" ]]; then warn "cannot tell which checkout serves :9000 (process not ours?)"
elif [[ -n "$want" && "$have" != "$want" ]]; then bad "dev stack on :9000 serves $have, not $want - verify this tree with container.sh up"
else ok "dev stack serves $have"; fi

# A failed compilation still serves 200 everywhere; only the overlay (which blocks every click) shows it.
dev_origin="$(echo "$WB_URL" | grep -oE '^https?://[^/]+' | sed 's/^http/ws/')"
for w in "$dev_origin/ws" ws://localhost:9002/ng-cli-ws ws://localhost:9003/ws; do
  st="$(dev_compile_state "$w")"
  case "$st" in
    ok) ok "compiled cleanly ($w)" ;;
    errors*) read -r _ n msg <<<"$st"; bad "$n compile error(s) on $w: $msg - the page shows the error overlay; fix the build or its linked packages" ;;
    warnings*) read -r _ n msg <<<"$st"; warn "$n compile warning(s) on $w: $msg - the warning overlay covers the page" ;;
    *) warn "compile state unknown ($w)" ;;
  esac
done

# An npm-linked yasgui is someone's local build: it may be stale or missing its dist/.
for l in "${have:-${want:-$REPO_ROOT}}"/packages/*/node_modules/ontotext-yasgui-web-component; do
  [[ -L "$l" ]] || continue
  t="$(readlink -f "$l")"; main="$(jq -r '.main // "dist/index.cjs.js"' "$t/package.json" 2>/dev/null)"
  if [[ -f "$t/$main" ]]; then warn "ontotext-yasgui-web-component is npm-linked (${l#"${have:-${want:-$REPO_ROOT}}"/}) -> $t - its local build is what you see"
  else bad "ontotext-yasgui-web-component is npm-linked -> $t, which has no $main - build it there (npm run build) or npm unlink"; fi
done

checkout_ver="$(node -p "require('$REPO_ROOT/package.json').version" 2>/dev/null)"
served_ver="$(curl -s -m 5 "$WB_URL/" | grep -oE 'workbenchApp\.js\?v=[^"]+' | head -1 | cut -d= -f2)"
if [[ "$served_ver" == "$checkout_ver" ]]; then ok "served version $served_ver matches checkout"
else warn "served version '$served_ver' != checkout '$checkout_ver' - stack started before the checkout changed; source edits hot-reload, webpack/config changes need a restart"; fi

if [[ -f "$STATE_DIR/stack.pid" ]] && kill -0 "$(cat "$STATE_DIR/stack.pid")" 2>/dev/null; then
  ok "stack owned by verify-workbench (pgid $(cat "$STATE_DIR/stack.pid"))"
else
  warn "stack NOT started by verify-workbench - shared with the user; drive only verify-* repositories, never stop it"
fi
fi

# Repository states: container stacks - every repository; the shared GraphDB - only verify-* ones.
repos="$(curl -s -m 10 "$GDB_URL/rest/repositories" 2>/dev/null)"
if jq -e 'type == "array"' <<<"$repos" >/dev/null 2>&1; then
  filter='.[]'; [[ "$RUN_MODE" == container ]] || filter='.[] | select(.id | startswith("verify-"))'
  odd="$(jq -r "$filter | select(.state != \"RUNNING\" and .state != \"INACTIVE\") | \"\(.id)=\(.state)\"" <<<"$repos" | tr '\n' ' ')"
  n="$(jq -r "[$filter] | length" <<<"$repos")"
  [[ "$RUN_MODE" == container ]] && what=repositories || what="verify-* repositories"
  [[ -z "$odd" ]] && ok "$n $what RUNNING or INACTIVE" \
    || warn "repositories not RUNNING/INACTIVE: $odd- a failed start shows in the repository list; restart or recreate them"
fi

[[ "$RUN_MODE" != container ]] && leftovers="$(jq -r '.[]?.id | select(startswith("verify-"))' <<<"$repos" 2>/dev/null | tr '\n' ' ')"
[[ "$RUN_MODE" == container ]] || { [[ -z "$leftovers" ]] && ok "no leftover verify-* repositories" || warn "leftover repositories: $leftovers (cleanup.sh --all-repos)"; }

if [[ -x "$E2E_DIR/node_modules/.bin/cypress" ]]; then ok "cypress $("$E2E_DIR/node_modules/.bin/cypress" --version 2>/dev/null | head -1)"
else warn "cypress missing (only drive.sh needs it) - run: npm run install:local"; fi
if command -v playwright-cli >/dev/null; then
  ok "playwright-cli $(playwright-cli --version 2>/dev/null)"
  sessions="$(playwright-cli list 2>/dev/null | grep -oE 'verify-wb-[^ :]+' | sort -u | tr '\n' ' ')"
  [[ -n "$sessions" ]] && warn "open browser sessions: $sessions(close via cleanup.sh --run-id <id>)"
else
  warn "playwright-cli missing - interactive driving unavailable: npm i -g @playwright/cli"
fi
command -v google-chrome >/dev/null && ok "google-chrome present" || warn "google-chrome missing; drive.sh falls back to electron"

pgrep -f "Cypress.*--run-project.*$E2E_DIR" >/dev/null && warn "another Cypress run is active on this repo - do not run two drives in parallel"

# Machine-wide inventory: stacks of every session share this machine's memory and ports.
if command -v docker >/dev/null; then
  inv="$(docker ps -a --filter name=^verify-wb- 2>/dev/null \
    --format '{{.Names}}|{{.Status}}|{{.Label "com.docker.compose.project"}}|{{.Label "verify-wb.run"}}' | sort)"
  if [[ -n "$inv" ]]; then
    echo "INFO  verify-wb containers on this machine:"
    while IFS='|' read -r name status proj run; do
      owner="$(docker_owner "$name" "$proj" "$run")"
      [[ -n "$owner" && ( -e "$STATE_DIR/runs/$owner" || -e "$STATE_DIR/stacks/$owner" ) ]] || owner=""
      line="$name  [$status]  run ${owner:-NONE}"
      if [[ -z "$owner" ]]; then warn "  $line - no run record owns it (hand-written or half-cleaned stack); remove it only if it is yours"
      elif [[ "$status" =~ ^Up.*(day|week|month) ]]; then warn "  $line - running for $(sed -E 's/^Up //' <<<"$status"); forgotten? cleanup.sh --run-id $owner if it is yours"
      elif [[ "$status" != Up* ]]; then warn "  $line - not running; cleanup.sh --run-id $owner if it is yours"
      else echo "      $line"; fi
    done <<<"$inv"
  fi
fi
for d in "$STATE_DIR"/stacks/*; do
  [[ -d "$d" && ! -f "$STATE_DIR/runs/$(basename "$d")" ]] && warn "stack dir without a run record: $d (being started, hand-written or half-cleaned)"
done

echo "evidence root: $EVIDENCE_ROOT"
exit $fail
