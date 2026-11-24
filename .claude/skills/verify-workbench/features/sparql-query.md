# SPARQL query

A user opens the SPARQL editor for the selected repository, writes a query, runs it, and reads the results in the
table below the editor. The same editor component also runs in the newer Angular view at `/sparql-new`.

## Sub-features

- `sparql-select` runs a SELECT and renders a result table with row numbers.
- `sparql-response-info` shows "Showing results from … Query took …".
- `sparql-new-select` the same SELECT in the Angular editor at `/sparql-new`.
- `sparql-running-query-guard` changing the repository, the language or signing out while a query runs asks for
  confirmation and aborts the query (GDB-14762) — not driven; a long query recipe needs a slow query.
- `sparql-tabs`, `sparql-saved-queries`, `sparql-update`, `sparql-downloads`, other result views (Raw response,
  Pivot Table, Google Chart), `?query=…&execute=true` / `?savedQueryName=…` deep links — not driven.

## How to get to it (user POV)

- Menu `SPARQL` (route `/sparql`) with a repository selected.
- Editor `.tabPanel.active .yasqe` › `Run` (`.yasqe_queryButton`) › results `.tabPanel.active .yasr`.
- `/sparql-new` has no menu entry (its `New YASGUI` item is registered `disabled`): open it by URL;
  `/sparql-new?repositoryId=<id>` selects the repository. Same yasgui selectors inside `ontotext-yasgui`.

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; the spec creates `verify-<run-id>-sparql` and imports two `urn:verify:name` triples
  (Alice, Bob) via REST.

- **Open.** `cy.presetRepository(id); SparqlEditorSteps.visitSparqlEditorPageAndWaitForEditor()`. Proof
  `01-editor-default-query`.
- **Run.** `YasqeSteps.pasteQuery('SELECT ?name WHERE { ?s <urn:verify:name> ?name } ORDER BY ?name');
  YasqeSteps.executeQuery()`. The response chip appears; saved as `response-info.json`.
- **Read results.** `YasrSteps.getResults()` has 2 rows; cell (0,1) `Alice`, (1,1) `Bob`; scroll cell (0,1)
  into view and assert `be.visible`. Proof `02-results` shows the table.
- **New editor.** `cy.visit('/sparql-new?repositoryId=<id>')`, wait for `ontotext-yasgui .CodeMirror`, then the
  same paste/run/read steps. Proofs `03-sparql-new-editor`, `04-sparql-new-results`; side effects
  `sparql-new-response-info.json`, `sparql-new-uncaught-app-errors.json` (see Gotchas).
- **Run it.** `$V/scripts/drive.sh $V/specs/sparql-query.cy.js` (2 tests, proven 2026-11-24 on a container stack).
- **Run it (Playwright CLI, proven 2026-11-24 on `/sparql-new`).** `$PW open "@/sparql-new?repositoryId=$R"` →
  `$PW wait 'ontotext-yasgui .CodeMirror'` →
  `$PW eval "document.querySelector('ontotext-yasgui .CodeMirror').CodeMirror.setValue('SELECT …')"` →
  `$PW click '.tabPanel.active .yasqe_queryButton'` → `$PW wait '.tabPanel.active .yasr_results tbody tr'` →
  `screenshot`. On `/sparql` use `.tabPanel.active .CodeMirror` the same way; `setValue` alone is enough for
  `Run` in both views.

## Gotchas

- The result table is below the fold of the 1280x720 viewport; scroll it into view before `proof()`.
- Screenshots must use `capture: 'runner'` (the `proof()` default): a viewport capture resizes the app and Yasr
  re-renders into an endless spinner.
- The yasgui web component renders twice on load; use `visitSparqlEditorPageAndWaitForEditor` rather than a
  bare `cy.visit('/sparql')`.
- `pasteQuery` sets CodeMirror directly then types two spaces so Angular notices; `writeInEditor` types for real
  (slow).
- Editor state persists in `localStorage` across page loads of one Playwright session and is shared by `/sparql`
  and `/sparql-new`: `yagui__graphdb-workbench-sparql-editor` (tabs, queries, active tab) and
  `ontotext.gdb.sparqlEditor.lastUsedRepository` (legacy key `ls.sparql-last-repo`, migrated on read). A query typed
  in one capture shows up in the next. For a clean capture:
  `$PW eval "localStorage.removeItem('yagui__graphdb-workbench-sparql-editor')"` then reload. Cypress clears
  storage per test.
- Known product issue (in Jira): `/sparql-new` can throw an uncaught `getHumanReadableSeconds is not a function`
  while a query runs (seen with long queries). The spec records uncaught errors via `collectAppErrors` into
  `sparql-new-uncaught-app-errors.json` and fails on any other. Not seen with the 2-row query on 2026-11-24 (`[]`).
