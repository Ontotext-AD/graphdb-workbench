#!/usr/bin/env bash
# GraphDB cluster per run: N GraphDB nodes (all serving the built dist/ of one checkout, staged as container.sh
# does), optionally an external cluster proxy in front, cluster created over REST and a leader elected.
# Usage:
#   cluster.sh up     --run-id ID [--nodes 3] [--proxy] [--tree PATH] [--no-build] [--gdb-version V]
#                     [--bundled-ui] [--license FILE] [--heap SIZE] [--java-opts '<opts>']
#   cluster.sh status --run-id ID     # every node's view: address, nodeState, term (from /rest/cluster/group/status)
#   cluster.sh url    --run-id ID     # workbench URL of the run (proxy, else node1)
#   cluster.sh nodes  --run-id ID     # one line per node: <name> <host URL>
#   --nodes        cluster size, 1-9 (default 3). Nodes are node1..nodeN inside the stack, each published on its
#                  own host port; the UI's cluster page shows them as nodeN:7300.
#   --proxy        add an external cluster proxy (cluster-proxy -g http://node1:7200,...); the run's URL (pw.sh
#                  `@/`, drive.sh) is then the proxy, which serves the same dist/. Without it: node1.
#   --gdb-version  GraphDB image tag (default: $VERIFY_WB_GDB_VERSION, else GDB_VERSION from the tree's .env).
#                  10.x and later; the proxy launcher path is read from the image.
#   --bundled-ui   serve the image's own Workbench instead of the tree's dist/ (no build, no staging). Needed for
#                  10.x images (10.7.0): they cannot serve a 4.x dist/ (406 for /resources/*, the page stays on
#                  "loading").
#   --heap         max heap of each node (default: $VERIFY_WB_HEAP, else 2g; 1g OOMs on creating a repository).
#                  The proxy gets 512m.
#   --run-id, --license, --no-build, --java-opts, --tree: as container.sh up (license by path; --java-opts go to every node).
# The nodes share a generated graphdb.auth.token.secret (required: the nodes sign their RPC with it).
# Teardown: cleanup.sh --run-id ID (removes the whole compose project). Rebuild the UI with
# container.sh rebuild --run-id ID (every node and the proxy serve the same staged dist/).
# Exit codes: as container.sh up, plus 9 cluster creation failed / no leader.
set -uo pipefail
source "$(dirname "$0")/env.sh"
source "$(dirname "$0")/stack-lib.sh"

action="${1:?usage: cluster.sh up|status|url|nodes --run-id ID [...]}"; shift
RUN_ID=""; TREE=""; BUILD=1; BUNDLED=0; LICENSE="${VERIFY_WB_LICENSE:-}"; NODES=3; PROXY=0; GDB_VERSION="${VERIFY_WB_GDB_VERSION:-}"
HEAP=""; EXTRA_OPTS=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-id) RUN_ID="$2"; shift 2 ;;
    --tree) TREE="$2"; shift 2 ;;
    --nodes) NODES="$2"; shift 2 ;;
    --proxy) PROXY=1; shift ;;
    --no-build) BUILD=0; shift ;;
    --bundled-ui) BUNDLED=1; BUILD=0; shift ;;
    --gdb-version) GDB_VERSION="$2"; shift 2 ;;
    --license) LICENSE="$2"; shift 2 ;;
    --heap) HEAP="$2"; shift 2 ;;
    --java-opts) EXTRA_OPTS="$2"; shift 2 ;;
    *) echo "unknown arg $1" >&2; exit 64 ;;
  esac
done
[[ -n "$RUN_ID" ]] || { echo "--run-id is required" >&2; exit 64; }
[[ "$NODES" =~ ^[1-9]$ ]] || { echo "--nodes wants 1-9, got '$NODES'" >&2; exit 64; }
HEAP="${HEAP:-${VERIFY_WB_HEAP:-2g}}"
[[ "$HEAP" =~ ^[0-9]+[kKmMgG]$ ]] || { echo "--heap wants a JVM size like 2g, got '$HEAP'" >&2; exit 64; }
[[ "$EXTRA_OPTS" != *$'\n'* ]] || { echo "--java-opts must be one line" >&2; exit 64; }
PROJECT="$(run_project "$RUN_ID")"
STACK_DIR="$STATE_DIR/stacks/$RUN_ID"
RUN_STATE="$STATE_DIR/runs/$RUN_ID"
LOG="$STACK_DIR/prepare.log"

