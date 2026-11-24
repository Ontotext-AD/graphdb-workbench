#!/usr/bin/env bash
# Isolated verification stack per run: a throwaway GraphDB container serving the built dist/ of one checkout
# (graphdb.workbench.home), optionally behind an nginx context path. No dev servers, no shared ports.
# Usage:
#   container.sh up      --run-id ID [--tree PATH] [--context /graphdb] [--no-build] [--license FILE | --no-license]
#                        [--heap SIZE] [--java-opts '<opts>']
#   container.sh rebuild --run-id ID [--no-build]   # build + re-stage dist/ into the running stack, then reload
#   container.sh restart --run-id ID [--heap SIZE] [--java-opts '<opts>']
#                        # restart the run's containers (also after a reboot), keeping the data; --heap /
#                        # --java-opts replace the recorded values
#   container.sh down    --run-id ID
#   container.sh url     --run-id ID                # prints the workbench URL of the run
#   --run-id     lowercase letters, digits and '-' (up refuses others: the id names the run's docker objects).
#   --tree       checkout to verify (default: git toplevel of $PWD). Must be a checkout of this repo; use a worktree
#                (up WARNs on a main checkout: the build rewrites its dist/).
#   --context    serve under a context path through nginx, the way a reverse-proxied deployment does.
#   --no-build   reuse the tree's existing dist/ (e.g. after a manual `npm run build`).
#   --license    GraphDB license file. Default: $VERIFY_WB_LICENSE, else e2e-tests/fixtures/graphdb.license of the
#                tree, else of the main checkout (git-ignored; the same file docker-compose-test.yaml mounts).
#                No license found -> FAIL. After start the license must be valid, or `up` fails.
#   --no-license run GraphDB without a license on purpose (header shows "No valid license"). GraphDB 12 creates
#                repositories, but every query and update on them fails with 500 "No license was set".
#   --heap       GraphDB max heap (-Xmx), e.g. 4g. Default: $VERIFY_WB_HEAP, else 4g (2g ran out with ~5 repositories plus e2e imports).
#   --java-opts  extra JVM options (-D/-X, space-separated) placed after the stack's own, so they win. Recorded in
#                the run: rebuild and restart keep them.
# Image: docker-registry.ontotext.com/graphdb:$GDB_VERSION, GDB_VERSION read from the tree's .env
# (override with VERIFY_WB_GDB_VERSION, e.g. a locally built 12.0-SNAPSHOT image).
# Data lives in the container: restart keeps it, `down` removes everything.
# up creates the run's evidence dir and prints it. Exit codes: 3 no port, 4 GraphDB not ready / license rejected,
# 5 build or dist problem, 6 pull failed, 7 compose failed, 8 wrong dist served, 64 usage, 66 bad tree/license.
set -uo pipefail
source "$(dirname "$0")/env.sh"
source "$(dirname "$0")/stack-lib.sh"

action="${1:?usage: container.sh up|rebuild|restart|down|url --run-id ID [...]}"; shift
RUN_ID=""; TREE=""; CONTEXT=""; BUILD=1; LICENSE="${VERIFY_WB_LICENSE:-}"; NO_LICENSE=0
HEAP=""; EXTRA_OPTS=""; EXTRA_SET=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-id) RUN_ID="$2"; shift 2 ;;
    --tree) TREE="$2"; shift 2 ;;
    --context) CONTEXT="/${2#/}"; CONTEXT="${CONTEXT%/}"; shift 2 ;;
    --no-build) BUILD=0; shift ;;
    --license) LICENSE="$2"; shift 2 ;;
    --no-license) NO_LICENSE=1; shift ;;
    --heap) HEAP="$2"; shift 2 ;;
    --java-opts) EXTRA_OPTS="$2"; EXTRA_SET=1; shift 2 ;;
    *) echo "unknown arg $1" >&2; exit 64 ;;
  esac
