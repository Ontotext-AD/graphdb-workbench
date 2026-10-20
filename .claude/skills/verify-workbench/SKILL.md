---
name: verify-workbench
description: Drive the real GraphDB Workbench web UI the way a user does — against the shared dev stack (localhost:9000 + GraphDB :7200) or an isolated per-run GraphDB container serving one checkout's build (any worktree, optionally behind a /graphdb context path) — interactively with the global Playwright CLI or as replayable Cypress specs, keeping screenshot + REST read-back evidence. Use to prove a UI change works in the running app (repositories, import, SPARQL editor, graphs overview, navigation under a context path, …), not just in unit tests. Also for a quick screenshot of a workbench page, or to run one existing e2e spec against a stack.
---

# Verify GraphDB Workbench

## Quick look (a screenshot of the current branch)

When `scripts/doctor.sh` passes (`:9000` serves this checkout), three commands are enough; stop reading here:

```bash
V=.claude/skills/verify-workbench; RID=look-$(date +%H%M%S)
$V/scripts/pw.sh $RID open @/repository && $V/scripts/pw.sh $RID wait '<selector of what you want to see>'
$V/scripts/pw.sh $RID screenshot --filename=look.png      # lands in ~/.cache/verify-workbench/runs/$RID/playwright/
$V/scripts/cleanup.sh --run-id $RID
```

`doctor.sh` fails (a worktree, or `:9000` serves another checkout) → the page would show someone else's code:
use a container stack (Launch). Proving a change works, rather than looking at it → read on.

Primary surface: the browser UI. Two kinds of stack (see Launch):

- **Dev stack** — `http://localhost:9000` (single-spa root-config, which loads the Angular app from `:9002` and
  the shared API bundle from `:9003`, and proxies REST to GraphDB on `:7200`). One per machine, hot reload,
  usually the user's, serving the **main checkout**.
- **Container stack** — `container.sh up`: a throwaway GraphDB container of its own serving the production build
  of **one checkout** (`graphdb.workbench.home`), on its own port, optionally behind nginx under a context path.
  One per run, any number in parallel. Use it for every worktree and for final verification.

Two harnesses, same isolation/evidence/cleanup rules:

- **Interactive (default for exploring and proving a change):** the globally installed Playwright CLI
  (`playwright-cli`, npm `@playwright/cli`) — one command per action, read the ARIA snapshot, decide the next
  step. Wrapped by `pw.sh`.
- **Scripted (replayable recipes, regression of a mapped feature, one existing e2e spec):** the repo's Cypress
  install plus its `e2e-tests/steps/*` page objects. Wrapped by `drive.sh` — the only way to run Cypress here.
Other surfaces (GraphDB REST API, whole Cypress suites) are not this skill's job.

All helpers live in `.claude/skills/verify-workbench/scripts/` and are run from anywhere; `<script> --help` prints
its full usage (read that, not the source):

```bash
V=.claude/skills/verify-workbench     # from the repo root
$V/scripts/container.sh up --run-id ID [--tree PATH] [--context /graphdb] [--no-build]   # isolated stack
$V/scripts/container.sh rebuild --run-id ID     # after a source change: build + restage, then reload the page
$V/scripts/launch.sh                  # start or reuse the dev stack (main checkout only), wait until ready
$V/scripts/doctor.sh [--run-id ID]    # read-only health check (of that run's container stack)
$V/scripts/repo.sh <run-id> <suffix>...   # setup data: repositories verify-<run-id>-<suffix> on the run's GraphDB
$V/scripts/pw.sh <run-id> <playwright-cli command> [args]   # interactive, session verify-wb-<run-id>
$V/scripts/check-paths.sh <run-id>    # context stack: no request left the context path
$V/scripts/drive.sh <one spec file> [--run-id ID] [--headed] [--timeout S] [--stall S]   # one Cypress spec
$V/scripts/cleanup.sh --run-id ID [--stop-stack]   # or --all-repos / --all-runs (see Cleanup)
$V/scripts/a11y.sh <run-id> [--repo ID] [route...]   # accessibility ticket: IBM Equal Access check, read a11y.md first
```

## Launch

**Which stack.** The dev stack only shows the code of the checkout it was started from, and every worktree has
the same `package.json` version, so nothing in the page tells you whose code you see. Verifying a worktree, or
anything while the user works in the main tree → **container stack**. Quick iterations on the main checkout
with the user's running stack → dev stack. `launch.sh` and `doctor.sh` fail when the dev stack on `:9000` was
started from a different checkout than the one you are in.

### Container stack (`container.sh`)

