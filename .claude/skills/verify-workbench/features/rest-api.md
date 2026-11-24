# REST API documentation

A user opens Help › REST API and browses the GraphDB and RDF4J REST APIs as two Swagger UI 5 documents, expands
an API group, and runs an operation from the page with "Try it out" → "Execute", seeing the request URL and the
live response. Behind a context path every request, including those Swagger UI sends, stays under the prefix.

## Sub-features

- `webapi-render` the page renders `iframe#webapi_frame` with the GraphDB API (`#swagger-ui-container-graphdb`)
  and the RDF4J API (`#swagger-ui-container-rdf4j`), each listing its `.opblock-tag` groups.
- `webapi-try-it-out` Try it out → Execute on an operation shows the request URL and the response code and body.
- `webapi-context-path` on a context stack the frame, its specs and the executed request stay under the prefix.
- `webapi-theme` Swagger UI follows the Workbench light/dark mode — not driven (covered by the e2e spec
  `rest-api-documentation-theme.spec.js`, not run here).
- `webapi-auth` the request carries the Workbench JWT when security is on — not driven (container stacks run with
  security off).

## How to get to it (user POV)

- Menu `Help` › `REST API` (route `/webapi`, no repository needed).
- Entry points in source: route in `packages/legacy-workbench/src/js/angular/webapi/plugin.js`, controller
  `webapi/app.js` (`WebApiCtrl` builds `<context>/res/swagger5/index.html?basePath=<context>`), template
  `src/pages/webapi.html`, Swagger UI setup `src/res/swagger5/swagger-initializer.js` (loads
  `<basePath>/rest/api/workbench` and `<basePath>/rest/api/rdf4j`, prefixes request paths with `basePath`).

## Driving it with verify-workbench

Preconditions:

- Baseline from the README. A repository makes the executed `GET /rest/repositories` return a non-empty list:
  `$V/scripts/repo.sh $RID rest`.

- **Menu.** `$PW open @/repository`, `$PW wait '#wb-repositories-addRepositoryLink'`,
  `$PW click 'role=button[name="Help"]'`, `$PW click 'role=link[name="REST API"]'` → `Page URL …/webapi`.
- **Render.** Swagger UI lives in the iframe, so use `run-code` with `frameLocator`:

  ```bash
  $PW run-code "async page => { const f = page.frameLocator('#webapi_frame');
    await f.locator('#swagger-ui-container-graphdb .opblock-tag').first().waitFor();
    return await f.locator('#swagger-ui-container-graphdb .opblock-tag').allInnerTexts(); }"
  ```

  → 19 groups, `Access Control List Management` … `Talk to Your Graph` (GraphDB 12.0.0-TR23).
- **Try it out.** Expand a group, open an operation, execute, read the data row:

  ```bash
  $PW run-code "async page => { const f = page.frameLocator('#webapi_frame');
    const c = f.locator('#swagger-ui-container-graphdb');
    await c.locator('.opblock-tag', {hasText: 'Repository Management'}).click();
    const op = c.locator('.opblock-get')
      .filter({has: f.locator('.opblock-summary-path[data-path=\"/rest/repositories\"]')}).first();
    await op.locator('.opblock-summary').click();
    await op.getByRole('button', {name: 'Try it out'}).click();
    await op.getByRole('button', {name: 'Execute'}).click();
    const st = op.locator('.live-responses-table .response .response-col_status').first();
    await st.waitFor();
    return {status: await st.innerText(), url: await op.locator('.request-url pre').innerText()}; }"
  ```

  → `{"status":"200","url":"http://localhost:<port>/rest/repositories"}`; the response body
  (`.live-responses-table .response-col_description pre.microlight`) lists `verify-$RID-rest`. Proof `screenshot`.
- **Context path.** Same two `run-code` calls on a `--context /graphdb` stack (`$PW open @/webapi`) → request URL
  `http://localhost:<port>/graphdb/rest/repositories`, status `200`; then `$V/scripts/check-paths.sh $RID` →
  `OK no request left …/graphdb/`. Its request log includes the iframe's requests
  (`res/swagger5/*`, `rest/api/workbench`, `rest/api/rdf4j`, the executed call).
- **Cypress.** No verify spec. The e2e specs in `e2e-tests/e2e-legacy/help/rest-api-documentatio/` (folder name
  is truncated on purpose) run with `$V/scripts/drive.sh <spec> --run-id $RID` on a root stack.

## Gotchas

- Swagger UI is inside `iframe#webapi_frame`: page-level `wait`/`click` selectors do not reach it; use
  `run-code` with `page.frameLocator('#webapi_frame')`. The controller keeps the iframe `display:none` until its
  document loads, so wait for `.opblock-tag` inside the frame, not for the iframe.
- Both APIs render into one frame; scope every locator to `#swagger-ui-container-graphdb` or `-rdf4j`, or
  operations with the same path match twice.
- Read the response code from `.live-responses-table .response .response-col_status` (the data row); the table
  header cell also has a status column whose text is `Code`.
- Product bug GDB-15784: on a cluster, Try it out goes through the cluster proxy to node 1 instead of the node
  the Workbench is opened on. Not reproducible on a single-node container stack.
