#!/usr/bin/env bash
# Isolated verification stack per run: a throwaway GraphDB container serving the built dist/ of one checkout
# (graphdb.workbench.home), optionally behind an nginx context path. No dev servers, no shared ports.
# Usage:
#   container.sh up      --run-id ID [--tree PATH] [--context /graphdb] [--no-build] [--license FILE | --no-license]
#   container.sh rebuild --run-id ID [--no-build]   # build + re-stage dist/ into the running stack, then reload
#   container.sh down    --run-id ID
#   container.sh url     --run-id ID                # prints the workbench URL of the run
#   --tree     checkout to verify (default: git toplevel of $PWD). Must be a checkout of this repo.
#   --context  serve under a context path through nginx, the way a reverse-proxied deployment does.
#   --no-build reuse the tree's existing dist/ (e.g. after a manual `npm run build`).
#   --license  GraphDB license file. Default: $VERIFY_WB_LICENSE, else e2e-tests/fixtures/graphdb.license of the
#              tree, else of the main checkout (git-ignored; the same file docker-compose-test.yaml mounts).
#              No license found -> FAIL. After start the license must be valid, or `up` fails.
#   --no-license  run GraphDB Free on purpose (header shows "No valid license").
# Image: docker-registry.ontotext.com/graphdb:$GDB_VERSION, GDB_VERSION read from the tree's .env
# (override with VERIFY_WB_GDB_VERSION). Data lives only inside the container: `down` removes everything.
set -uo pipefail
source "$(dirname "$0")/env.sh"

action="${1:?usage: container.sh up|rebuild|down|url --run-id ID [...]}"; shift
RUN_ID=""; TREE=""; CONTEXT=""; BUILD=1; LICENSE="${VERIFY_WB_LICENSE:-}"; NO_LICENSE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-id) RUN_ID="$2"; shift 2 ;;
    --tree) TREE="$2"; shift 2 ;;
    --context) CONTEXT="/${2#/}"; CONTEXT="${CONTEXT%/}"; shift 2 ;;
    --no-build) BUILD=0; shift ;;
    --license) LICENSE="$2"; shift 2 ;;
    --no-license) NO_LICENSE=1; shift ;;
    *) echo "unknown arg $1" >&2; exit 64 ;;
  esac
done
[[ -n "$RUN_ID" ]] || { echo "--run-id is required" >&2; exit 64; }
PROJECT="verify-wb-$(echo "$RUN_ID" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9-\n' '-')"
STACK_DIR="$STATE_DIR/stacks/$RUN_ID"
RUN_STATE="$STATE_DIR/runs/$RUN_ID"
LOG="$STACK_DIR/prepare.log"

compose() { docker compose -p "$PROJECT" -f "$STACK_DIR/compose.yml" "$@"; }

free_port() {
  local p
  for ((p = 7210; p < 7300; p++)); do
    ss -ltn 2>/dev/null | grep -qE "[:.]$p\b" || { echo "$p"; return; }
  done
  return 1
}

build_tree() {
  if [[ ! -d "$TREE/packages/workbench/node_modules" ]]; then
    echo "installing dependencies (npm run install:local) ..."
    (cd "$TREE" && npm run install:local) >>"$LOG" 2>&1 || { echo "FAIL: install:local, see $LOG" >&2; tail -n 30 "$LOG" >&2; exit 5; }
  fi
  echo "building (npm run build) ..."
  local s=$SECONDS
  (cd "$TREE" && npm run build) >>"$LOG" 2>&1 || { echo "FAIL: npm run build, see $LOG" >&2; tail -n 30 "$LOG" >&2; exit 5; }
  echo "built in $((SECONDS - s))s"
}

# The container never mounts the tree itself: snap docker cannot see /tmp (where agent worktrees live), and
# the build recreates dist/, which would orphan a bind mount of it. dist/ is synced into the run's stack dir
# instead (directory kept, contents replaced), so rebuild + page reload is enough - no container restart.
stage() {
  [[ -f "$TREE/dist/index.html" ]] || { echo "FAIL: $TREE/dist/index.html missing - build first or drop --no-build" >&2; exit 5; }
  mkdir -p "$STACK_DIR/wb/dist" "$STACK_DIR/wb/import"
  rsync -a --delete "$TREE/dist/" "$STACK_DIR/wb/dist/"
  rsync -a --delete "$TREE/e2e-tests/fixtures/graphdb-import/" "$STACK_DIR/wb/import/"
}