- `container.sh up --run-id $RID [--tree PATH]` — `PATH` defaults to the git toplevel of `$PWD`. Runs
  `npm run install:local` if the tree has no `node_modules` (never plain `npm install`), then `npm run build`
  (~1 min warm), copies `dist/` and the import fixtures into `~/.cache/verify-workbench/state/stacks/$RID/`,
  and starts `docker compose -p verify-wb-<rid>` with `docker-registry.ontotext.com/graphdb:$GDB_VERSION`
  (`GDB_VERSION` from the **tree's** `.env`; override `VERIFY_WB_GDB_VERSION`) on the first free port from 7210.
  Ready in ~10 s; prints `READY: <url>` and records it in the run state, which `pw.sh`, `drive.sh`,
  `check-paths.sh`, `doctor.sh --run-id` and `cleanup.sh` read.
- `--context /graphdb` puts nginx in front (`graphdb.external-url=<url>/`) and serves only under the prefix;
  everything else gets 404 `outside context path`. Verify navigation/routing/URL changes this way too
  (`features/context-path.md`).
- **License:** `--license FILE`, else `VERIFY_WB_LICENSE`, else `e2e-tests/fixtures/graphdb.license` of the tree,
  else of the main checkout (git-ignored; the file `docker-compose-test.yaml` mounts too). None found → `FAIL`
  (exit 66). After start `up` checks `GET /rest/graphdb-settings/license` → `valid:true` and prints product and
  expiry; an expired/rejected license fails `up` (exit 4). `--no-license` runs GraphDB Free on purpose (header:
  "No valid license") — only when the check is about the unlicensed state.
- Data lives only in the container: an empty GraphDB, security off. `cleanup.sh --run-id $RID` removes it all.
- Source change → `container.sh rebuild --run-id $RID`, then `pw.sh $RID reload`; no container restart.
- `--no-build` reuses the tree's current `dist/`.

### Dev stack (`launch.sh`)

- **Prerequisite, not managed here:** a GraphDB answering `http://localhost:7200/rest/info/version` with
  security **off** (`GET /rest/security` → `false`). If it is down, stop and tell the user.
- `launch.sh` — if 9000/9002/9003 already serve the app from **this** checkout, it prints `REUSING …` and exits 0:
  that stack belongs to the user, is shared, and is never stopped. Served from another checkout → exit 9; use a
  container stack. Otherwise it runs `npm run start` from the repo root in its own
  process group (pgid in `~/.cache/verify-workbench/state/stack.pid`, log in `…/state/stack.log`) and waits
  until `:9000/`, `:9002/workbenchApp.js` and `:9003/ontotext-workbench-api.js` all return 200 (cold start:
  several minutes; `--timeout SECONDS`, default 900). Requires installed deps (`npm run install:local` once).
- **Isolation:** ports 9000/9002/9003 are hard-coded (root webpack config, `angular.json`, api `package.json`),
  so only one dev stack can run (parallel work → container stacks). Isolation on it is per *data*: every spec works in its own repositories named
  `verify-<run-id>-<suffix>`. Run one `drive.sh` at a time: a second concurrent Cypress run shares the stack and
  GraphDB and makes the evidence untrustworthy.
- Source edits under `packages/*/src` hot-reload into the running stack; webpack/config changes need a restart
  (only restart a stack you started: `cleanup.sh --stop-stack`, then `launch.sh`).

## Doctor

`doctor.sh` — run first, and again after anything surprising. Exit 0 = drivable (WARNs allowed), 1 = do not drive.
Dev stack: GraphDB version and security off; the three dev-server URLs; that `:9000` is served from this
checkout (`--tree PATH` to name another); that the served `workbenchApp.js?v=` matches `package.json` version
(WARN = stack started before the checkout changed); whether the stack is ours or the user's; Cypress + Chrome;
leftover `verify-*` repositories; another Cypress run in progress.
`doctor.sh --run-id $RID` checks that run's container stack instead: GraphDB, the page, that it serves this
tree's `dist/` (content-hashed `main.*.js`), the context path, and the tree's Cypress.

## Setup data

REST is fine for setup; the path being verified goes through the UI. Name everything `verify-<run-id>-*` so
`cleanup.sh --run-id` removes it.

- Repositories: `repo.sh <run-id> <suffix>...` (the e2e `repo-template.json`, on the run's GraphDB).
- Anything else: look the endpoint up instead of guessing. The public API is in the run's GraphDB OpenAPI docs:
  `<GDB_URL>/rest/api/workbench` (JSON, ~150 KB: query it with `jq '.paths["/rest/…"]'`) and
  `<GDB_URL>/rest/api/rdf4j` (YAML: SPARQL, statements, graph store). Internal endpoints the UI calls
  (`import/upload/*`, `default-config`, …) are only in `packages/legacy-workbench/src/js/angular/rest/*.rest.service.js`.

## Drive interactively (Playwright CLI)

Pick a run id once (e.g. `RID=pw-$(date +%H%M%S)`) and pass it to every call; it names the browser session
`verify-wb-<RID>`, the evidence dir `<evidence root>/<RID>/playwright/` (pw.sh `cd`s there, so snapshots,
screenshots and console logs never land in the repo) and the repositories `verify-<RID>-*` that cleanup deletes.
Each call is a separate process, so the browser session is what carries state between Bash calls.

```bash
PW="$V/scripts/pw.sh $RID"
$PW open @/repository                              # @/ = the run's URL (container/context aware); --headed to watch
$PW wait '#wb-repositories-addRepositoryLink'       # pw.sh helper: wait until visible (also: wait-gone)
$PW snapshot --filename=repos.yml                    # ARIA tree with [ref=eN]; refs change after every action
$PW click '#wb-repositories-addRepositoryLink'      # target = ref from the latest snapshot or a unique selector
$PW fill '#id' "verify-$RID-repo"
$PW click 'role=button[name="Create"]'
$PW screenshot --filename=02-created.png
$PW eval "document.querySelector('.active-repository')?.textContent.trim()" --raw
$PW console error                                    # app console errors since the page loaded
$PW requests                                         # network log; `request <n>` for one request in full
```

`@/<route>` in any argument expands to the run's workbench URL: `http://localhost:9000/<route>` for dev runs,
`http://localhost:<port>[/graphdb]/<route>` for container runs. Use it instead of hard-coding a host.

Rules: after `open`, `goto` or any click that changes route, `wait` for the next element before acting —
`playwright-cli` does not auto-wait for a selector to exist and fails with `does not match any elements`.
Treat a `### Error` block in the output as a failed step (stop, `snapshot`, decide), never continue blindly.
Prefer ARIA selectors (`role=button[name="Delete repository <id>"]`, `role=dialog >> role=button[name="Yes"]`)
and `#wb-…` ids from the Steps classes over refs in recipes; refs are fine for one-off steps right after a
snapshot. Full command list: `playwright-cli --help` (incl. `run-code` for arbitrary Playwright code).

## Drive scripted (Cypress)

`drive.sh <spec>` runs exactly one spec file:

- **An existing spec of the tree under test** (`e2e-tests/e2e-legacy/…`, `e2e-security/…`): run in place with the
  config of its directory (legacy, guides, security). `e2e-flaky/` is refused unless `--allow-flaky`; a spec
  of another checkout than the run's is refused.
- **A verify spec** (`specs/*.cy.js` or your own): copied with `specs/verify-support.js` into
  `e2e-tests/cypress/verify/<run-id>/` (git-ignored scaffolding, deleted after the run) and run with the base
  `cypress.config.js`.

Both get a generated wrapper config (no retries, no video, spec reporter, evidence paths, `RUN_ID`). With the
run-id of a container run it drives that stack with the Cypress install and `e2e-tests/` of **that tree**; it
refuses context stacks (exit 65): the repo's Steps/commands intercept absolute paths that never match under a
prefix.

While it runs it prints the spec start, every passed/failed test and the totals (fit for Monitor); the full log
is `cypress.log`. A silent run is a hung run (a missing license, endless polling): `--stall` (default 120 s
without output) kills it with exit 125 — report that, do not wait it out. `--timeout` (default 600 s) caps the
whole run, exit 124. Otherwise exit code = Cypress exit code; the last stdout line is the evidence directory.

Ready-made specs (one per mapped feature, all proven): `specs/repositories.cy.js`,
`specs/import-text-snippet.cy.js`, `specs/sparql-query.cy.js`, `specs/graphs-overview.cy.js`. The feature map in
`features/` says what each proves and what is not covered yet.

To verify something else, write a new spec (keep it in the scratchpad unless it should join the map):

```js
import {RepositorySteps} from 'steps/repository-steps';   // e2e-tests/steps/* resolve as 'steps/...'
import {proof, recordSideEffect, sparqlSelect, verifyRepoId, collectAppErrors} from './verify-support';

describe('verify: <feature>', () => {
    const repositoryId = verifyRepoId('x');                  // verify-<run-id>-x, found by cleanup.sh
    before(() => cy.createRepository({id: repositoryId}));   // REST setup is fine; the *verified* path must be UI
    after(() => cy.deleteRepository(repositoryId));
    it('…', () => {
        cy.presetRepository(repositoryId);                   // selects the repo like the header selector would
        // drive with Steps classes / stable ids (#wb-…, data-test via cy.getByTestId) — not coordinates
        proof('01-…');                                       // screenshot after each meaningful state
        sparqlSelect(repositoryId, 'SELECT …').then((b) => recordSideEffect('read-back', b));
    });
});
```

Use the repo's Steps classes (`e2e-tests/steps/`) and Cypress commands (`e2e-tests/support/*-commands.js`:
`createRepository`, `deleteRepository`, `presetRepository`, `importRDFTextSnippet`, `importServerFile`, …)
before inventing selectors. If you need a new selector, prefer adding a getter to the Steps class over `cy.get` in
the spec (repo convention).

## Evidence

Interactive runs: `~/.cache/verify-workbench/runs/<run-id>/playwright/` — your named `screenshot`/`snapshot`
files plus the CLI's own `.playwright-cli/` logs. Save REST read-backs there too
(`curl -s localhost:7200/rest/repositories > …/side-effect-after-create.json`).

Scripted runs: `~/.cache/verify-workbench/runs/<run-id>/<spec-name>/` (override root with `VERIFY_WB_OUT`):

- `screenshots/<spec>.cy.js/NN-*.png` — `proof()` captures the Cypress runner: command log (the action), URL bar
  and the app (the resulting state). Failures add a `… (failed).png`.
- `side-effects/*.json` — REST read-backs (repository list, SPARQL results) and recorded app errors.
- `cypress.log` — full Cypress stdout (on failure includes the command log and console). `summary.txt` — exit
  code, git sha, time.
- Re-driving the same spec with the same run-id moves the old directory to `<spec-name>.prev-HHMMSS`; nothing is
  deleted.

Proof standards: exercise the real user path (menus, buttons, dialogs) for the behavior being proven; REST
commands are only for setup/teardown and for the second, read-only view of side effects. Capture the action and
the resulting state, and verify the side effect (repository exists in `/rest/repositories`, triple returned by a
SPARQL read-back) alongside what is visible. Assert visibility of the result (`be.visible`), not only DOM
presence: e.g. the SPARQL result table and the resource view render after their DOM exists. Look at the final
screenshot before claiming success. Stubs: the repo's global `beforeEach` stubs only Google calls; `drive.sh`
sets `set_default_user_data=false` so the admin-user stub is off. Add no other stubs unless the boundary is a
real external system.

## Cleanup

`cleanup.sh --run-id $RID` closes the run's `verify-wb-<run-id>` Playwright session and removes its container
stack (container runs) or deletes its `verify-<run-id>-*` repositories on the shared GraphDB (dev runs), then
forgets the run. Without arguments it only lists the recorded runs: `~/.cache/verify-workbench/state/runs/` is
shared by every agent on the machine, so sweeping it (`--all-runs`) would tear down other agents' runs in
progress — use that only when the user asks. `--run-id ID` limits it to one run;
`--all-repos` deletes every `verify-*` repository (use after a crashed run that left no record).
`--stop-stack` additionally kills the process group launch.sh started — never a stack it found running, never
by process name. Evidence under `~/.cache/verify-workbench/runs/` is never touched. Run cleanup after every
failed iteration too, then `doctor.sh` should report `no leftover verify-* repositories`.

## Gotchas

- Docker here is the snap package: it cannot see `/tmp` (where agent worktrees live) and fails silently with an
  empty mount. `container.sh` therefore copies `dist/` into `~/.cache/…/stacks/<rid>/` instead of mounting the
  tree. GraphDB also refuses a read-only `workbench.home` (it calls `createDirectories()` on it).
- GraphDB answers `406` to a page request without `Accept: text/html` and serves a bootstrap page at `/` that
  fetches the real `index.html` by XHR: curl a content-hashed bundle (`main.*.js`) to check what is served.
- A container GraphDB starts empty: specs must not assume other repositories exist (the repositories list table
  disappears when the last repository is deleted).
- Production builds answer 500 for `assets/env.json` and `favicon.ico` on every load — expected noise.
- Interactive Playwright sessions are not stubbed: the page sends Google Analytics hits (Cypress stubs them).

- Do not `ps`/log the GraphDB java process command line into evidence: in local setups it carries API keys.
- Playwright CLI sessions outlive the shell: always end with `cleanup.sh --run-id <RID>` (doctor warns about
  open `verify-wb-*` sessions). Never `close-all`/`kill-all` — other sessions on the machine are not ours.
- `cy.screenshot` with `capture: 'viewport'` resizes the app; the SPARQL result table then re-renders into an
  endless spinner and the proof is blank. `proof()` uses `capture: 'runner'` for this reason.
- The base config sets `e2e.retries.runMode: 2`; `--config retries=0` does not override it, hence the generated
  wrapper config. Retries would hide flakiness and triple the screenshots.
- `e2e-tests/support/e2e.js` unsets the selected repository before every test; select it in the test
  (`cy.presetRepository`) or through the header selector.
- Feature map maintenance: `/maintain-verification-skill`.
