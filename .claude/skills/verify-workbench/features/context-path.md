# Workbench behind a context path

A deployment can serve GraphDB under a path prefix behind a reverse proxy (e.g. `https://example.com/graphdb/`,
`graphdb.external-url` set to that URL). Every page, asset and REST call of the Workbench then has to stay under
the prefix: opening a deep link, reloading it and navigating through the menu all keep the prefix in the URL,
and nothing is requested from the bare origin. Changes to routing, navigation or URL building break this most
often.

## Sub-features

- `ctx-deep-link` opening `<prefix>/<route>` directly renders that route.
- `ctx-trailing-slash` a deep link with a trailing slash (`<prefix>/graphs/`) lands on `<prefix>/graphs`
  (inline script in `packages/root-config/src/index.ejs`).
- `ctx-reload` reloading a deep link renders the same route again (server fallback + `base href`).
- `ctx-menu-nav` menu navigation and back keep the prefix in the URL.
- `ctx-no-escape` no request (page, asset, REST, i18n, plugin) goes to the origin outside the prefix.
- `ctx-forward` browser forward — not verified: forward after back stays on the previous route in **both**
  root and context mode (seen on 12.0.0-TR4 with Workbench 4.0.0-TR11), so it is not a context-path signal.

## How to get to it (user POV)

- Any route, reached under the prefix: `http://localhost:<port>/graphdb/<route>` of a context stack.

## Driving it with verify-workbench

Preconditions:

- A context stack of the checkout under test: `$V/scripts/container.sh up --run-id $RID --context /graphdb`
  (builds the tree, prints `READY: http://localhost:<port>/graphdb`). Cypress does not run here (see Gotchas);
  drive with `pw.sh`.

- **Deep link + reload.** `$PW open "@/graphs/?repositoryId=<repo>"` → `Page URL` is `…/graphdb/graphs?…`
  (slash stripped) and the route renders (`$PW wait '#wb-export'`); `$PW reload` → same URL, `#wb-export` again.
  Proof `screenshot`. Wait for an element of the route, not a menu link: the navbar renders on every route.
- **Menu navigation.** `$PW click 'role=link[name="SPARQL"]'` → `…/graphdb/sparql`, `$PW wait '#title-container'`;
  `$PW go-back` → `…/graphdb/graphs`, `#wb-export`. Repeat for every route the change touches.
- **No escape.** After the scenario: `$V/scripts/check-paths.sh $RID` — exit 0 and `OK no request left …`.
  It saves the full request log to the run's evidence dir. Proven negative: a page-side
  `fetch('/rest/info/version')` is reported as `FAIL requests outside …` (exit 1).
- For the change itself, drive its own scenario under the prefix the same way, then `check-paths.sh`.

## Gotchas

- `drive.sh` refuses context stacks (exit 65): the repo's Steps/commands intercept absolute paths
  (`cy.intercept('/rest/locations')`), which never match under `/graphdb/`, so specs time out on the harness.
- `assets/env.json` answers 500 on every load in a production build — expected, not a regression;
  `check-paths.sh` lists it as WARN. The `favicon.ico` 500 is the browser's own request: it shows in
  `console error`, not in the request log `check-paths.sh` reads.
- nginx in the stack answers 404 `outside context path` for anything outside the prefix instead of
  redirecting, so an escaped request is also visible as a console error.
