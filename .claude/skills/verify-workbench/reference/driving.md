# Driving

Setup data, the interactive harness (`pw.sh`) and the scripted one (`drive.sh`). Flags: `<script> --help`.

## Setup data

REST is fine for setup; the path being verified goes through the UI. Name everything `verify-<run-id>-*` so
`cleanup.sh --run-id` finds it.

- Repositories: `repo.sh` — ruleset and params (`--ruleset`, `--param`, labels taken from the live
  `default-config`), FedX with members, autocomplete index READY (`--autocomplete`), `SystemRepository` for
  Graph Navigator settings (`--system`, container runs). Read a repository's real config back with
  `GET /rest/repositories/<id>/download-ttl` (params match by label: [gotchas.md](gotchas.md) › Cypress).
- Remote locations and Visual graph configs: `setup.sh` (container runs only).
- Select a repository: `pw.sh $RID select-repo <id>` (persists it like the header selector, reloads, reads
  back, no dialog).
- **Deep link `<route>?repositoryId=<id>`** while another repository is active opens a `Confirm` dialog
  ("Active repository will be changed to …"), and whatever runs before confirming acts on the *previous*
  repository. Click `role=dialog >> role=button[name="Confirm"]`, wait for `.active-repository` to show the id,
  then act. Recipes that deep-link point here.
- Any other endpoint: look it up instead of guessing. Public API: the run's `<url>/rest/api/workbench` (JSON,
  ~150 KB: `jq '.paths["/rest/…"]'`) and `<url>/rest/api/rdf4j` (YAML). Internal endpoints the UI calls are
  only in `packages/legacy-workbench/src/js/angular/rest/*.rest.service.js`.

## Interactive: `pw.sh` (Playwright CLI)

One run id per run, passed to every call: it names the browser session `verify-wb-<RID>`, the evidence dir
`<evidence root>/<RID>/playwright/` (pw.sh runs there, so snapshots and screenshots never land in the repo) and
the repositories cleanup deletes. The session carries state between Bash calls.

```bash
PW="$V/scripts/pw.sh $RID"
$PW open @/repository                          # @/ = the run's workbench URL (port, context path); --headed to watch
$PW wait '#wb-repositories-addRepositoryLink'  # wait for what you act on next
$PW snapshot --filename=repos.yml              # ARIA tree with [ref=eN]; refs change after every action
$PW click 'role=button[name="Create"]'         # target = ref from the latest snapshot or a unique selector
$PW fill '#id' "verify-$RID-repo"
$PW screenshot --filename=02-created.png       # viewport; `screenshot '<selector>' --filename=…` crops one element
$PW js "document.querySelector('[data-test=onto-repository-selector] .repository-id')?.textContent.trim()"
$PW console error                              # app console errors; `errors` adds uncaught page errors
$PW requests                                   # network log; `request <n>` for one in full
```

`pw.sh --help` lists the helpers, the per-call timeout and what happens to a closed session (its exit codes);
anything else passes through to `playwright-cli` (`playwright-cli --help`).

- **Wait on a condition**: `wait`, `wait-gone`, `wait-url @/sparql`, `wait-fn '<predicate>'` after every `open`,
  `goto` or route-changing click; `playwright-cli` does not auto-wait and fails with `does not match any
  elements`. A `### Error` block is a failed step: stop, `snapshot`, decide.
- **Page JS** through `js`: an expression, statements (last value printed) or a function; prints raw values.
- **Browser state** with `theme light|dark|os [light|dark]` and `select-repo <id>`; both reload and read back.
- **Navigation:** `goto` or `nav <route>` (in-app, no reload) inside a session. `open` on an open session
  restarts the browser and drops routes and storage (pw.sh WARNs).
