# Graphs overview

A user opens Explore › Graphs overview for the selected repository, sees the default graph and every named
graph, and opens a graph to see its statements in the resource view.

## Sub-features

- `graphs-list` lists the default graph and named graphs.
- `graphs-open` opens a named graph at `/resource?uri=<graph>&role=context&repositoryId=<id>` with its statements.
- `graphs-search`, `graphs-pagination`, `graphs-export` (per row / selected / whole repository),
  `graphs-delete` — not driven.

## How to get to it (user POV)

- Menu `Explore` › `Graphs overview` (route `/graphs`) with a repository selected.
- Graph link in a row of `#export-graphs` (row found by `a[title="<graph IRI>"]`).

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; the spec creates `verify-<run-id>-graphs` and imports one TriG statement into
  `urn:verify:graph1` via REST.

- **List.** `cy.presetRepository(id); GraphsOverviewSteps.visit()`. `#wb-export` visible; default-graph row and
  `getGraphRow('urn:verify:graph1')` visible. Proof `01-graphs-list`.
- **Open graph.** Click the graph link. Path `/resource`, query `uri=urn:verify:graph1`, `role=context`;
  heading shows the IRI and the statement table shows `urn:verify:o`. Proof `02-graph-resource-view`.
- **Run it.** `$V/scripts/drive.sh $V/specs/graphs-overview.cy.js`.

## Gotchas

- The graph link's `href` is percent-encoded, but AngularJS `$location` rewrites the address bar to the decoded
  IRI (`uri=urn:verify:graph1`); parse it with `URLSearchParams` instead of matching `encodeURIComponent(iri)`.
- The heading renders before the statement table; wait for a statement value, not the heading.
- `cy.importRDFTextSnippet` needs `{format: 'application/x-trig'}` for named-graph data.
