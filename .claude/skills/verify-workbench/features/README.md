# GraphDB Workbench verification map

This directory is the maintained source for verifying user-facing behavior of the Workbench UI. Read this index,
then use the matching feature file as the recipe. Commands assume `V=.claude/skills/verify-workbench` from the
repo root.

## Baseline preconditions

- Either a container stack of the checkout under test (`$V/scripts/container.sh up --run-id <id>` reports
  `READY`, `$V/scripts/doctor.sh --run-id <id>` exits 0) — required for worktrees and context paths — or
- the dev stack: GraphDB answers at `http://localhost:7200` with security off, `$V/scripts/launch.sh` reports
  `READY` or `REUSING`, and `$V/scripts/doctor.sh` exits 0.
- No other Cypress run is driving the stack (`doctor.sh` warns).
- Every recipe creates its own `verify-<run-id>-*` repositories and deletes them in `after()`; never drive or
  modify a repository the run did not create.

## Driving conventions

- Drive interactively with `$V/scripts/pw.sh <run-id> …` (Playwright CLI) or replay a spec with
  `$V/scripts/drive.sh <spec>` (Cypress); one driver at a time, serially.
- Prefer the repo's Steps classes (`e2e-tests/steps/`) and stable ids (`#wb-…`, `data-test` via
  `cy.getByTestId`) over text, DOM position or coordinates.
- Use REST commands (`cy.createRepository`, `cy.importRDFTextSnippet`) only to set up state that is not the
  feature under test.
- Run `$V/scripts/cleanup.sh --run-id <run-id>` after the last drive, and after every failed one.

## Proof and skip reporting

- Each proof has a `proof()` screenshot of the action's resulting state and, for mutations, a
  `side-effects/*.json` read-back through REST or SPARQL.
- Look at the last screenshot of each spec before calling it verified.
- Report the evidence directory (last line of `drive.sh` output) with the feature and entry point used.
- A sub-feature listed here but not driven is reported as not verified, never as covered by a neighbor.

## Feature entry contract

Each feature file has an H1 title, one paragraph of user-visible behavior, then exactly these H2s:
`Sub-features`, `How to get to it (user POV)`, `Driving it with verify-workbench`, `Gotchas`. The driving
section gives the Cypress spec and, where proven, the Playwright CLI command sequence.

## Features

- [Repositories](./repositories.md) — create, list, select and delete a GraphDB repository. Spec:
  `specs/repositories.cy.js`.
- [Import RDF text snippet](./import-text-snippet.md) — import pasted RDF into the selected repository. Spec:
  `specs/import-text-snippet.cy.js`.
- [SPARQL query](./sparql-query.md) — run a SELECT in the SPARQL editor and read the result table. Spec:
  `specs/sparql-query.cy.js`.
- [Graphs overview](./graphs-overview.md) — list named graphs and open one in the resource view. Spec:
  `specs/graphs-overview.cy.js`.
- [Workbench behind a context path](./context-path.md) — deep links, reload, menu navigation and no request
  outside `/graphdb/` on a context stack. Driven with `pw.sh` + `scripts/check-paths.sh` (no Cypress spec).
