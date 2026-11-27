# Visual graph

A user opens Explore › Visual graph, starts from a resource IRI (Easy graph) or a saved graph config, and sees
the resource with its neighbours as a force-directed D3 graph. Clicking a node opens its info panel,
double-clicking expands its links, failed requests show an error toast, and the current graph can be saved and
reopened from the landing page.

## Sub-features

- `vg-open-uri` `?uri=<IRI>` draws the start node and its links.
- `vg-node-info` a click on a node opens the side panel with its label, types, RDF Rank and properties.
- `vg-expand` a double click on a node loads its links and adds the new nodes.
- `vg-error-toast` a failing `rest/explore-graph/links` shows the toast "Error exploring node" with the server
  message.
- `vg-save-graph` Save graph stores the current graph (`toast: Saved graph <name> was saved.`); it is listed under
  Saved graphs on the landing page.
- `vg-search` (Easy graph search box), `vg-graph-config` (Advanced graph configurations,
  `/graphs-visualizations/config/save`), `vg-links-limit`, `vg-delete-saved` — not driven yet.
  The search needs the autocomplete index; graph configs need a config created first
  (`POST rest/explore-graph/config` with header `X-GraphDB-Repository`, see `graph-config.rest.service.js`).

## How to get to it (user POV)

- Menu `Explore` › `Visual graph` (route `/graphs-visualizations`) with a repository selected: landing page with
  Easy graph, Advanced graph configurations and Saved graphs.
- Deep link `/graphs-visualizations?repositoryId=<id>&uri=<encoded IRI>`; the resource view and SPARQL results
  link here too.
- Entry points in source: route + menu `packages/legacy-workbench/src/js/angular/graphexplore/plugin.js`,
  controller `graphexplore/controllers/graphs-visualizations.controller.js`, template
  `src/pages/graphs-visualizations.html`, REST `src/js/angular/rest/graph-data.rest.service.js`
  (`rest/explore-graph/node|links|properties|graph`), `saved-graphs.rest.service.js`
  (`rest/explore-graph/saved`), `graph-config.rest.service.js` (`rest/explore-graph/config`).

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; a repository with linked data: `$V/scripts/repo.sh $RID nav`, then
  `curl -X POST -H 'Content-Type: text/turtle' --data-binary @e2e-tests/fixtures/graphdb-import/resource-test-data.ttl <gdb>/repositories/verify-$RID-nav/statements`
  → `204`.

- **Open.** `$PW open '@/graphs-visualizations?repositoryId=verify-$RID-nav&uri=http:%2F%2Fexample.com%2Fontology%23CustomerLoyalty'`
  (a fresh session has no active repository; in a session where another one is active, confirm the switch:
  [driving.md](../reference/driving.md) › Setup data),
  `$PW wait '.graph-visualization .node-wrapper' 30000`, `$PW wait-gone '.loader-container,.node-loader' 30000`.
  Nodes: `$PW eval "JSON.stringify([...document.querySelectorAll('g.node-wrapper')].map(n=>n.__data__.iri))" --raw`
  → `CustomerLoyalty`, `Metric`, `…/person/W6J1827/customerLoyalty`. Proof `screenshot`.
- **Node info.** `$PW click '.node-wrapper[id="http://example.com/ontology#Metric"] circle'`,
  `$PW wait '.rdf-info-side-panel .tab-content'` → panel text `Metric … Types: No types … RDF Rank: 0`.
- **Expand.** `$PW dblclick '.node-wrapper[id="http://example.com/resource/person/W6J1827/customerLoyalty"] circle'`,
  `$PW wait-gone '.loader-container,.node-loader'` → 4 `g.node-wrapper` (was 3); `$PW requests` shows
  `GET …/rest/explore-graph/links?…iri=…customerLoyalty… => [200]`.
- **Error toast (fault injection).**
  `$PW route '**/rest/explore-graph/links*' --status 500 --body '{"message":"verify injected"}' --content-type application/json`,
  `$PW dblclick '.node-wrapper[id="http://example.com/ontology#Metric"] circle'`,
  `$PW wait '#toast-container .toast'` → text `Error exploring node / verify injected`. Proof `screenshot`.
  Always `$PW unroute '**/rest/explore-graph/links*'` (→ `Removed 1 route(s)`); `$PW route-list` →
  `No active routes`.
- **Save graph.** `$PW click '[data-cy="save-or-update-graph"]'`, `$PW wait '#wb-graphviz-savegraph-name'`,
  `$PW fill '#wb-graphviz-savegraph-name' verify-$RID-saved`, `$PW click '#wb-graphviz-savegraph-submit'`,
  `$PW wait '#toast-container .toast-success'` → `Saved graph verify-$RID-saved was saved.` Read-back:
  `GET <gdb>/rest/explore-graph/saved` lists it; `$PW goto '@/graphs-visualizations'` (same session, the
  repository stays selected) shows it under Saved graphs. Name it `verify-$RID-*` so cleanup removes it (see Gotchas).
- **Cypress.** No verify spec. The e2e specs in `e2e-tests/e2e-legacy/explore/visual-graph/` run with
  `$V/scripts/drive.sh <spec> --run-id $RID`.

## Gotchas

- Nodes are SVG `g.node-wrapper` with `id` = the IRI; their data (IRI, labels, types) is on the D3-bound
  `__data__` property, not in attributes. Click or double-click the inner `circle`.
- Wait for the loaders `.loader-container,.node-loader` to go before reading nodes or acting on them.
- Legacy pages toast into `#toast-container` (`.toast-success` seen on save), not the new `.onto-toast`.
- Saved graphs are global, not per repository (the same list comes back with any or no `X-GraphDB-Repository`).
  `cleanup.sh --run-id` deletes the ones named `verify-<run-id>-*` on the dev GraphDB; any other name outlives
  the run there (`curl -X DELETE <gdb>/rest/explore-graph/saved/<id>` → `204`).
- `open` on an open session restarts the browser and drops routes (pw.sh WARNs): add the route after the last
  `open`, right before the action it should break.
