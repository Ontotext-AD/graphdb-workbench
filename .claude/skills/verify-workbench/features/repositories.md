# Repositories

A user creates a GraphDB repository from Setup › Repositories, sees it in the list, makes it the active
repository from the header selector, and deletes it from its list row.

## Sub-features

- `repo-list` shows existing repositories and the `Create new repository` button.
- `repo-create-gdb` creates a GraphDB repository with only an id (other types: Ontop, FedX — not driven).
- `repo-select` makes a repository active from the header repository selector.
- `repo-delete` deletes a repository after a confirmation dialog.
- `repo-edit`, `repo-restart`, `repo-download-config` exist on each row — not driven yet.

## How to get to it (user POV)

- Menu `Setup` › `Repositories` (route `/repository`).
- `Create new repository` (`#wb-repositories-addRepositoryLink`) › `GraphDB Repository`
  (`#repository-type-gdb-btn`) › form at `/repository/create/graphdb` › `Create`.
- Header repository selector (`data-test="onto-repository-selector"`) › repository item.
- Row action `Delete` (`.repository-actions .delete-repository-btn`) › modal primary button.

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; no repository `verify-<run-id>-repo` exists.

- **List.** Open Setup › Repositories. `RepositorySteps.visit()`. The create button is enabled. Proof `01-repositories-list`.
- **Create.** Choose `Create new repository` › `GraphDB Repository`, type the id, save.
  `RepositorySteps.createRepository(); chooseRepositoryType('gdb'); typeRepositoryId(id); saveRepository()`.
  URL returns to `/repository` and the row is visible. Proofs `02-create-form-filled`, `03-created-in-list`;
  side effect `repositories-after-create.json` from `GET /rest/repositories`.
- **Select.** Pick it in the header selector. `RepositorySteps.selectRepoFromDropdown(id)`. `.active-repository`
  shows the id and the row shows `.icon-connection-on`. Proof `04-selected`.
- **Delete.** Row `Delete` › confirm. The row is gone and `/rest/repositories` no longer lists it. Proof
  `05-deleted`; side effects `repositories-after-delete.json`, `uncaught-app-errors-on-delete.json`.
- **Run it (Cypress).** `$V/scripts/drive.sh $V/specs/repositories.cy.js`.
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
