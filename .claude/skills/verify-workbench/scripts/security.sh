#!/usr/bin/env bash
# Security of a run's container stack (container.sh up): local users, free access and an OpenID (Keycloak) login.
# Never the dev stack: its GraphDB is the user's.
# Usage:
#   security.sh <run-id> status                  # security, free access, auth methods, the run's Keycloak
#   security.sh <run-id> on | off                # POST /rest/security true|false (off logs in as admin first)
#   security.sh <run-id> free-access <repo-id|AUTHORITY>...   # enable free access: a repo id grants READ_REPO_<id>,
#                                                # an AUTHORITY (READ_REPO_x, WRITE_REPO_x, ...) is passed as is
#   security.sh <run-id> free-access off
#   security.sh <run-id> login                   # print the login page, credentials and a pw.sh login/logout sequence
#   security.sh <run-id> oidc-up [--with-form]   # Keycloak sidecar verify-wb-<run-id>-keycloak (realm, public PKCE
#                                                # client, audience mapper, user), GraphDB restarted with the
#                                                # -Dgraphdb.auth.* OpenID options, security on. The login page
#                                                # shows only "Login with OpenID"; --with-form keeps the local
#                                                # username/password form next to it (methods basic,gdb,openid).
#   security.sh <run-id> oidc-down               # remove the Keycloak sidecar, restart GraphDB without those options
# Local admin: admin / root (the default of a throwaway container). OpenID user: admin / verify-oidc in Keycloak
# realm "verify", client "graphdb"; GraphDB maps it to the local admin by username.
# Keycloak listens on <docker0 address>:<free port 8180-8279> so the browser and GraphDB inside its container reach
# it at the same issuer URL; the stack dir records it (oidc.env). cleanup.sh --run-id removes the sidecar.
# Exit codes: 1 not a container run / REST call refused, 3 no free Keycloak port, 4 Keycloak not started or not
# ready, 64 usage; oidc-up/oidc-down pass on a failing container.sh restart's code.
set -uo pipefail
source "$(dirname "$0")/env.sh"

RUN_ID="${1:-}"; ACTION="${2:-}"
[[ -n "$RUN_ID" && -n "$ACTION" ]] || { echo "usage: security.sh <run-id> status|on|off|free-access ...|login|oidc-up|oidc-down" >&2; exit 64; }
shift 2
load_run "$RUN_ID"
[[ "$RUN_MODE" == container ]] || { echo "FAIL: run $RUN_ID has no container stack (container.sh up) - security.sh never touches the dev stack" >&2; exit 1; }
U="$WB_URL"
PROJECT="$(run_project "$RUN_ID")"
KC_NAME="$PROJECT-keycloak"
OIDC_ENV="$STATE_DIR/stacks/$RUN_ID/oidc.env"
ADMIN_USER=admin; ADMIN_PASS=root
REALM=verify; CLIENT=graphdb; OIDC_USER=admin; OIDC_PASS=verify-oidc
CONTAINER_SH="$(dirname "$0")/container.sh"

security_enabled() { curl -s -m 10 "$U/rest/security"; }
# POST JSON as admin (gdb_auth: a token, or basic auth when the login form is off). FAILs unless 2xx.
post_admin() {   # <path> <json>
  local code
  gdb_auth
  code="$(gcurl -s -m 30 -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d "$2" "$U$1")"
  [[ "$code" == 2* ]] || { echo "FAIL: POST $1 as $ADMIN_USER -> $code" >&2; exit 1; }
}

print_status() {
  local fa methods
  echo "run $RUN_ID: $U"
  echo "security: $(security_enabled)"
  fa="$(curl -s -m 10 "$U/rest/security/free-access")"
  echo "free access: $(jq -r '"\(.enabled)" + (if (.authorities | length) > 0 then " " + (.authorities | join(",")) else "" end)' <<<"$fa" 2>/dev/null || echo "$fa")"
  methods="$(curl -s -m 10 "$U/rest/security/all" | jq -r '[if .passwordLoginEnabled then "login form" else empty end,
      if .openIdEnabled then "openid (issuer \(.methodSettings.openid.issuer // "?"))" else empty end] | join(", ")' 2>/dev/null || true)"
  echo "login methods: ${methods:-?}"
  if [[ -f "$OIDC_ENV" ]]; then
    echo "keycloak: $KC_NAME $(docker inspect -f '{{.State.Status}}' "$KC_NAME" 2>/dev/null || echo missing), $(sed -n 's/^KC_URL=//p' "$OIDC_ENV") (admin console admin/admin)"
  else
    echo "keycloak: none (security.sh $RUN_ID oidc-up)"
  fi
}