- **Focus** comes from real key presses: `tabwalk <n>` or `press Tab`, then `focus`.
- **Style** read-back: `css <selector> <property> [:hover|:focus-visible]` before and after the change.
- **Fault injection:** `route '<glob>' --status 500 --body '<json>' --content-type application/json` after the
  last `open`, drive the error path, `unroute '<glob>'`, `route-list` → `No active routes`.
- **Several tabs** (`tab-new`): wrap every command in `timeout 60` (why: `features/security-login.md` › Gotchas).

### Selectors

- ARIA selectors (`role=button[name="Delete repository <id>"]`, `role=dialog >> role=button[name="Yes"]`) and the
  `#wb-…` ids of the Steps classes in recipes; refs for one-off steps right after a snapshot.
- Text matches hidden copies: a repository id is in the DOM twice (hidden header-selector item and the view).
  Scope to the view or append `>> visible=true`.
- YASQE/CodeMirror input: `js "document.querySelector('<scope> .CodeMirror').CodeMirror.setValue('…')"`
  (`ontotext-yasgui .tabPanel.active` on `/sparql`); `Run` picks it up.
- Toasts: legacy pages `#toast-container .toast-<type>`, Angular pages `.onto-toastr-container .onto-toast.<type>`;
  read them right after the action (error toasts vanish in seconds). Confirm dialogs carry both
  `.modal-dialog` and `.p-confirmdialog`.

### Bash for the permission classifier

Call scripts by their literal path (`$V/scripts/pw.sh …`), one command per call or a fixed list; no command
names computed in loops. Page JS goes through `pw.sh js`.

## Scripted: `drive.sh` (Cypress)

`drive.sh <spec> --run-id $RID` runs exactly one spec file against the run's stack, with the tree's own
Cypress and `e2e-tests/` (the only way this skill runs Cypress). How to run it, its exit codes, downloads and
security handling: `drive.sh --help`.

- **An existing spec** of the tree (`e2e-tests/e2e-legacy/…`, `e2e-security/…`) runs in place with its
  directory's config. **A verify spec** (`specs/*.cy.js` or your own) is copied next to `specs/verify-support.js`
  into the git-ignored `e2e-tests/cypress/verify/<run-id>/` and runs with the base config.
- Retries are 0 unless `--retries N`. CI retries every test twice, so a test red here and green in CI may be a
  flake: prove it with `--repeat N` (`repeat: P/N passed`) or `--retries 2` and report it as a flake.

Ready-made specs: `specs/repositories.cy.js`, `specs/import-text-snippet.cy.js`, `specs/sparql-query.cy.js`,
`specs/graphs-overview.cy.js` (`features/README.md` says what each proves). A new spec (keep it in the
scratchpad unless it joins the map):

```js
import {RepositorySteps} from 'steps/repository-steps';   // e2e-tests/steps/* resolve as 'steps/...'
import {proof, recordSideEffect, sparqlSelect, verifyRepoId, collectAppErrors} from './verify-support';

describe('verify: <feature>', () => {
    const repositoryId = verifyRepoId('x');                  // verify-<run-id>-x, found by cleanup.sh
    before(() => cy.createRepository({id: repositoryId}));   // REST setup; the *verified* path is UI
    after(() => cy.deleteRepository(repositoryId));
    it('…', () => {
        cy.presetRepository(repositoryId);                   // e2e.js unsets the repository before every test
        // drive with Steps classes / stable ids (#wb-…, data-test via cy.getByTestId), not coordinates
        proof('01-…');                                       // screenshot after each meaningful state
        sparqlSelect(repositoryId, 'SELECT …').then((b) => recordSideEffect('read-back', b));
    });
});
```

Reach for the repo's Steps classes (`e2e-tests/steps/`) and commands (`e2e-tests/support/*-commands.js`:
`createRepository`, `presetRepository`, `importRDFTextSnippet`, `importServerFile`, …) first; a new selector
goes into a Steps getter, not a `cy.get` in the spec. Stubs: the repo stubs only Google calls and `drive.sh`
turns the admin-user stub off; add others only for a real external system.
