# Import user data (files and URLs)

A user opens Import › User data with a repository selected, uploads RDF files from the computer or registers an
RDF URL, confirms the import settings (target graphs, replacement, advanced parser settings) and sees each
resource listed with its upload/import time and `Imported successfully … Added N statements`; the statements are
then queryable in the selected repository. Text snippets are a third entry point on the same tab:
[import-text-snippet.md](./import-text-snippet.md).

## Sub-features

- `import-upload-only` `Upload RDF files` › settings dialog `Only upload` lists the file (`Imported` column empty,
  REST status `NONE`) without importing it.
- `import-row-import` the row's import button (`.import-resource-action-import-btn`) › settings `Import` imports an
  uploaded file.
- `import-url` `Get RDF data from a URL` › URL + format › `Import` › settings `Import`.
- `import-snippet` — see [import-text-snippet.md](./import-text-snippet.md).
- Settings dialog options (`The default graph`, `Named graph`, `Enable replacement of existing data`, advanced
  settings), batch select / import / reset / remove, filter by name, row remove/reset, error dialog of a failed
  import, `Server files` tab, JSON-LD with a remote context (needs `-Dgraphdb.jsonld.whitelist` on the container,
  finding B35) — not driven.

## How to get to it (user POV)

- Menu `Import` (route `/import`, tab `User data` = `#import-user`, deep link `/import#user`) with a repository
  selected.
- Cards: `.upload-rdf-files-btn` (file input `#ngf-wb-import-uploadFile`), `.import-from-url-btn` (dialog: `#dataUrl`,
  `.import-format-dropdown-btn`, `#wb-import-importUrl`), `.import-rdf-snippet-btn`.
- Settings dialog buttons: `Cancel`, `Only upload` (file upload only), `.import-settings-import-button` (`Import`).
- Source: route `packages/legacy-workbench/src/js/angular/import/plugin.js`, controller
  `import/controllers/import-view.controller.js` (+ `import-url.controller.js`, `settings-modal.controller.js`),
  template `src/pages/import.html`. REST: `rest/upload.rest.service.js` (`POST rest/repositories/<id>/import/upload/file`),
  `rest/import.rest.service.js` (`…/import/upload/url`, list/status `GET …/import/upload`).

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; an empty `verify-<run-id>-imp` repository from `$V/scripts/repo.sh $RID imp`, selected.
- A small RDF file outside the repo, e.g. `$SCRATCH/verify-upload.ttl` with one N-Triples line.

- **Run it (Playwright CLI, proven 2026-11-24, container stack, GraphDB 12.0.0-TR23 / Workbench 4.0.0-TR19).**
  `PW="$V/scripts/pw.sh $RID"`, `ROW='#import-user .row.title-row:has-text("verify-upload.ttl")'`:
  - Open: `$PW goto "@/import?repositoryId=verify-$RID-imp#user"` → if another repository was active, a `Confirm`
    dialog asks to change it: `$PW click 'role=dialog >> role=button[name="Confirm"]'` →
    `$PW wait ".active-repository:has-text(\"verify-$RID-imp\")"` → `$PW wait '#import-user .upload-rdf-files-btn'`.
  - Upload only: `$PW run-code "async page => { await page.locator('#ngf-wb-import-uploadFile').setInputFiles('<abs path>/verify-upload.ttl'); }"`
    → `$PW wait 'role=button[name="Only upload"]'` → click it →
    `$PW wait '#import-user [data-test="resource-0"]:has-text("verify-upload.ttl")'`; read-back
    `GET /rest/repositories/<id>/import/upload` → `verify-upload.ttl NONE`.
  - Import the row: `$PW hover "$ROW"` → `$PW click "$ROW .import-resource-action-import-btn"` →
    `$PW click '.modal .import-settings-import-button'` →
    `$PW wait '#import-user [data-test="resource-0"] .text-success' 30000` (`Imported successfully … Added 1
    statements`); SPARQL read-back returns the literal.
  - From a URL: `$PW click '#import-user .import-from-url-btn'` → `$PW wait '#dataUrl'` → `$PW fill '#dataUrl' "$URL"` →
    `$PW click '.modal .import-format-dropdown-btn'` → `$PW click '.modal .import-format-dropdown .dropdown-item:text-is("Turtle")'`
    → `$PW click '#wb-import-importUrl'` → `$PW wait '.modal .import-settings-import-button'` → click it → row
    `Imported successfully … Added 1 statements`. A URL GraphDB itself can fetch without network:
    `http://localhost:7200/repositories/verify-$RID-imp?query=<url-encoded CONSTRUCT { <urn:verify:url1> … } WHERE {}>`
    (port 7200 is GraphDB inside the container); SPARQL read-back returns `urn:verify:url1`.
  `screenshot --filename=…` after each state.
- **Run it (Cypress).** No verify spec; `ImportUserDataSteps` (`e2e-tests/steps/import/import-user-data-steps.js`,
  `import-steps.js`: `selectFile`, `importFile(index)`, `getResourceStatusByIndex`) and
  `e2e-legacy/import/import-user-data-file-upload.spec.js` / `import-user-data-url.spec.js` hold the selectors.

## Gotchas

- Setting the same file again on `#ngf-wb-import-uploadFile` does nothing (no settings dialog). `reload` the page
  before the next upload of the same file; it then opens `Confirm files overwrite` (`Cancel`, `Keep both`,
  `Overwrite`).
- An upload made before confirming the deep link's repository switch goes to the *previously* active repository
  ([driving.md](../reference/driving.md) › Setup data).
- The row's import/remove buttons were reported hover-only (Cypress steps use `invoke('show')`); with `hover` on the
  row first, a normal `click` works.
- The row's `Imported successfully` message is in the row after `[data-test="resource-N"]`; `.text-success` inside
  `resource-N` is the wait target, the message text is in `.import-resource-message`.
- The URL import shows `0 bytes` as size; that is normal for URLs.
- "Imported successfully" alone is not proof; the SPARQL read-back is.
