# Similarity indexes

A user opens Explore › Similarity with a repository selected, creates a text similarity index over the
repository's literals (name + optional query/options), sees it listed with its type, opens it to search by term or
document and gets a ranked result table with scores, and can edit, clone, rebuild or delete it.

## Sub-features

- `similarity-create-text` `Create similarity index` › name › `Create` with the default select query builds a
  `text` index (REST status `BUILT` within ~2 s for a few triples).
- `similarity-search` clicking the index name opens `Search in <name>`; term `apple` with Search type `Term` /
  Result type `Term` returns stemmed terms (`"appl"`, `"orchard"`, …); Result type `Document` returns the
  document IRIs ranked by score.
- `similarity-delete` row delete › `Confirm` dialog `Are you sure you want to delete the index '<name>'?` › `Yes`.
- Predication indexes (`#create-predication-index`), Search / Analogical query tabs, `More options` (semantic
  vectors, stop words, analyzer, literal index), edit / clone / rebuild / view SPARQL query, Search type
  `Document`, entity/analogical searches — not driven.

## How to get to it (user POV)

- Menu `Explore` › `Similarity` (route `/similarity`); create form at `/similarity/index/create`. Needs a valid
  license, a GraphDB repository and the similarity plugin active (otherwise the `existing-indexes` card is absent).
- Selectors: `[data-test="existing-indexes"] [data-test="create-similarity-index-btn"]` (list),
  `[data-test="similarity-index-name"]` and `[data-test="create-similarity-index-btn"]` (form),
  `#indexes-table a.index-name`, `.delete-index-btn`, `.search-type-btn` / `.result-type-btn` with
  `.dropdown-result-type .dropdown-item`, search field `search-resource-input input.view-res-input`, `Show` button
  `.autocomplete-visual-btn`.
- Source: `packages/legacy-workbench/src/js/angular/similarity/plugin.js` (routes), controllers
  `similarity/controllers/similarity-list.controller.js` (`SimilarityCtrl`), `create-index.controller.js`
  (`CreateSimilarityIdxCtrl`),
  templates `src/pages/similarity-indexes.html`, `src/pages/create-index.html`; REST
  `rest/similarity.rest.service.js` (`GET rest/similarity` with header `X-GraphDB-Repository: <id>` lists indexes
  with `status`).

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; `verify-<run-id>-sim` from `$V/scripts/repo.sh $RID sim` with a few `rdfs:label`
  sentences POSTed as N-Triples to `/repositories/<id>/statements` (setup).

- **Run it (Playwright CLI, proven 2026-11-24, container stack, GraphDB 12.0.0-TR23).** `PW="$V/scripts/pw.sh $RID"`:
  - Create: `$PW goto "@/similarity?repositoryId=verify-$RID-sim"`
    (repository-switch `Confirm`: [driving.md](../reference/driving.md) › Setup data) →
    `$PW wait '[data-test="existing-indexes"] [data-test="create-similarity-index-btn"]'` → click it → URL
    `/similarity/index/create` → `$PW fill '[data-test="similarity-index-name"]' verifyidx` →
    `$PW click '[data-test="create-similarity-index-btn"]'` → back on `/similarity`; read-back
    `curl -s <stack>/rest/similarity -H 'X-GraphDB-Repository: verify-$RID-sim'` → `verifyidx BUILT`.
  - Search: `$PW click '#indexes-table a.index-name:text-is("verifyidx")'` →
    `$PW fill 'search-resource-input input.view-res-input:visible' apple` →
    `$PW click 'search-resource-input:visible .autocomplete-visual-btn'` → visible result `table` lists
    `"appl" "1.0"^^xsd:double`, … . `$PW click '.result-type-btn'` →
    `$PW click '.dropdown-result-type .dropdown-item:text-is("Document")'` → `Show` again → rows
    `urn:verify:d1 …` ranked by score.
  - Delete: `$PW click '#existing-similarity-indexes-title .collapsible-heading'` (re-expand, see Gotchas) →
    `$PW wait '#indexes-table .delete-index-btn'` →
    `$PW click '#indexes-table tr:has(a.index-name:text-is("verifyidx")) .delete-index-btn'` →
    `$PW click 'role=dialog >> role=button[name="Yes"]'` → `$PW wait-gone '#indexes-table a.index-name:text-is("verifyidx")'`;
    read-back `[]`.
  `screenshot --filename=…` after each state.
- **Run it (Cypress).** No verify spec; `e2e-legacy/explore/similarity-index/*.spec.js` replay with `drive.sh`;
  `SimilarityIndexesSteps` / `SimilarityIndexCreateSteps`
  (`e2e-tests/steps/explore/`) hold the selectors.

## Gotchas

- Opening an index collapses `Existing Indexes` (`#indexes-table` loses `in`); row buttons are then hidden and
  clicks silently miss. Re-expand via the heading first.
- `create-similarity-index-btn` is the data-test of both the list's link and the form's submit button; scope the
  list one to `[data-test="existing-indexes"]`.
- Term results are Lucene-stemmed (`apple` → `"appl"`); assert on documents for a stable proof.
- Index names must match `^[a-zA-Z0-9-_]+$` (`models/similarity/similarity-index-info.js`); the indexes live
  in the repository, so deleting `verify-<run-id>-sim` (cleanup.sh) removes them (not checked).
