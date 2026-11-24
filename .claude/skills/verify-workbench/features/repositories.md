# Repositories

A user creates a GraphDB repository from Setup › Repositories (optionally with a ruleset and SHACL validation),
sees it in the list, makes it the active repository from the header selector, edits it, deletes it from its list
row, and attaches or detaches a remote location.

## Sub-features

- `repo-list` shows existing repositories and the `Create new repository` button.
- `repo-create-gdb` creates a GraphDB repository with only an id (other types: Ontop, FedX — not driven; FedX
  shows a deprecation notice and a `Deprecated` tag in the list since GDB-15661).
- `repo-create-ruleset-shacl` picks a ruleset (`#ruleset`, includes the RDF 1.2 variants since GDB-15797) and
  checks `Enable SHACL validation` (`#isShacl`), which adds the collapsible `SHACL options` section
  (`#shaclOptions`).
- `repo-select` makes a repository active from the header repository selector.
- `repo-edit` row `Edit` opens `/repository/edit/<id>?location=`; ruleset and SHACL are read-only there, title and
  most params change; `Save` asks `Confirm save` (restart warning).
- `repo-delete` deletes a repository after a confirmation dialog.
- `repo-attach-location` `Attach remote location` dialog (GraphDB / Ontopic / SPARQL endpoint, auth None / Basic
  / Signature) adds a location; the row's `Detach location <label>` removes it.
- `repo-restart`, `repo-download-config`, `repo-copy-url`, `repo-set-default`, create from file — not driven.

## How to get to it (user POV)

- Menu `Setup` › `Repositories` (route `/repository`).
- `Create new repository` (`#wb-repositories-addRepositoryLink`) › `GraphDB Repository`
  (`#repository-type-gdb-btn`) › form at `/repository/create/graphdb` › `Create`.
- Header repository selector (`data-test="onto-repository-selector"`) › repository item.
- Row action `Delete` (`.repository-actions .delete-repository-btn`) › modal primary button.
- Row action `Edit` (`.repository-actions .edit-repository-btn`) › form › `Save` (`#addSaveRepository`) › modal
  primary button.
- `Attach remote location` (`#addAttachRemoteLocation`) › `#remoteLocationForm` › URL `#location` › `Attach`
  (`.attach-location`). Attached GraphDB locations list under `Remote GraphDB instances`
  (`#wb-locations-locationInGetRemoteLocations`).

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; no repositories `verify-<run-id>-repo`, `verify-<run-id>-rules` and no location
  `http://localhost:7200` exist. Prefer a container stack: the attach step changes the GraphDB's location list.

- **List.** Open Setup › Repositories. `RepositorySteps.visit()`. The create button is enabled. Proof `01-repositories-list`.
- **Create.** Choose `Create new repository` › `GraphDB Repository`, type the id, save.
  `RepositorySteps.createRepository(); chooseRepositoryType('gdb'); typeRepositoryId(id); saveRepository()`.
  URL returns to `/repository` and the row is visible. Proofs `02-create-form-filled`, `03-created-in-list`;
  side effect `repositories-after-create.json` from `GET /rest/repositories`.
- **Select.** Pick it in the header selector. `RepositorySteps.selectRepoFromDropdown(id)`. `.active-repository`
  shows the id and the row shows `.icon-connection-on`. Proof `04-selected`.
- **Delete.** Row `Delete` › confirm. The row is gone and `/rest/repositories` no longer lists it. Proof
  `05-deleted`; side effects `repositories-after-delete.json`, `uncaught-app-errors-on-delete.json`.
- **Ruleset + SHACL.** Create `verify-<run-id>-rules` with `RepositorySteps.selectRuleset('OWL-Horst (Optimized)')`
  and `getSHACLRepositoryCheckbox().check()`, unfold `SHACL options`. Proof `06-create-ruleset-shacl`; side effect
  `ruleset-repository-after-create.json` from `GET /rest/repositories/<id>` (`params.ruleset.value`
  `owl-horst-optimized`, `params.isShacl.value` `'true'`).
- **Edit.** `RepositorySteps.editRepository(id)`: ruleset select and `#isShacl` are disabled; change the title,
  `saveRepository()`, `confirmModal()`. Proofs `07-edit-form`, `08-edited-in-list`; side effect
  `ruleset-repository-after-edit.json` (new title, same ruleset).
- **Attach / detach a location.** The stack's own GraphDB attaches itself as `http://localhost:7200` (in a
  container and on the dev stack alike). `AttachRepositorySteps.openAttachRemoteLocationDialog(); enterURL(uri);
  attachRemoteLocation()` → `Remote GraphDB instances` lists `Remote (http://localhost:7200)`; detach with
  `button[aria-label="Detach location Remote (http://localhost:7200)"]` › `confirmModal()`. Proofs
  `09-attach-dialog`, `10-remote-location-attached`, `11-remote-location-detached`; side effects
  `locations-after-attach.json`, `locations-after-detach.json` from `GET /rest/locations`.