compose() { docker compose -p "$PROJECT" -f "$STACK_DIR/compose.yml" "$@"; }
# The cluster facts live in the stack dir: container.sh restart rewrites the run record with its own keys only.
CLUSTER_STATE="$STACK_DIR/cluster.env"
state_get() { sed -n "s/^$1=//p" "$CLUSTER_STATE" 2>/dev/null; }
need_cluster_run() {
  [[ -f "$RUN_STATE" && -f "$CLUSTER_STATE" ]] || { echo "no cluster for run $RUN_ID" >&2; exit 1; }
}

case "$action" in
  url) need_cluster_run; state_get WB_URL; exit 0 ;;
  nodes) need_cluster_run; state_get NODE_URLS | tr ' ' '\n' | awk -F'=' '{print $1, $2}'; exit 0 ;;
  status)
    need_cluster_run
    for nu in $(state_get NODE_URLS); do
      echo "${nu%%=*} sees: $(curl -s -m 5 "${nu#*=}/rest/cluster/group/status" \
        | jq -rc 'if type == "array" then map("\(.address)=\(.nodeState)/term\(.term)") | join(" ") else . end' 2>/dev/null || echo unreachable)"
    done
    exit 0 ;;
  up) require_run_id "$RUN_ID" ;;
  *) echo "unknown action $action" >&2; exit 64 ;;
esac

# --- up: the preflights, build and staging of container.sh up (stack-lib.sh) ------------------------------
command -v docker >/dev/null || { echo "FAIL: docker not on PATH" >&2; exit 127; }
command -v jq >/dev/null || { echo "FAIL: jq not on PATH" >&2; exit 127; }
resolve_tree
[[ $BUILD -eq 1 ]] && check_writable
find_license " (a cluster needs an Enterprise license)"
[[ -n "$GDB_VERSION" ]] || GDB_VERSION="$(sed -n 's/^GDB_VERSION=//p' "$TREE/.env" 2>/dev/null | tr -d '[:space:]')"
[[ -n "$GDB_VERSION" ]] || { echo "FAIL: no GDB_VERSION in $TREE/.env (pass --gdb-version)" >&2; exit 66; }
IMAGE="docker-registry.ontotext.com/graphdb:$GDB_VERSION"
pull_image "$IMAGE"

