# GraphDB Workbench verification map

This directory is the maintained source for verifying user-facing behavior of the Workbench UI. Read this index,
then use the matching feature file as the recipe. Commands assume `V=.claude/skills/verify-workbench` from the
repo root and `PW="$V/scripts/pw.sh $RID"`.

## Baseline preconditions

- A stack of the checkout under test reports `READY` and `$V/scripts/doctor.sh [--run-id $RID]` exits 0:
  normally a container stack (`container.sh up --run-id $RID`), or the stack the feature names (context path,
  cluster, security). Choice and details: [../reference/stacks.md](../reference/stacks.md).
- The run follows [SKILL.md](../SKILL.md) › Rules every run keeps and ends with its Cleanup step.
- Setup data comes from `repo.sh` / `setup.sh` or the spec's `before()`, named `verify-<run-id>-*`; drive and
  modify only what the run created.
- Browser state comes from `pw.sh` helpers (`select-repo`, `theme`), not from clicking through settings, unless
  that setting is the feature under test.

## Driving conventions

- Drive interactively with `pw.sh` or replay a spec with `drive.sh`
  ([../reference/driving.md](../reference/driving.md)).
- Prefer the repo's Steps classes (`e2e-tests/steps/`) and stable ids (`#wb-…`, `data-test` via
  `cy.getByTestId`) over text, DOM position or coordinates.
- REST (`repo.sh`, `cy.createRepository`, `cy.importRDFTextSnippet`) only sets up state that is not the
  feature under test.
- Proof and reporting follow [../reference/evidence.md](../reference/evidence.md); a sub-feature listed in a
  feature file but not driven is reported as not verified, never as covered by a neighbor.

## Feature entry contract

Each feature file has an H1 title, one paragraph of user-visible behavior, then exactly these H2s:
`Sub-features`, `How to get to it (user POV)`, `Driving it with verify-workbench`, `Gotchas`. The driving
section gives the Cypress spec and, where proven, the Playwright CLI command sequence.

## Features

Setup and administration:

- [Repositories](./repositories.md) — create (plain, with ruleset + SHACL), list, select, edit, delete a
  repository; attach and detach a remote location. Spec: `specs/repositories.cy.js`.
- [Cluster management](./cluster.md) — cluster status, remove and add a node, replication through the external
  proxy. Driven with `scripts/cluster.sh` + `pw.sh` (no Cypress spec).
- [Login with local users](./security-login.md) — login, logout, free access and two tabs on a container stack
  with security on. Driven with `pw.sh` + `scripts/security.sh` (no Cypress spec).
- [Login with OpenID](./security-oidc.md) — Keycloak sidecar per run, OpenID login/logout, plain and context
  stack. Driven with `pw.sh` + `scripts/security.sh oidc-up` (no Cypress spec).
- [My Settings](./my-settings.md) — SPARQL editor defaults and theme for the current user. Driven with `pw.sh`.
- [Theme](./theme.md) — light, dark and follow-the-OS theme, set on My Settings. Driven with `pw.sh theme`.
- [Monitoring](./monitoring.md) — running queries list + abort, System resource/performance charts. Driven with
  `pw.sh`.
- [Workbench behind a context path](./context-path.md) — deep links, reload, menu navigation and no request
  outside `/graphdb/` on a context stack. Driven with `pw.sh` + `scripts/check-paths.sh`.

Import:

- [Import RDF text snippet](./import-text-snippet.md) — import pasted RDF into the selected repository. Spec:
  `specs/import-text-snippet.cy.js`.
- [Import user data](./import-user-data.md) — upload RDF files and import from a URL on Import › User data.
  Driven with `pw.sh`.

Explore:

- [Graphs overview](./graphs-overview.md) — list named graphs and open one in the resource view. Spec:
  `specs/graphs-overview.cy.js`.
- [Class hierarchy](./class-hierarchy.md) — circle-packing diagram, class panel, search, reload, graph dropdown.
  Driven with `pw.sh`.
- [Class relationships](./class-relationships.md) — chord diagram, filter, add/remove classes, related classes,
  graph dropdown. Driven with `pw.sh`.
- [Visual graph](./visual-graph.md) — open a resource, node info, expand, error toast by route fault injection,
  save a graph. Driven with `pw.sh`.
- [Graph navigator](./graph-navigator.md) — seed a resource on the `graphwise-reactodia` canvas, upload and reset
  the repository's settings. Needs a `SystemRepository`. Driven with `pw.sh`.
- [Similarity indexes](./similarity.md) — create a text index, search terms/documents, delete. Driven with
  `pw.sh`.

SPARQL and data access:

- [SPARQL query](./sparql-query.md) — run a SELECT in the SPARQL editor (`/sparql`) and read
  the result table. Spec: `specs/sparql-query.cy.js`.
- [SPARQL templates](./sparql-templates.md) — create, edit, delete UPDATE templates. Driven with `pw.sh`.
- [JDBC](./jdbc.md) — create, preview and delete SQL table configurations. Driven with `pw.sh`.
- [Talk to Your Graph](./ttyg.md) — no-agents view and create-agent form; agent creation and chat are
  unreachable without `graphdb.llm.api-key`. Driven with `pw.sh`.

Help:

- [REST API documentation](./rest-api.md) — Swagger UI in an iframe: render, Try it out → Execute, requests stay
  under a context path. Driven with `pw.sh run-code` + `frameLocator`.
- [Interactive guides](./guides.md) — list, start, advance, exit and autostart Shepherd guides; mocked guide
  list. Driven with `pw.sh`.