done
[[ -n "$RUN_ID" ]] || { echo "--run-id is required" >&2; exit 64; }
[[ -z "$HEAP" || "$HEAP" =~ ^[0-9]+[kKmMgG]$ ]] || { echo "--heap wants a JVM size like 4g, got '$HEAP'" >&2; exit 64; }
[[ "$EXTRA_OPTS" != *$'\n'* ]] || { echo "--java-opts must be one line" >&2; exit 64; }
PROJECT="$(run_project "$RUN_ID")"
STACK_DIR="$STATE_DIR/stacks/$RUN_ID"
RUN_STATE="$STATE_DIR/runs/$RUN_ID"
LOG="$STACK_DIR/prepare.log"

compose() { docker compose -p "$PROJECT" -f "$STACK_DIR/compose.yml" "$@"; }
state_get() { sed -n "s/^$1=//p" "$RUN_STATE" 2>/dev/null; }
# Keys other helpers add to the record (cluster.sh) survive a rewrite.
save_state() {
  local kept; kept="$(grep -E '^(CLUSTER|PROXY|IMAGE|BUNDLED_UI|NODE_URLS)=' "$RUN_STATE" 2>/dev/null)"
  { echo "MODE=container"; echo "WB_URL=$WB_URL"; echo "GDB_URL=$WB_URL"; echo "TREE=$TREE"; echo "PROJECT=$PROJECT"
    echo "CONTEXT=$CONTEXT"; echo "HEAP=$HEAP"; echo "JAVA_OPTS=$EXTRA_OPTS"; [[ -n "$kept" ]] && echo "$kept"; } > "$RUN_STATE.tmp"
  mv "$RUN_STATE.tmp" "$RUN_STATE"
}
load_container_run() {
  [[ -f "$RUN_STATE" ]] && grep -q '^MODE=container' "$RUN_STATE" || { echo "no container stack for run $RUN_ID" >&2; exit 1; }
  TREE="$(state_get TREE)"; WB_URL="$(state_get WB_URL)"; CONTEXT="$(state_get CONTEXT)"
  [[ -n "$HEAP" ]] || HEAP="$(state_get HEAP)"; HEAP="${HEAP:-4g}"
  [[ $EXTRA_SET -eq 1 ]] || EXTRA_OPTS="$(state_get JAVA_OPTS)"
  touch "$LOG"
}

# All JVM options live in an argfile next to dist/ (GDB_JAVA_OPTS=@/wb/jvm.args): `restart` rewrites it and
# restarts the same container, so heap and options change without losing data. The argfile comes after the
# image's own options on the java command line, so these win. Never print it (options may carry secrets).
write_jvm_args() {
  local opt opts=() f="$STACK_DIR/wb/jvm.args"
  read -r -a opts <<<"$EXTRA_OPTS"
  mkdir -p "$STACK_DIR/wb"
  {
    echo "-Xmx$HEAP"
    [[ "$(state_get BUNDLED_UI)" == 1 ]] || echo "-Dgraphdb.workbench.home=/wb/dist"   # cluster.sh --bundled-ui
    echo "-Dgraphdb.workbench.importDirectory=/wb/import/"
    echo "-Dgraphdb.stats.default=disabled"
    echo '"-Dgraphdb.jsonld.whitelist=https://w3c.github.io/json-ld-api/tests/*"'
    [[ -n "$CONTEXT" ]] && echo "-Dgraphdb.external-url=$WB_URL/"
    [[ -f "$STACK_DIR/graphdb.license" ]] && echo "-Dgraphdb.license.file=/license/graphdb.license"
    for opt in "${opts[@]}"; do
      opt="${opt//\\/\\\\}"; echo "\"${opt//\"/\\\"}\""
    done
  } > "$f"
  chmod 644 "$f"
}

# Prove the served UI is this tree's build: the root-config bundle name is content-hashed.
check_served() {
  local bundle; bundle="$(grep -oE 'main\.[a-f0-9]+\.js' "$TREE/dist/index.html" | head -1)"
  if [[ -n "$bundle" ]] && [[ "$(http_code "$WB_URL/$bundle")" != 200 ]]; then
    echo "FAIL: $WB_URL/ does not serve $TREE/dist ($bundle not found)" >&2; exit 8
  fi
}