# Prove the served UI is this tree's build: the root-config bundle name is content-hashed.
check_served() {
  local bundle; bundle="$(grep -oE 'main\.[a-f0-9]+\.js' "$TREE/dist/index.html" | head -1)"
  if [[ -n "$bundle" ]] && [[ "$(http_code "$WB_URL/$bundle")" != 200 ]]; then
    echo "FAIL: $WB_URL/ does not serve $TREE/dist ($bundle not found)" >&2; exit 8
  fi
}

case "$action" in
  url)
    [[ -f "$RUN_STATE" ]] && grep -q '^WB_URL=' "$RUN_STATE" || { echo "no container stack for run $RUN_ID" >&2; exit 1; }
    sed -n 's/^WB_URL=//p' "$RUN_STATE"; exit 0 ;;
  down)
    if [[ -f "$STACK_DIR/compose.yml" ]]; then
      echo "removing stack $PROJECT"
      compose down -v --remove-orphans 2>&1 | tail -n 3
    fi
    rm -rf "$STACK_DIR"; exit 0 ;;
  rebuild)
    [[ -f "$RUN_STATE" ]] && grep -q '^MODE=container' "$RUN_STATE" || { echo "no container stack for run $RUN_ID" >&2; exit 1; }
    TREE="$(sed -n 's/^TREE=//p' "$RUN_STATE")"; WB_URL="$(sed -n 's/^WB_URL=//p' "$RUN_STATE")"
    [[ $BUILD -eq 1 ]] && build_tree
    stage; check_served
    echo "RESTAGED: $WB_URL (reload the page)"; exit 0 ;;
  up) ;;
  *) echo "unknown action $action" >&2; exit 64 ;;
esac

command -v docker >/dev/null || { echo "FAIL: docker not on PATH" >&2; exit 127; }
TREE="$(cd "${TREE:-$PWD}" && git rev-parse --show-toplevel 2>/dev/null)" \
  || { echo "FAIL: --tree / \$PWD is not inside a git checkout" >&2; exit 66; }
[[ -f "$TREE/webpack.config.prod.js" ]] || { echo "FAIL: $TREE is not a graphdb-workbench checkout" >&2; exit 66; }
if [[ $NO_LICENSE -eq 1 ]]; then
  LICENSE=""
else
  # The main checkout owns the git dir every worktree shares; REPO_ROOT is only the checkout running this script.
  MAIN_ROOT="$(dirname "$(git -C "$TREE" rev-parse --path-format=absolute --git-common-dir)")"
  if [[ -z "$LICENSE" ]]; then
    for f in "$TREE/e2e-tests/fixtures/graphdb.license" "$MAIN_ROOT/e2e-tests/fixtures/graphdb.license"; do
      [[ -f "$f" ]] && { LICENSE="$f"; break; }
    done
  fi
  [[ -n "$LICENSE" ]] || { echo "FAIL: no GraphDB license - put it at $MAIN_ROOT/e2e-tests/fixtures/graphdb.license (git-ignored), pass --license FILE / VERIFY_WB_LICENSE, or --no-license for GraphDB Free" >&2; exit 66; }
  LICENSE="$(realpath "$LICENSE")"; [[ -f "$LICENSE" ]] || { echo "FAIL: no license file $LICENSE" >&2; exit 66; }
fi

GDB_VERSION="${VERIFY_WB_GDB_VERSION:-$(sed -n 's/^GDB_VERSION=//p' "$TREE/.env" 2>/dev/null | tr -d '[:space:]')}"
[[ -n "$GDB_VERSION" ]] || { echo "FAIL: no GDB_VERSION in $TREE/.env (set VERIFY_WB_GDB_VERSION)" >&2; exit 66; }
IMAGE="docker-registry.ontotext.com/graphdb:$GDB_VERSION"