print_login() {
  local pw=".claude/skills/verify-workbench/scripts/pw.sh $RUN_ID" all form openid
  all="$(curl -s -m 10 "$U/rest/security/all")"
  form="$(jq -r '.passwordLoginEnabled' <<<"$all")"; openid="$(jq -r '.openIdEnabled' <<<"$all")"
  echo "login page: $U/login   (security: $(jq -r '.enabled' <<<"$all"), login form: $form, OpenID: $openid)"
  if [[ "$form" == true ]]; then
    echo "local user: $ADMIN_USER / $ADMIN_PASS"
    echo "  $pw open @/login"
    echo "  $pw wait '#username'"
    echo "  $pw fill '#username' $ADMIN_USER"
    echo "  $pw fill '#password' $ADMIN_PASS"
    echo "  $pw click '[data-test=\"submit-btn\"]'"
    echo "  $pw wait '.onto-user-menu-toggle'   # logged in: the header shows the user menu"
    echo "logout:"
    echo "  $pw click '.onto-user-menu-toggle'"
    echo "  $pw click 'role=button[name=\"Logout\"]'"
    echo "  $pw wait '#username'   # back on /login?r=<page>"
  fi
  if [[ "$openid" == true ]]; then
    echo "OpenID user (Keycloak realm $REALM): $OIDC_USER / $OIDC_PASS"
    echo "  $pw open @/login"
    echo "  $pw wait 'role=button[name=\"Login with OpenID\"]'"
    echo "  $pw click 'role=button[name=\"Login with OpenID\"]'"
    echo "  $pw wait '#kc-login'   # Keycloak's own login form"
    echo "  $pw fill '#username' $OIDC_USER"
    echo "  $pw fill '#password' $OIDC_PASS"
    echo "  $pw click '#kc-login'"
    echo "  $pw wait '.onto-user-menu-toggle'"
    echo "logout (ends the Keycloak session too, back on /login?r=<page>):"
    echo "  $pw click '.onto-user-menu-toggle'"
    echo "  $pw click 'role=button[name=\"Logout\"]'"
    echo "  $pw wait 'role=button[name=\"Login with OpenID\"]'"
  fi
}

# Address that is the same for the host's browser and for a container: the docker bridge gateway.
host_addr() { ip -4 -o addr show docker0 2>/dev/null | awk '{sub(/\/.*/, "", $4); print $4; exit}'; }
kc() { docker exec "$KC_NAME" /opt/keycloak/bin/kcadm.sh "$@"; }
# kcadm, quiet on success; FAIL with its output otherwise. Prints stdout (an id with -i).
kc_q() {
  local out; out="$(kc "$@" 2>/dev/null)" && { echo "$out"; return; }
  echo "FAIL: kcadm.sh $1 $2: $(kc "$@" 2>&1 | tail -n 2)" >&2; exit 4
}

# Recorded JVM options of the run without any -Dgraphdb.auth.* (ours or a previous oidc-up's).
other_java_opts() {
  local o out=()
  for o in $(sed -n 's/^JAVA_OPTS=//p' "$STATE_DIR/runs/$RUN_ID"); do
    [[ "$o" == -Dgraphdb.auth.* ]] || out+=("$o")
  done
  echo "${out[*]:-}"
}