wait_ready() {
  local i
  for ((i = 0; i < 180; i += 2)); do
    [[ "$(http_code "$WB_URL/rest/info/version")" == 200 ]] && break
    [[ -n "$(compose ps -q --status exited graphdb)" ]] && break   # crashed on start: fail now, not in 3 minutes
    sleep 2
  done
  [[ "$(http_code "$WB_URL/rest/info/version")" == 200 ]] || { echo "FAIL: GraphDB not ready" >&2; compose logs --tail 30 graphdb >&2; exit 4; }
}

# Valid license -> one line; rejected -> FAIL. expiryDate is absent, an ISO date or epoch millis, by version.
check_license() {
  local lic; lic="$(curl -s -m 5 "$WB_URL/rest/graphdb-settings/license")"
  if [[ ! -f "$STACK_DIR/graphdb.license" ]]; then
    echo "license: none - repository queries and updates fail with 500 'No license was set'"; return
  fi
  jq -e '.valid == true' <<<"$lic" >/dev/null 2>&1 \
    || { echo "FAIL: GraphDB rejected the license: $(jq -r '.message // empty' <<<"$lic" 2>/dev/null || echo "$lic")" >&2; exit 4; }
  jq -r '"license: \(.productType // .product // "?"), " + (if .expiryDate == null then "no expiry"
           elif (.expiryDate | type) == "number" then "expires \(.expiryDate / 1000 | floor | todate | .[0:10])"
           else "expires \(.expiryDate | tostring | .[0:10])" end)' <<<"$lic"
}

case "$action" in
  url)
    [[ -f "$RUN_STATE" ]] && grep -q '^WB_URL=' "$RUN_STATE" || { echo "no container stack for run $RUN_ID" >&2; exit 1; }
    state_get WB_URL; exit 0 ;;
  down)
    if [[ -f "$STACK_DIR/compose.yml" ]]; then
      echo "removing stack $PROJECT"
      compose down -v --remove-orphans 2>&1 | tail -n 3
    fi
    rm -rf "$STACK_DIR"; exit 0 ;;
  rebuild)
    load_container_run
    [[ $BUILD -eq 1 ]] && { check_writable; build_tree; }
    stage; check_served
    echo "RESTAGED: $WB_URL (reload the page)"; exit 0 ;;
  restart)
    load_container_run
    [[ -f "$STACK_DIR/compose.yml" ]] || { echo "FAIL: no compose file in $STACK_DIR" >&2; exit 1; }
    write_jvm_args
    echo "restarting GraphDB of $PROJECT (heap $HEAP${EXTRA_OPTS:+, extra java opts})"
    # Sidecars the run started next to its stack (label verify-wb.run=<rid>, e.g. Keycloak) first, then every
    # service of the project (nginx of a context stack, cluster nodes and proxy): after a reboot all are Exited.
    for c in $(docker ps -a --filter "label=verify-wb.run=$RUN_ID" --filter status=exited --format '{{.Names}}'); do
      echo "starting sidecar $c"; docker start "$c" >/dev/null
    done
    compose restart -t 20 >>"$LOG" 2>&1 || { echo "FAIL: docker compose restart, see $LOG" >&2; exit 7; }
    save_state
    wait_ready; check_served; check_license
    echo "READY: $WB_URL"; exit 0 ;;
  up) require_run_id "$RUN_ID" ;;
  *) echo "unknown action $action" >&2; exit 64 ;;
esac

HEAP="${HEAP:-${VERIFY_WB_HEAP:-4g}}"
[[ "$HEAP" =~ ^[0-9]+[kKmMgG]$ ]] || { echo "VERIFY_WB_HEAP wants a JVM size like 4g, got '$HEAP'" >&2; exit 64; }
command -v docker >/dev/null || { echo "FAIL: docker not on PATH" >&2; exit 127; }
command -v jq >/dev/null || { echo "FAIL: jq not on PATH" >&2; exit 127; }
resolve_tree
[[ $BUILD -eq 1 ]] && check_writable
if [[ $NO_LICENSE -eq 1 ]]; then LICENSE=""; else find_license ", or --no-license for GraphDB Free"; fi

