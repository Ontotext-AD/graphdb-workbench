# Login with local users

With security on, every page opens the login page (`<base>/login?r=<page>`) until the user logs in with a
GraphDB username and password; the login returns to page `r`. The header shows the user menu (username, My
settings, Logout); Logout ends the session, shows the "Signed out" toast and opens `/login?r=<page>`. With free
access on, an anonymous user works without logging in, sees only the repositories free access grants and a
"Login" button in the header. Logging out in one tab logs out every tab of the browser.

## Sub-features

- `login-local` username/password login returns to page `r`; a wrong password gets `POST rest/login` 401 and
  a short-lived toast "Wrong credentials!" (`.toast-message`).
- `logout` Logout from the user menu opens `/login?r=<page>` with the "Signed out" toast.
- `free-access` anonymous user: header "Login" button, repository selector lists only the granted repositories,
  pages the authorities do not cover show "You have no permission to access this functionality".
- `free-access-off` an anonymous user is sent to `/login?r=<page>` again.
- `two-tabs` logout in one tab moves the other tab to its own `/login?r=<its page>`; logging in there returns
  it to its own page.

## How to get to it (user POV)

- Any page while security is on and nobody is logged in → `/login`.
- Header user menu (`admin ▾`) → Logout.
- Setup → Users and Access → Security / Free access toggles (the admin's view; `security.sh` sets the same
  through REST).

## Driving it with verify-workbench

Preconditions:

- A container stack (`$V/scripts/container.sh up --run-id $RID`), plain or `--context /graphdb`. Never the dev
  stack: its GraphDB is the user's, and typing its admin password is refused there.
- Create repositories before security goes on: `repo.sh` sends no credentials (401 once security is on).
- Security on: `$V/scripts/security.sh $RID on`. `$V/scripts/security.sh $RID login` prints the login page, the
  local admin (admin / root) and the `pw.sh` lines below for that run.

Proven sequences (`PW="$V/scripts/pw.sh $RID"`):

- **Login.** `$PW open @/login` → `$PW wait '#username'` → `$PW fill '#username' admin` →
  `$PW fill '#password' root` → `$PW click '[data-test="submit-btn"]'` → `$PW wait '.onto-user-menu-toggle'`.
  Read-back: `$PW eval "document.querySelector('.onto-user-menu-toggle .username').textContent" --raw` →
  `"admin"`; `Page URL` is page `r`.
- **Logout.** `$PW click '.onto-user-menu-toggle'` → `$PW click 'role=button[name="Logout"]'` →
  `$PW wait '#username'` → `Page URL` `…/login?r=%2F<page>`, toast "Signed out".
- **Free access.** `security.sh $RID free-access <repo-id>` (repo id → `READ_REPO_<id>`; pass
  `WRITE_REPO_<id>` for writes) → anonymous `$PW goto @/sparql` → header
  `onto-user-login button` ("Login"; `role=button[name="Login"]` matches nothing: the icon is part of its name), the
  repository selector (`role=button[name="Choose repository"]`) lists only `<repo-id>`; `@/repository` shows the
  no-permission alert. `security.sh $RID free-access off` → `$PW goto @/sparql` lands on `/login?r=%2Fsparql`.
- **Two tabs.** Log in, `$PW goto @/graphs`, `$PW tab-new @/import`, wait for `.onto-user-menu-toggle`; log out
  in tab 1 → tab 0 is on `/login?r=%2Fgraphs` by itself (no reload). Log in from tab 0
  (`$PW tab-select 0`, then the login lines) → tab 0 back on `/graphs`. Read the state of both tabs at once:
  `$PW run-code 'async page => (await Promise.all(page.context().pages().map(async (p, i) => i + " " + p.url() + " form=" + await p.locator("#username").isVisible() + " menu=" + await p.locator(".onto-user-menu-toggle").isVisible()))).join(" || ")'`.
  Layout proof: `.login-card` `getBoundingClientRect()` and `onto-layout` class (`hide-navbar`, no `loading`)
  in each tab, plus a screenshot per tab.
- Reset at the end: `security.sh $RID off` (or `cleanup.sh --run-id $RID`).

## Gotchas

- Selectors: `#username`, `#password`, `[data-test="submit-btn"]` (the login page's stable ids). The ARIA forms
  `role=textbox[name="Username"]` / `role=textbox[name="Password"]` also match; `[name="Password"]` matches
  nothing (the inputs have no `name` attribute) and `#wb-login-username` is the legacy id (times out).
- `security.sh off` needs the admin: it logs in through `POST /rest/login` (basic auth when the login form is
  off). An anonymous `POST /rest/security false` answers 401.
- Security, free access and users live in the container: `container.sh restart` keeps them, `cleanup.sh`
  drops them. A Cypress security spec leaves security on for every later spec on the same run: `security.sh
  $RID off` before reusing the stack.
- `free-access off` keeps the stored authorities (`GET /rest/security/free-access` still lists them); only
  `enabled` changes.
- Bound every two-tab command with `timeout 60`: a tab that was on a Workbench page when the other tab logged
  out, or that sits on the login page when the other tab logs in, sometimes stops answering (`tab-list` shows it
  `[crashed]`; `eval`/`run-code` on it hang, `reload`/`goto` in it stay on "Loading..." while a new tab at the same
  URL renders). Seen 3 times on master 4.0.0-TR19 (twice with `/sparql`, once on `/login` after re-login in the
  other tab). GDB-15863 (master `f5c0deb2b`) made other tabs reload once instead of twice; no crash in the
  two-tab sequence after it. Keep the timeout; if it happens again, report it and close the session
  (`pw.sh $RID close`).
- Login, logout and return-URL code: `packages/api/src/services/utils/routing-utils.ts`,
  `packages/workbench/src/app/app.component.ts` (two-tab logout, GDB-15509),
  `packages/workbench/src/app/services/repository-url-sync.service.ts` (return URL vs. repository in the URL,
  GDB-15772). A change there gets the Login, Logout and Two tabs sequences.