oidc_up() {
  command -v jq >/dev/null || { echo "FAIL: jq not on PATH" >&2; exit 127; }
  local addr port kc_url issuer origin cid i opts
  addr="$(host_addr)"; addr="${addr:-172.17.0.1}"
  origin="$(sed -E 's#^(https?://[^/]+).*#\1#' <<<"$U")"
  docker rm -f "$KC_NAME" >/dev/null 2>&1 || true
  # Same lock as container.sh: port choice and the container that binds it, together.
  exec 9>"$STATE_DIR/port.lock"; flock 9
  port="$(free_port 8180 8280)" || { echo "FAIL: no free Keycloak port in 8180-8279" >&2; exit 3; }
  kc_url="http://$addr:$port"; issuer="$kc_url/realms/$REALM"
  echo "starting $KC_NAME on $kc_url ..."
  # The verify-wb.run label is what cleanup.sh and container.sh restart know the run's sidecars by.
  docker run -d --name "$KC_NAME" --label "verify-wb.run=$RUN_ID" -p "$port:8080" \
    -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin -e "KC_HOSTNAME=$kc_url" \
    "${VERIFY_WB_KEYCLOAK_IMAGE:-quay.io/keycloak/keycloak:26.0}" start-dev >/dev/null \
    || { echo "FAIL: docker run $KC_NAME" >&2; exit 4; }
  flock -u 9
  printf 'KC_NAME=%s\nKC_URL=%s\nISSUER=%s\nREALM=%s\nCLIENT=%s\nOIDC_USER=%s\n' \
    "$KC_NAME" "$kc_url" "$issuer" "$REALM" "$CLIENT" "$OIDC_USER" > "$OIDC_ENV"
  for ((i = 0; i < 120; i += 2)); do
    [[ "$(http_code "$kc_url/realms/master")" == 200 ]] && break; sleep 2
  done
  [[ "$(http_code "$kc_url/realms/master")" == 200 ]] || { echo "FAIL: Keycloak not ready at $kc_url" >&2; docker logs --tail 20 "$KC_NAME" >&2; exit 4; }

  kc_q config credentials --server http://localhost:8080 --realm master --user admin --password admin >/dev/null
  kc_q create realms -s realm="$REALM" -s enabled=true -s sslRequired=NONE >/dev/null
  cid="$(kc_q create clients -r "$REALM" -i -s clientId="$CLIENT" -s publicClient=true -s standardFlowEnabled=true \
    -s directAccessGrantsEnabled=false \
    -s "redirectUris=[\"$U/*\"]" -s "webOrigins=[\"$origin\"]" \
    -s "attributes={\"post.logout.redirect.uris\":\"$U/*\",\"pkce.code.challenge.method\":\"S256\"}")" || exit
  # token_type=access: GraphDB checks that the access token's audience is its client id.
  kc_q create "clients/$cid/protocol-mappers/models" -r "$REALM" -s name=audience -s protocol=openid-connect \
    -s protocolMapper=oidc-audience-mapper \
    -s "config={\"included.client.audience\":\"$CLIENT\",\"access.token.claim\":\"true\",\"id.token.claim\":\"true\"}" >/dev/null
  kc_q create users -r "$REALM" -s username="$OIDC_USER" -s enabled=true -s email="$OIDC_USER@example.com" \
    -s emailVerified=true -s firstName=Verify -s lastName=User >/dev/null
  kc_q set-password -r "$REALM" --username "$OIDC_USER" --new-password "$OIDC_PASS" >/dev/null
  [[ "$(http_code "$issuer/.well-known/openid-configuration")" == 200 ]] || { echo "FAIL: realm $REALM not served at $issuer" >&2; exit 4; }
  docker exec "$(docker compose -p "$PROJECT" ps -q graphdb)" curl -sf -o /dev/null -m 5 "$issuer/.well-known/openid-configuration" 2>/dev/null \
    || echo "WARN: the GraphDB container could not fetch $issuer (no curl in the image, or a firewall between docker networks)"
  echo "keycloak: realm $REALM, public PKCE client $CLIENT (redirect $U/*), user $OIDC_USER"

  opts="$(other_java_opts) -Dgraphdb.auth.methods=$METHODS -Dgraphdb.auth.openid.issuer=$issuer"
  opts+=" -Dgraphdb.auth.openid.client_id=$CLIENT -Dgraphdb.auth.openid.username_claim=preferred_username"
  opts+=" -Dgraphdb.auth.openid.auth_flow=code -Dgraphdb.auth.openid.token_type=access"
  "$CONTAINER_SH" restart --run-id "$RUN_ID" --java-opts "${opts# }" || exit
  post_admin /rest/security true
  print_status
}

oidc_down() {
  docker rm -f "$KC_NAME" >/dev/null 2>&1 && echo "removed $KC_NAME" || echo "no $KC_NAME"
  rm -f "$OIDC_ENV"
  "$CONTAINER_SH" restart --run-id "$RUN_ID" --java-opts "$(other_java_opts)" || exit
}

case "$ACTION" in
  status) print_status ;;
  login) print_login ;;
  on) post_admin /rest/security true; echo "security: $(security_enabled)" ;;
  off) post_admin /rest/security false; echo "security: $(security_enabled)" ;;
  free-access)
    [[ $# -gt 0 ]] || { echo "usage: security.sh <run-id> free-access <repo-id|AUTHORITY>... | off" >&2; exit 64; }
    settings="$(curl -s -m 10 "$U/rest/security/free-access" | jq -c '.appSettings // {}')"
    if [[ "$1" == off ]]; then
      body="$(jq -nc --argjson s "$settings" '{enabled: false, authorities: [], appSettings: $s}')"
    else
      auths=(); for a in "$@"; do [[ "$a" =~ ^[A-Z_]+_REPO_ ]] && auths+=("$a") || auths+=("READ_REPO_$a"); done
      body="$(jq -nc --argjson s "$settings" '{enabled: true, authorities: $ARGS.positional, appSettings: $s}' --args "${auths[@]}")"
    fi
    post_admin /rest/security/free-access "$body"
    echo "free access: $(curl -s -m 10 "$U/rest/security/free-access" | jq -c '{enabled, authorities}')"
    [[ "$(security_enabled)" == true ]] || echo "WARN: security is off - free access applies only once it is on (security.sh $RUN_ID on)"
    ;;
  oidc-up)
    # basic: REST/scripts as admin; gdb: the Workbench login form; openid: the "Login with OpenID" button.
    METHODS=basic,openid
    [[ "${1:-}" == --with-form ]] && METHODS=basic,gdb,openid
    oidc_up ;;
  oidc-down) oidc_down ;;
  *) echo "unknown action $ACTION" >&2; exit 64 ;;
esac