# Pull before anything slow, once per machine: parallel runs wait on the lock instead of pulling twice.
mkdir -p "$STATE_DIR"
{
  flock 8
  if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
    echo "pulling $IMAGE ..."
    docker pull -q "$IMAGE" >/dev/null || { echo "FAIL: cannot pull $IMAGE (docker login docker-registry.ontotext.com?)" >&2; exit 6; }
  fi
} 8>"$STATE_DIR/pull.lock"

# Re-running `up` for the same run replaces its stack.
[[ -f "$STACK_DIR/compose.yml" ]] && compose down -v --remove-orphans >/dev/null 2>&1
mkdir -p "$STACK_DIR" "$STATE_DIR/runs"
echo "run-id=$RUN_ID tree=$TREE image=$IMAGE context=${CONTEXT:-/} license=${LICENSE:-none} (log: $LOG)"

[[ $BUILD -eq 1 ]] && build_tree
stage
LICENSE_VOL=""
if [[ -n "$LICENSE" ]]; then
  cp "$LICENSE" "$STACK_DIR/graphdb.license"
  LICENSE_VOL="      - $STACK_DIR/graphdb.license:/opt/graphdb/home/conf/graphdb.license:ro"
fi

# Port choice and `compose up` (which binds it) run under one lock: parallel runs otherwise pick the same port.
exec 9>"$STATE_DIR/port.lock"; flock 9
PORT="$(free_port)" || { echo "FAIL: no free port in 7210-7299" >&2; exit 3; }
WB_URL="http://localhost:$PORT${CONTEXT}"
EXTERNAL_URL_OPT=""; [[ -n "$CONTEXT" ]] && EXTERNAL_URL_OPT="-Dgraphdb.external-url=$WB_URL/"
GDB_PORTS="    ports: ['$PORT:7200']"; [[ -n "$CONTEXT" ]] && GDB_PORTS=""

# workbench.home is not :ro - GraphDB calls createDirectories() on it and fails on a read-only mount.
cat > "$STACK_DIR/compose.yml" <<YML
services:
  graphdb:
    image: $IMAGE
    environment:
      GDB_JAVA_OPTS: >-
        -Xmx2g
        -Dgraphdb.workbench.home=/wb/dist
        -Dgraphdb.workbench.importDirectory=/wb/import/
        -Dgraphdb.stats.default=disabled
        $EXTERNAL_URL_OPT
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

compose up -d >>"$LOG" 2>&1 || { echo "FAIL: docker compose up, see $LOG" >&2; tail -n 20 "$LOG" >&2; exit 7; }
flock -u 9
{ echo "MODE=container"; echo "WB_URL=$WB_URL"; echo "GDB_URL=$WB_URL"; echo "TREE=$TREE"; echo "PROJECT=$PROJECT"; } > "$RUN_STATE"

for ((i = 0; i < 180; i += 2)); do
  [[ "$(http_code "$WB_URL/rest/info/version")" == 200 ]] && break
  [[ -n "$(compose ps -q --status exited graphdb)" ]] && break   # crashed on start: fail now, not in 3 minutes
  sleep 2
done
[[ "$(http_code "$WB_URL/rest/info/version")" == 200 ]] || { echo "FAIL: GraphDB not ready" >&2; compose logs --tail 30 graphdb >&2; exit 4; }
check_served
if [[ -n "$LICENSE" ]]; then
  lic="$(curl -s -m 5 "$WB_URL/rest/graphdb-settings/license")"
  grep -q '"valid":true' <<<"$lic" \
    || { echo "FAIL: GraphDB rejected $LICENSE: $(grep -oE '"message":"[^"]*"' <<<"$lic")" >&2; exit 4; }
  echo "license: $(grep -oE '"product":"[^"]*"' <<<"$lic" | cut -d'"' -f4), expires $(date -d @"$(($(grep -oE '"expiryDate":[0-9]+' <<<"$lic" | cut -d: -f2) / 1000))" +%F)"
fi
echo "READY: $WB_URL"
