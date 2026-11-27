# Login with OpenID (Keycloak)

With GraphDB configured for OpenID, the login page shows "Login with OpenID" (alone, or under the username /
password form when the local login stays on). It redirects to the identity provider; after the provider's login
the browser comes back to the Workbench logged in, on the page it was sent to the login from. Logout ends the
provider session too and comes back to `/login?r=<page>`. Works the same under a context path.

## Sub-features

- `oidc-login` "Login with OpenID" → Keycloak form → back on page `r`, logged in as the token's user.
- `oidc-logout` Logout → Keycloak end-session → `/login?r=<page>`; the next "Login with OpenID" asks for the
  password again.
- `oidc-with-form` local form and OpenID button on one login page (`oidc-up --with-form`).
- `oidc-context` all of the above under `--context /graphdb`, no request outside the prefix.
- `oidc-two-tabs` logout in one tab moves the other tab to the login page with the same login card layout.

## How to get to it (user POV)

- Any page while security is on → `/login` → "Login with OpenID".
- Header user menu → Logout.

## Driving it with verify-workbench

Preconditions:

- A container stack, plain or `--context /graphdb`, then `$V/scripts/security.sh $RID oidc-up` (add
  `--with-form` to keep the local login form). It starts Keycloak `verify-wb-$RID-keycloak` on the docker bridge
  address (`http://172.17.0.1:<8180-8279>`, the same URL for the browser and for GraphDB in its container),
  creates realm `verify`, public PKCE client `graphdb` (redirect `<run URL>/*`) with an audience mapper and user
  admin / verify-oidc, restarts GraphDB with `-Dgraphdb.auth.methods=basic,openid` (`basic,gdb,openid` with
  `--with-form`) and `-Dgraphdb.auth.openid.{issuer,client_id,username_claim=preferred_username,auth_flow=code,token_type=access}`,
  and turns security on. ~25 s. `security.sh $RID status` shows the issuer and Keycloak; `security.sh $RID login`
  prints the sequence below.

Proven sequences (`PW="$V/scripts/pw.sh $RID"`), on a plain and a `/graphdb` stack:

- **Login.** `$PW open @/sparql` → `Page URL` `…/login?r=%2Fsparql` →
  `$PW wait 'role=button[name="Login with OpenID"]'` → click it → `$PW wait '#kc-login'` (`Page URL` on
  `172.17.0.1:<port>/realms/verify/…/auth?…client_id=graphdb`) → `$PW fill '#username' admin` →
  `$PW fill '#password' verify-oidc` → `$PW click '#kc-login'` → `$PW wait '.onto-user-menu-toggle'` → back on
  `…/sparql`, user menu shows `admin` (GraphDB maps the token's `preferred_username` to the local admin).
- **Logout.** `$PW click '.onto-user-menu-toggle'` → `$PW click 'role=button[name="Logout"]'` →
  `$PW wait 'role=button[name="Login with OpenID"]'` → `…/login?r=%2Fsparql`. Proof the provider session ended:
  click "Login with OpenID" again → Keycloak shows `#kc-login` (no silent login).
- **Context path.** Same sequences on a `--context /graphdb` stack (`…/graphdb/login?r=%2Fgraphs` →
  `…/graphdb/graphs`), then `$V/scripts/check-paths.sh $RID` → `OK no request left …/graphdb/` (WARNs:
  `env.json` 500, `authenticated-user` 401 before login — expected).
- **Two tabs.** Log in, `$PW tab-new @/import`, log out in tab 1 → both tabs on the login page; compare
  `.login-card` `getBoundingClientRect()` and the `onto-layout` class per tab (seen: both `hide-navbar`, card
  `340,274,600,173` in each) and screenshot each tab.
- Undo: `security.sh $RID oidc-down` (removes Keycloak, restarts GraphDB without the auth options; security
  stays on) or `cleanup.sh --run-id $RID`, which removes the Keycloak container with the stack.

## Gotchas

- The local admin's form login is off with `oidc-up` (methods `basic,openid`): `security.sh` falls back to basic
  auth for its REST calls. Use `--with-form` to drive both logins; then target the form button by
  `[data-test="submit-btn"]`, not by its "Login" text.
- Keycloak's state lives in its container: after a reboot `docker start verify-wb-$RID-keycloak` brings the realm
  back; the issuer URL (and port) is in `~/.cache/verify-workbench/state/stacks/$RID/oidc.env`.
- Return page with two tabs (seen on master 4.0.0-TR19, plain stack): tabs on `/sparql` and `/import`, logout in
  the `/import` tab → the `/sparql` tab lands on `/login?r=%2Fimport` and the logging-out tab on `/login?r=%2F`;
  re-login from the first tab opens `/import`. With local users each tab keeps its own page. The OpenID logout
  stores the return page in shared browser storage (GDB-15059); report it as an observation for that area.
- OpenID flow code: `packages/api/src/services/domain/security/openid/`,
  `packages/api/src/services/domain/security/auth-strategies/openid-auth-strategy.ts` (flow, logout),
  `packages/api/src/services/utils/routing-utils.ts`.