# The launcher dir differs by version (/opt/graphdb/dist/bin in 10.x, /usr/share/graphdb/bin in 12.x): the image's
# own entrypoint/cmd names the graphdb launcher; cluster-proxy sits next to it.
LAUNCHER="$(docker image inspect -f '{{json .Config.Entrypoint}} {{json .Config.Cmd}}' "$IMAGE" | grep -oE '"/[^"]*/bin/graphdb"' | head -1 | tr -d '"')"
[[ -n "$LAUNCHER" ]] || { echo "FAIL: cannot find the graphdb launcher in $IMAGE's entrypoint/cmd" >&2; exit 66; }
PROXY_BIN="$(dirname "$LAUNCHER")/cluster-proxy"

# Re-running `up` for the same run replaces its stack (also a single-node container.sh stack of the same id).
[[ -f "$STACK_DIR/compose.yml" ]] && compose down -v --remove-orphans >/dev/null 2>&1
mkdir -p "$STACK_DIR" "$STATE_DIR/runs" "$EVIDENCE_ROOT/$RUN_ID"
touch "$LOG"
echo "run-id=$RUN_ID tree=$TREE image=$IMAGE nodes=$NODES proxy=$([[ $PROXY -eq 1 ]] && echo yes || echo no) ui=$([[ $BUNDLED -eq 1 ]] && echo bundled || echo tree) heap=$HEAP/node license=$LICENSE (log: $LOG)"
echo "evidence: $EVIDENCE_ROOT/$RUN_ID"

[[ $BUILD -eq 1 ]] && build_tree
if [[ $BUNDLED -eq 1 ]]; then stage --no-dist; else stage; fi
cp "$LICENSE" "$STACK_DIR/graphdb.license"

# JVM options. jvm.args has container.sh's layout (so container.sh rebuild works on this run); the cluster-only
# options go in cluster.args. Both carry secrets: never print them.
write_args() {
  local opt opts=() secret
  read -r -a opts <<<"$EXTRA_OPTS"
  {
    echo "-Xmx$HEAP"
    [[ $BUNDLED -eq 1 ]] || echo "-Dgraphdb.workbench.home=/wb/dist"
    echo "-Dgraphdb.workbench.importDirectory=/wb/import/"
    echo "-Dgraphdb.stats.default=disabled"
    echo '"-Dgraphdb.jsonld.whitelist=https://w3c.github.io/json-ld-api/tests/*"'
    echo "-Dgraphdb.license.file=/license/graphdb.license"
    for opt in "${opts[@]}"; do opt="${opt//\\/\\\\}"; echo "\"${opt//\"/\\\"}\""; done
  } > "$STACK_DIR/wb/jvm.args"
  secret="$(head -c 24 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  echo "-Dgraphdb.auth.token.secret=$secret" > "$STACK_DIR/wb/cluster.args"
  { [[ $BUNDLED -eq 1 ]] || echo "-Dgraphdb.workbench.home=/wb/dist"; echo "-Dgraphdb.stats.default=disabled"
    echo "-Dgraphdb.auth.token.secret=$secret"; } > "$STACK_DIR/wb/proxy.args"
  chmod 644 "$STACK_DIR/wb/jvm.args" "$STACK_DIR/wb/cluster.args" "$STACK_DIR/wb/proxy.args"
}
write_args

# Node 1 is the compose service `graphdb` (network alias node1), so doctor.sh and container.sh find it the way
# they find a single-node stack's GraphDB.
svc() { [[ $1 -eq 1 ]] && echo graphdb || echo "node$1"; }

# Port choice and `compose up` under one lock (see free_port in env.sh).
exec 9>"$STATE_DIR/port.lock"; flock 9
for attempt in 1 2 3; do
  PORTS=(); p=7210
  for ((i = 0; i <= NODES; i++)); do
    p="$(free_port "$p")" || { echo "FAIL: no free port in 7210-7299" >&2; exit 3; }
    PORTS+=("$p"); p=$((p + 1))
  done
  # PORTS[0]: proxy (only with --proxy), PORTS[i]: node i.
  HOSTS=""; NODE_URLS=""
  {
    echo "services:"
    for ((i = 1; i <= NODES; i++)); do
      HOSTS+="${HOSTS:+,}http://node$i:7200"; NODE_URLS+="${NODE_URLS:+ }node$i=http://localhost:${PORTS[$i]}"
      cat <<YML
  $(svc "$i"):
    image: $IMAGE
    hostname: node$i
    networks: { default: { aliases: [node$i] } }
    environment:
      GDB_JAVA_OPTS: '@/wb/jvm.args @/wb/cluster.args -Dgraphdb.hostname=node$i'
    ports: ['${PORTS[$i]}:7200']
    volumes:
      - $STACK_DIR/wb:/wb
      - $STACK_DIR/graphdb.license:/license/graphdb.license:ro
YML
    done
    if [[ $PROXY -eq 1 ]]; then
      # GDB_HEAP_SIZE sets -Xms and -Xmx together: an -Xmx alone below the launcher's default -Xms kills the JVM.
      cat <<YML
  proxy:
    image: $IMAGE
    hostname: proxy
    entrypoint: ['$PROXY_BIN', '-g', '$HOSTS']
    environment:
      GDB_HEAP_SIZE: 512m
      GDB_JAVA_OPTS: '@/wb/proxy.args'
    ports: ['${PORTS[0]}:7200']
    volumes:
      - $STACK_DIR/wb:/wb
    depends_on: [$(for ((i = 1; i <= NODES; i++)); do printf '%s' "$(svc "$i")"; (( i < NODES )) && printf ', '; done)]
YML
    fi
  } > "$STACK_DIR/compose.yml"
  from="$(wc -l < "$LOG")"
  compose up -d >>"$LOG" 2>&1 && break
  if [[ $attempt -lt 3 ]] && tail -n +"$((from + 1))" "$LOG" | grep -q 'port is already allocated'; then
    echo "a port was taken meanwhile - retrying"; compose down -v --remove-orphans >/dev/null 2>&1; continue
  fi
  echo "FAIL: docker compose up, see $LOG" >&2; tail -n 20 "$LOG" >&2; exit 7
done
flock -u 9

NODE1="http://localhost:${PORTS[1]}"
WB_URL="$NODE1"; [[ $PROXY -eq 1 ]] && WB_URL="http://localhost:${PORTS[0]}"
# Record the run before waiting: a failed start must still be found by cleanup.sh. The run record has
# container.sh's keys (load_run, doctor, cleanup read it) plus the cluster facts, which cluster.env keeps too.
{ echo "WB_URL=$WB_URL"; echo "CLUSTER=$NODES"; echo "PROXY=$PROXY"; echo "IMAGE=$IMAGE"; echo "BUNDLED_UI=$BUNDLED"
  echo "NODE_URLS=$NODE_URLS"; } > "$CLUSTER_STATE"
{ echo "MODE=container"; echo "WB_URL=$WB_URL"; echo "GDB_URL=$WB_URL"; echo "TREE=$TREE"; echo "PROJECT=$PROJECT"
  echo "CONTEXT="; echo "HEAP=$HEAP"; echo "JAVA_OPTS=$EXTRA_OPTS"; tail -n +2 "$CLUSTER_STATE"; } > "$RUN_STATE"

wait_up() {   # <url> <service>
  local i
  for ((i = 0; i < 240; i += 2)); do
    [[ "$(http_code "$1/rest/info/version")" == 200 ]] && return 0
    [[ -n "$(compose ps -q --status exited "$2")" ]] && break
    sleep 2
  done
  echo "FAIL: $2 not ready at $1" >&2; compose logs --tail 30 "$2" 2>&1 | grep -v -- '-Dgraphdb' >&2; exit 4
}
for nu in $NODE_URLS; do i="${nu%%=*}"; i="${i#node}"; wait_up "${nu#*=}" "$(svc "$i")"; done
lic="$(curl -s -m 5 "$NODE1/rest/graphdb-settings/license")"
jq -e '.valid == true' <<<"$lic" >/dev/null 2>&1 \
  || { echo "FAIL: GraphDB rejected the license: $(jq -r '.message // empty' <<<"$lic" 2>/dev/null)" >&2; exit 4; }
echo "nodes up: $NODES; license: $(jq -r '.productType // .product // "?"' <<<"$lic")"

# POST /rest/cluster/config (OpenAPI /rest/api/workbench: "Create a GraphDB cluster", body ClusterRequest
# {nodes: [RPC addresses host:7300]}; the node answering creates it on all). Add/remove: /rest/cluster/config/node.
body="$(jq -nc --argjson n "$NODES" '{nodes: [range(1; $n + 1) | "node\(.):7300"]}')"
resp="$(curl -s -m 60 -w '\n%{http_code}' -X POST -H 'Content-Type: application/json' -d "$body" "$NODE1/rest/cluster/config")"
code="${resp##*$'\n'}"
[[ "$code" == 201 ]] || { echo "FAIL: POST /rest/cluster/config -> $code: ${resp%$'\n'*}" >&2; exit 9; }
echo "cluster created: $(jq -rc 'keys | join(" ")' <<<"${resp%$'\n'*}" 2>/dev/null)"

leader=""
for ((i = 0; i < 120; i += 2)); do
  st="$(curl -s -m 5 "$NODE1/rest/cluster/group/status")"
  leader="$(jq -r 'if type == "array" then map(select(.nodeState == "LEADER")) | .[0].address // empty else empty end' <<<"$st" 2>/dev/null)"
  followers="$(jq -r 'if type == "array" then map(select(.nodeState == "FOLLOWER")) | length else 0 end' <<<"$st" 2>/dev/null)"
  [[ -n "$leader" && "$followers" -eq $((NODES - 1)) ]] && break
  leader=""; sleep 2
done
[[ -n "$leader" ]] || { echo "FAIL: no leader with $((NODES - 1)) followers after 120s: $st" >&2; exit 9; }
echo "leader: $leader, followers: $followers"

if [[ $PROXY -eq 1 ]]; then
  wait_up "$WB_URL" proxy
  for ((i = 0; i < 60; i += 2)); do [[ "$(http_code "$WB_URL/proxy/ready")" == 200 ]] && break; sleep 2; done
  echo "proxy: $WB_URL/proxy/ready -> $(http_code "$WB_URL/proxy/ready")"
fi
bundle=""; [[ $BUNDLED -eq 1 ]] || bundle="$(grep -oE 'main\.[a-f0-9]+\.js' "$TREE/dist/index.html" | head -1)"
if [[ -n "$bundle" ]] && [[ "$(http_code "$WB_URL/$bundle")" != 200 ]]; then
  echo "FAIL: $WB_URL/ does not serve $TREE/dist ($bundle not found)" >&2; exit 8
fi
echo "nodes: $NODE_URLS"
echo "READY: $WB_URL"
