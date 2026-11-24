# Class relationships

A user opens Explore › Class relationships for the selected repository and sees how many links connect its
classes as a chord diagram, next to a filterable list of all classes with their link counts. Adding or removing
a class from the list changes the diagram; the arrow of a class lists its related classes; a graph dropdown
limits it to one named graph.

## Sub-features

- `cr-diagram` the page shows the top 10 classes: label "Showing the dependencies between 10 classes", 10 chord
  groups `#dependencies-chord .group`, 10 active rows in `#wb-dependencies-classInClasses`.
- `cr-filter` typing in `.search-filter-field` filters the class list.
- `cr-add-remove` the row's `+` adds a class to the diagram (11 classes / 11 groups); "remove all" empties it
  ("Showing the dependencies between 0 classes / No dependencies between these classes").
- `cr-related` the row's arrow lists the related classes with counts in `#wb-dependencies-classToShow`.
- `cr-graph-dropdown` with a named graph, choosing it in `#selectGraphDropdown` reloads status, classes and
  matrix for that graph (`rest/dependencies/*?graphURI=<graph>`).
- `cr-direction` (all / in / out radios `.direction-filter`), `cr-reload` (recalculate after a data change),
  `cr-export-svg`, chord hover tooltips — not driven yet (e2e `class-relationships.spec.js` covers reload).

## How to get to it (user POV)

- Menu `Explore` › `Class relationships` (route `/relationships`) with a repository selected.
- Entry points in source: route + menu `packages/legacy-workbench/src/js/angular/graphexplore/plugin.js`,
  controller `graphexplore/controllers/dependencies-chord.controller.js` (`DependenciesChordCtrl`), diagram
  `graphexplore/directives/dependencies-chord.directive.js`, template `src/pages/dependencies.html`, REST
  `src/js/angular/rest/graph-data.rest.service.js` (`rest/dependencies/status|classes|matrix|update|predicates`).

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; a repository with classes: `$V/scripts/repo.sh $RID cls`, then
  `curl -X POST -H 'Content-Type: application/rdf+xml' --data-binary @e2e-tests/fixtures/graphdb-import/wine.rdf <gdb>/repositories/verify-$RID-cls/statements`
  → `204`. For the graph dropdown also import a named graph (as in `class-hierarchy.md`:
  `resource-test-data.ttl` with `?context=%3Curn:verify:g2%3E`).

- **Diagram.** `$PW open '@/relationships?repositoryId=verify-$RID-cls'`, `$PW wait '#dependencies-chord svg' 60000`;
  `$PW eval` → label "Showing the dependencies between 10 classes", 10 `.group`, 10 `.item .row.active`.
  Proof `screenshot`.
- **Filter.** `$PW fill '.search-filter-field' ':Wine'` → rows `:Winery|:WineSugar|:WineFlavor|:WineBody|:WineGrape|:WineColor`
  (first four active).
- **Add.** `run-code`: the row
  `page.locator('#wb-dependencies-classInClasses .item').filter({has: page.locator('.deps-class-name', {hasText: ':WineGrape'})})`,
  `.locator('.plusminus .ri-add-line').click()` → 11 classes, 11 groups, the row gets `.deps-data.active`.
- **Related + remove all.** Same row locator for `:Winery`, `.locator('.related-arrow').click()`, wait
  `#wb-dependencies-classToShow` → `:Zinfandel 10`, `:Chardonnay 10`, `:SauvignonBlanc 8`, …;
  `page.locator('.remove-all-classes-btn').click()` → 0 classes, 0 groups.
- **Graph dropdown.** `$PW click '#graphsBtnGroup'` → items `The default graph`, `urn:verify:g2`;
  `$PW click '#selectGraphDropdown .dropdown-item >> text="urn:verify:g2"'` → button `urn:verify:g2`, 10 classes;
  `$PW requests` shows `rest/dependencies/status|classes|matrix?…graphURI=urn:verify:g2 => [200]`.
- **Cypress.** No verify spec. `$V/scripts/drive.sh e2e-tests/e2e-legacy/explore/class-relationships/class-relationships.spec.js --run-id $RID`.

## Gotchas

- The class list is virtual-scrolled (`ui-scroll`, buffer 70): only a window of rows is in the DOM (50 of the
  repository's classes here), so filter first, then locate a row by `.deps-class-name` text.
- `fill` works on `.search-filter-field` (unlike the angucomplete search on Class hierarchy).
- Only the classes with links are listed; a class without relationships (e.g. `:WineDescriptor` in wine.rdf)
  has no row to add.
- Like Class hierarchy, a data change needs Reload (`.reload-diagram-btn` → `.modal-footer .confirm-btn`) to
  recalculate; not driven here, the e2e spec asserts it.