GDB_VERSION="${VERIFY_WB_GDB_VERSION:-$(sed -n 's/^GDB_VERSION=//p' "$TREE/.env" 2>/dev/null | tr -d '[:space:]')}"
[[ -n "$GDB_VERSION" ]] || { echo "FAIL: no GDB_VERSION in $TREE/.env (set VERIFY_WB_GDB_VERSION)" >&2; exit 66; }
IMAGE="docker-registry.ontotext.com/graphdb:$GDB_VERSION"
pull_image "$IMAGE"

# Re-running `up` for the same run replaces its stack.
[[ -f "$STACK_DIR/compose.yml" ]] && compose down -v --remove-orphans >/dev/null 2>&1
grep -q '^MODE=container' "$RUN_STATE" 2>/dev/null && rm -f "$RUN_STATE"   # no stale keys of the replaced stack
mkdir -p "$STACK_DIR" "$STATE_DIR/runs" "$EVIDENCE_ROOT/$RUN_ID"
touch "$LOG"
echo "run-id=$RUN_ID tree=$TREE image=$IMAGE context=${CONTEXT:-/} heap=$HEAP license=${LICENSE:-none} (log: $LOG)"
echo "evidence: $EVIDENCE_ROOT/$RUN_ID"

[[ $BUILD -eq 1 ]] && build_tree
stage
# The license goes through graphdb.license.file: the conf dir moved from /opt/graphdb/home/conf to
# /usr/share/graphdb/conf in 12.0.0-TR21, and the property works with images on either side of that change.
LICENSE_VOL=""
rm -f "$STACK_DIR/graphdb.license"
if [[ -n "$LICENSE" ]]; then
  cp "$LICENSE" "$STACK_DIR/graphdb.license"
  LICENSE_VOL="      - $STACK_DIR/graphdb.license:/license/graphdb.license:ro"
fi

# Port choice and `compose up` (which binds it) run under one lock (see free_port in env.sh).
# A port taken outside the lock (another docker project starting) can still race: move on to the next one.
exec 9>"$STATE_DIR/port.lock"; flock 9
PORT=7210
for attempt in 1 2 3; do
  PORT="$(free_port "$PORT")" || { echo "FAIL: no free port in 7210-7299" >&2; exit 3; }
  WB_URL="http://localhost:$PORT${CONTEXT}"
  GDB_PORTS="    ports: ['$PORT:7200']"; [[ -n "$CONTEXT" ]] && GDB_PORTS=""
  write_jvm_args

  # workbench.home is not :ro - GraphDB calls createDirectories() on it and fails on a read-only mount.
  cat > "$STACK_DIR/compose.yml" <<YML
services:
  graphdb:
    image: $IMAGE
    environment:
      GDB_JAVA_OPTS: '@/wb/jvm.args'
$GDB_PORTS
    volumes:
      - $STACK_DIR/wb:/wb
$LICENSE_VOL
YML
  if [[ -n "$CONTEXT" ]]; then
    cat > "$STACK_DIR/nginx.conf" <<NGINX
server {
    listen 80;
    location $CONTEXT/ {
        proxy_pass http://graphdb:7200/;
        proxy_set_header Host \$http_host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        client_max_body_size 100M;
    }
    # Anything outside the context path is a bug in the app (an absolute URL that ignores the base):
    # answer 404 loudly instead of redirecting it away.
    location / { return 404 "outside context path $CONTEXT\n"; }
}
NGINX
    cat >> "$STACK_DIR/compose.yml" <<YML
  nginx:
    image: nginx:1.27-alpine
    ports: ['$PORT:80']
    volumes:
      - $STACK_DIR/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [graphdb]
YML
  fi

  from="$(wc -l < "$LOG")"
  compose up -d >>"$LOG" 2>&1 && break
  if [[ $attempt -lt 3 ]] && tail -n +"$((from + 1))" "$LOG" | grep -q 'port is already allocated'; then
    echo "port $PORT was taken meanwhile - trying the next one"
    compose down -v --remove-orphans >/dev/null 2>&1; PORT=$((PORT + 1)); continue
  fi
  echo "FAIL: docker compose up, see $LOG" >&2; tail -n 20 "$LOG" >&2; exit 7
done
flock -u 9
save_state

wait_ready
check_served
check_license
echo "READY: $WB_URL"
