# SPARQL query

A user opens the SPARQL editor for the selected repository, writes a query, runs it, and reads the results in the
table below the editor.

## Sub-features

- `sparql-select` runs a SELECT and renders a result table with row numbers.
- `sparql-response-info` shows "Showing results from … Query took …".
- `sparql-tabs`, `sparql-saved-queries`, `sparql-update`, `sparql-downloads`, other result views (Raw response,
  Pivot Table, Google Chart) — not driven.
- The newer Angular editor at `/sparql-new` — not driven.

## How to get to it (user POV)

- Menu `SPARQL` (route `/sparql`) with a repository selected.
- Editor `.tabPanel.active .yasqe` › `Run` (`.yasqe_queryButton`) › results `.tabPanel.active .yasr`.

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
- **Run it.** `$V/scripts/drive.sh $V/specs/sparql-query.cy.js`.

## Gotchas

- The result table is below the fold of the 1280x720 viewport; scroll it into view before `proof()`.
- Screenshots must use `capture: 'runner'` (the `proof()` default): a viewport capture resizes the app and Yasr
  re-renders into an endless spinner.
- The yasgui web component renders twice on load; use `visitSparqlEditorPageAndWaitForEditor` rather than a
  bare `cy.visit('/sparql')`.
- `pasteQuery` sets CodeMirror directly then types two spaces so Angular notices; `writeInEditor` types for real
  (slow).
