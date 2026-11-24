# Monitoring (queries and system)

A user opens Monitor › Queries and Updates to see the queries and updates running on the selected repository
(id, node, user, type, query text, lifetime, state) and abort one after a confirm dialog, or Monitor › System to
watch live charts of the GraphDB process: Resource monitoring (CPU, file descriptors, heap, off-heap, disk),
Performance (queries, transactions/connections, entity pool, global cache) and Cluster health.

## Sub-features

- `monitor-queries-list` a running query shows as a row of `#wb-monitoringQueries-queryInQueries` (state
  `IN_HAS_NEXT`, lifetime ticking); none → `[data-test="no-running-queries-or-updates-alert"]`.
- `monitor-queries-abort` row `Abort query` (`.abortQuery`) › dialog `Confirm abort` › `Yes` stops the query: the row
  goes, the client's request ends with no bindings, `GET …/query/active` is `[]`.
- `monitor-system-resources` tab `Resource monitoring` (default): five `[data-test="*-chart"]` charts with SVG data.
- `monitor-system-performance` tab `Performance` (URL hash `#performance`): `#activeQueries`, `#connections`,
  `#epool`, `#globalCache` charts with data.
- Pause button (`[data-test="pause-button"]`), `Download` query, expand query text, updates (as opposed to queries),
  Cluster health tab (needs a cluster), Backup and Restore — not driven.

## How to get to it (user POV)

- Menu `Monitor` › `Queries and Updates` (`[data-test="sub-menu-queries-and-updates"] a`, route `/monitor/queries`)
  and `Monitor` › `System` (`[data-test="sub-menu-system-monitoring"] a`, route `/monitor/system`, menu role
  `ROLE_MONITORING`), with a repository selected.
- Source: routes `packages/legacy-workbench/src/js/angular/queries/plugin.js` (`QueriesCtrl`,
  `queries/controllers.js`, template `src/pages/monitor/queries.html`) and `resources/plugin.js` (`ResourcesCtrl`,
  `src/pages/monitor/resources.html`). REST `rest/monitoring.rest.service.js`:
  `GET rest/monitor/repository/<id>/query/active` (not in the OpenAPI docs), abort
  `DELETE rest/monitor/repository/<id>/query?query=<trackId>`, charts poll `rest/monitor/infrastructure`,
  `…/structures`, `…/cluster`.

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; `verify-<run-id>-mon` from `$V/scripts/repo.sh $RID mon` holding ~200 triples
  (setup via REST: POST 200 N-Triples lines to `/repositories/<id>/statements`, `Content-Type: text/plain`).
- A long-running query started outside the UI (setup, not the feature):
  `curl -s -m 300 -H 'Accept: application/sparql-results+json' --data-urlencode 'query=SELECT (COUNT(*) AS ?c) WHERE { ?a ?b ?c1 . ?d ?e ?f . ?g ?h ?i . ?j ?k ?l }' <stack>/repositories/<id>`
  in the background (200⁴ rows: runs for minutes). `GET <stack>/rest/monitor/repository/<id>/query/active`
  lists it with its `trackId`.

- **Run it (Playwright CLI, proven 2026-11-24, container stack, GraphDB 12.0.0-TR23).** `PW="$V/scripts/pw.sh $RID"`:
  - Queries: `$PW goto "@/monitor/queries?repositoryId=verify-$RID-mon"` → (repository-switch `Confirm`:
    [driving.md](../reference/driving.md) › Setup data) → `$PW wait '#wb-monitoringQueries-queryInQueries tbody tr'`; row text
    `<trackId> verify-…-mon admin QUERY … SELECT (COUNT(*) … IN_HAS_NEXT … Abort query`.
  - Abort: `$PW click '#wb-monitoringQueries-queryInQueries tbody tr:has-text("<trackId>") .abortQuery'` →
    `$PW wait 'role=dialog >> role=button[name="Yes"]'` → click it →
    `$PW wait '[data-test="no-running-queries-or-updates-alert"]' 30000`; read-back `…/query/active` = `[]`, the
    background curl ends (exit 18, empty bindings).
  - System: `$PW click 'role=button[name="Monitor"]'` → `$PW wait '[data-test="sub-menu-system-monitoring"]'` →
    `$PW click '[data-test="sub-menu-system-monitoring"] a'` → `$PW wait '#resourceTab [data-test="cpu-usage-chart"] svg' 60000`;
    each of the five `[data-test$="-chart"]` has an `svg` with paths and time ticks.
  - Performance: `$PW click '.performance-tab .nav-link'` → URL `…#performance` →
    `$PW wait '#performanceMonitorTab #activeQueries svg' 60000`.
  `screenshot --filename=…` after each state.
- **Run it (Cypress).** No verify spec; `QueriesAndUpdatesSteps` / `SystemMonitoringSteps`
  (`e2e-tests/steps/monitoring/`) and `e2e-legacy/monitor/` hold the selectors.

## Gotchas

- The abort confirm button is `Yes`, not `Confirm` (`Confirm` is the repository-switch dialog's button).
- `role=button[name="Monitor"]` toggles the submenu: on a `/monitor/*` route it is already open and the click
  closes it (sub-menu items then time out). Check `[data-test^="sub-menu-"]` visibility first or click twice.
- Chart data timing varies: on a stack up for ~20 min the CPU chart had data within 2 s of opening; earlier
  sessions saw ~25 s on a fresh stack. Wait up to 60 s for `svg`, then check paths/ticks, not just the container.
- Kill a stray long-running query with `DELETE <stack>/rest/monitor/repository/<id>/query?query=<trackId>` or by
  deleting the repository (not tried).
- After this recipe, with four `verify-*` repositories on the stack, creating a fifth failed with
  `400 Java heap space` (container heap then 2 GB, now 4g by default) even after `POST /rest/monitor/infrastructure/gc`; deleting the
  finished repositories fixed it. Delete the `mon` repository right after driving this feature.
