# Class hierarchy

A user opens Explore › Class hierarchy for the selected repository and sees its RDF classes as nested circles
(circle packing, sized by instance count). Clicking a class zooms to it and opens a side panel with its instance
count and instances; a search box finds a class by name; a graph dropdown limits the diagram to one named graph;
the diagram is cached on the server and recalculated on demand when the data changed.

## Sub-features

- `ch-diagram` the diagram renders the top 50 classes (slider `aria-valuenow="50"`), e.g. `food:Grape`.
- `ch-class-panel` a click on a class zooms in, sets `#<class id>` in the URL and opens the side panel
  (`:Winery … View all 43 instances in SPARQL` and the instance list).
- `ch-search` the toolbar search finds a class by prefix and selects it on Enter.
- `ch-reload` after the data changed, the page shows the toast "Repository data has changed"; Reload → confirm
  recalculates (`rest/class-hierarchy?doReload=true`), here 50 → 74 classes.
- `ch-graph-dropdown` with a named graph the dropdown `#selectGraphDropdown` appears; choosing a graph redraws
  the diagram for it (`rest/class-hierarchy?graphURI=<graph>`).
- `ch-prefixes`, `ch-focus`, `ch-export-svg`, `ch-slider`, `ch-domain-range` (double click / panel button →
  `/domain-range-graph`), `ch-instances-link` — not driven yet (e2e `class.hierarchy.spec.js` covers them).

## How to get to it (user POV)

- Menu `Explore` › `Class hierarchy` (route `/hierarchy`) with a repository selected.
- Entry points in source: route + menu `packages/legacy-workbench/src/js/angular/graphexplore/plugin.js`,
  controller `graphexplore/controllers/rdf-class-hierarchy.controller.js`, diagram
  `graphexplore/directives/rdf-class-hierarchy.directive.js` (click handling via `D3.Click.delayDblClick` in
  `src/js/lib/common/d3-utils.js`), template `src/pages/rdfClassHierarchyInfo.html`, REST
  `src/js/angular/rest/graph-data.rest.service.js` (`rest/class-hierarchy`).

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; a repository with classes: `$V/scripts/repo.sh $RID cls`, then
  `curl -X POST -H 'Content-Type: application/rdf+xml' --data-binary @e2e-tests/fixtures/graphdb-import/wine.rdf <gdb>/repositories/verify-$RID-cls/statements`
  → `204` (1839 statements).

- **Diagram.** `$PW open '@/hierarchy?repositoryId=verify-$RID-cls'`, `$PW wait '#classChart #main-group' 30000`;
  `$PW eval "document.querySelector('.rz-pointer[role=slider]').getAttribute('aria-valuenow')" --raw` → `50`;
  51 circles `[data-test^="class-"]` (root + 50). Proof `screenshot`.
- **Class panel.** Click off the label, with a real mouse:

  ```bash
  $PW run-code "async page => { const b = await page.locator('[data-test=\"class-:Winery\"]').boundingBox();
    await page.mouse.click(b.x + b.width/2, b.y + b.height*0.85); await page.waitForTimeout(1500);
    return {url: page.url(), panel: (await page.locator('.rdf-info-side-panel').innerText()).slice(0,120)}; }"
  ```

  → URL ends `#44`, panel `:Winery … View all 43 instances in SPARQL … :McGuinnesso …`.
- **Search.** `$PW click '.toolbar-holder .search-icon'`, `$PW wait '#search_input_value'`, then
  `run-code`: `page.locator('#search_input_value').pressSequentially('Zinfan', {delay: 100})`, wait for
  `#search_input_dropdown` (rows `.angucomplete-row` → `:Zinfandel`), `press('Enter')` → URL `#50`, panel
  `:Zinfandel … View all 5 instances`.
- **Reload + graph dropdown.** Add a named graph by REST:
  `curl -X POST -H 'Content-Type: text/turtle' --data-binary @e2e-tests/fixtures/graphdb-import/resource-test-data.ttl '<gdb>/repositories/verify-$RID-cls/statements?context=%3Curn:verify:g2%3E'`.
  Reopen `@/hierarchy?…` → `#toast-container` "Repository data has changed …", slider still `50`,
  `#selectGraphDropdown` visible. `$PW click '.reload-diagram-btn'`, `$PW wait '.modal-footer .confirm-btn'`
  ("Calculating class hierarchy data may take some time. Are you sure?"), `$PW click '.modal-footer .confirm-btn'`,
  `$PW wait-gone '.modal'` → slider `74`. `$PW click '#graphsBtnGroup'` → items `The default graph`,
  `urn:verify:g2`; `$PW click '#selectGraphDropdown .dropdown-item >> text="urn:verify:g2"'` → button text
  `urn:verify:g2`, slider `24`, `$PW requests` shows `GET …/rest/class-hierarchy?graphURI=urn:verify:g2 => [200]`.
  Proof `screenshot`.
- **Cypress.** No verify spec. `$V/scripts/drive.sh e2e-tests/e2e-legacy/explore/class-hierarchy/class.hierarchy.spec.js --run-id $RID`.

## Gotchas

- Class clicks are `mousedown`/`mouseup` handlers (`delayDblClick`) on the `circle`, delayed to tell a click from
  a double click: `dispatchEvent('click')` does nothing, and `$PW click '[data-test="class-…"]'` lands on the
  centred label (times out; with `--force` no panel opens). Click the circle with `page.mouse.click` below
  the label, then wait ~1 s. A double click opens the domain-range graph instead.
- The side panel (`pageslide.rdf-info-side-panel`) is in the DOM while closed and its text then is only
  `Domain-Range graph … View all instances in SPARQL`; check for the class name, not for the panel.
- The search box is angucomplete: `fill` sets the value without key events and no dropdown opens (0 rows);
  type with `pressSequentially(…, {delay: 100})`.
- `rest/class-hierarchy` is cached per repository: after a data change the first GET answers `207` with the old
  diagram plus the "Repository data has changed" toast; only Reload (`doReload=true`) recalculates.
- The graph dropdown shows only with a named graph (`graphsInRepo.length > 2`); the list omits the graph that is
  selected (`All graphs` at first).