- **Run it (Cypress).** `$V/scripts/drive.sh $V/specs/repositories.cy.js` (3 tests, proven 2026-11-24 on a
  container stack, 12.0.0-TR23).
- **Run it (Playwright CLI, proven 2026-10-19).** With `PW="$V/scripts/pw.sh $RID"`, `R=verify-$RID-repo` and
  `ITEM=".onto-repository-selector .repository-selector-dropdown-item:has(.repository-id:text-is(\"$R\"))"`:
  `$PW open @/repository` → `$PW wait '#wb-repositories-addRepositoryLink'` →
  `$PW click '#wb-repositories-addRepositoryLink'` → `$PW wait '#repository-type-gdb-btn'` → `$PW click …` →
  `$PW wait '#id'` → `$PW fill '#id' "$R"` → `$PW click 'role=button[name="Create"]'` →
  `$PW wait "role=button[name=\"Connect repository $R\"]"` (row present; read back `/rest/repositories`) →
  `$PW click '.onto-repository-selector .onto-dropdown-button .repository-selection'` → `$PW wait "$ITEM"` →
  `$PW click "$ITEM"` → `$PW wait ".active-repository:has-text(\"$R\")"` →
  `$PW wait "[data-test=\"repository-$R\"] .icon-connection-on"` →
  `$PW click "role=button[name=\"Delete repository $R\"]"` → `$PW wait 'role=dialog >> role=button[name="Yes"]'` →
  `$PW click` it → `$PW wait-gone "role=button[name=\"Delete repository $R\"]"` (read back again: id gone).
  `screenshot --filename=NN-….png` after each state; `console error` at the end. The header selector lives
  outside the ARIA snapshot, so target it with the CSS selectors above (from `RepositorySelectorSteps`).
  Re-proven 2026-11-24 (select + delete part).
- **Attach a location (Playwright CLI, proven 2026-11-24).** `$PW click '#addAttachRemoteLocation'` →
  `$PW wait '#remoteLocationForm #location'` → `$PW fill '#remoteLocationForm #location' 'http://localhost:7200'` →
  `$PW click '.modal-footer .attach-location'` →
  `$PW wait 'role=button[name="Detach location Remote (http://localhost:7200)"]'` (read back `/rest/locations`) →
  `$PW click` it → `$PW click 'role=dialog >> role=button[name="Yes"]'` →
  `$PW wait-gone '#wb-locations-locationInGetRemoteLocations'`.
- **Attach by REST (setup only, container runs).** `$V/scripts/setup.sh $RID location gdb` attaches the stack's
  own GraphDB (`http://localhost:7200` inside the container); `setup.sh $RID location sparql <repo-id>` a working
  SPARQL location (basic auth `admin`/`root`, required even with security off). `locationType` is one of `GDB`,
  `ONTOPIC`, `SPARQL`. Remove with `DELETE /rest/locations?uri=<encoded uri>` (`cy.deleteRemoteLocation(uri)`).

## Gotchas

- Product issue seen on 2026-10-08 (4.0.0-TR10 checkout), timing-dependent: deleting the *currently selected*
  repository right after selecting it raised an uncaught `Http failure response for repositories/<id>/namespaces:
  404` (the namespaces request raced the delete). Not reproduced on 2026-10-19 (TR12 code, container stack,
  3 of 3 Cypress runs: `uncaught-app-errors-on-delete.json` is `[]`). The spec still records uncaught errors
  via `collectAppErrors` and fails on any other than that one.
- `Connect repository <id>` is the ARIA name of the row's connect button in both states; wait for
  `.icon-connection-on` in the row to prove it is the active one.
- `saveRepository()` waits for the global loader; asserting the list right after the click without it is flaky.
- Row actions have ARIA names that include the id (`Connect repository <id>`, `Delete repository <id>`,
  `Restart repository <id>`, `Set repository <id> as default`); the confirm dialog's button is `Yes`.
- The header selector hides the already-active repository, so select a different one first when re-selecting.
- A repository id appears twice in the DOM (hidden header-selector item + list row); in Playwright
  `text=<id>` hits a strict-mode violation. Scope it (`[data-test="repository-<id>"]`) or add `>> visible=true`.
- The attach dialog's primary button has an icon glyph in its accessible name (` Attach`):
  `role=button[name="Attach"]` matches nothing. Use `.attach-location` (or `role=button[name=/Attach$/]`).
- A self-attached location reports `errorMsg` `Recursive location detected` in `/rest/locations`, and the list
  still shows its repositories under `Remote GraphDB instances`. Enough for the attach/detach UI; operations on the
  remote repositories need a second GraphDB.
- After `Save` on the edit form the app returns to `/repository?location=` (the edit route's query string stays);
  assert `cy.location('pathname')`, not the full URL.
