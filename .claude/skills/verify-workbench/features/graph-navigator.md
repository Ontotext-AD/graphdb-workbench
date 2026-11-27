# Graph navigator

A user opens Explore › Graph navigator for the selected repository and explores resources on a diagram
(`graphwise-reactodia`): a start resource or the graph of a CONSTRUCT query is placed on the canvas, and the
diagram is kept per repository across reloads. A user who can maintain the repository uploads, exports or resets
the repository's graph-navigator settings (a Turtle file) from a side drawer.

## Sub-features

- `gn-seed-uri` `?uri=<IRI>` places that resource on the canvas as a seed element.
- `gn-settings-upload` Settings › Browse a `.ttl` › Upload asks for confirmation, then stores the settings
  (`toast: The settings were uploaded`) and enables Reset.
- `gn-settings-reset` Reset asks for confirmation, then deletes the uploaded settings
  (`toast: The settings were reset to the defaults`).
- `gn-seed-query` `?query=<CONSTRUCT>&inference=&sameAs=` seeds the canvas with the query's graph — not driven
  yet (covered by the e2e spec, not driven with `pw.sh`).
- `gn-search`, `gn-settings-export`, `gn-settings-invalid` (upload errors under the file),
  `gn-repo-switch` (confirm dialog that clears the diagram), `gn-persist` (diagram kept on reload),
  `gn-autocomplete-warning`, entry from the SPARQL editor's "Explore in graph navigator" button — not driven yet:
  only the e2e spec `e2e-tests/e2e-legacy/graph-navigator/graph-navigator.spec.js` covers them.

## How to get to it (user POV)

- Menu `Explore` › `Graph navigator` (route `/graph-navigator`, new Angular app) with a repository selected.
- Deep link `/graph-navigator?repositoryId=<id>&uri=<encoded IRI>`; the SPARQL editor and the resource view
  open it with `uri`/`query` params.
- Entry points in source: page `packages/workbench/src/app/pages/graph-navigator/graph-navigator-page.component.*`,
  settings drawer `…/graph-navigator-settings/`, diagram facade
  `packages/workbench/src/app/components/graphwise-reactodia-facade/`, REST
  `packages/api/src/services/domain/graph-navigator/graph-navigator-rest.service.ts`
  (`rest/repositories/<id>/graph-navigator/settings`), menu entry in
  `packages/legacy-workbench/src/js/angular/graphexplore/plugin.js`.

## Driving it with verify-workbench

Preconditions:

- Baseline from the README, plus a repository named `SystemRepository` (see Gotchas). On a container stack:
  `$V/scripts/repo.sh $RID --system`. `cleanup.sh --run-id` removes it with the container; on the dev stack,
  never create or delete it.
- A repository with data: `$V/scripts/repo.sh $RID nav`, then
  `curl -X POST -H 'Content-Type: text/turtle' --data-binary @e2e-tests/fixtures/graphdb-import/resource-test-data.ttl <gdb>/repositories/verify-$RID-nav/statements`
  → `204`.

- **Menu.** `$PW click 'role=button[name="Explore"]'` → the submenu shows `link "Graph navigator"`
  (`/url: graph-navigator`).
- **Seed.** `$PW open '@/graph-navigator?repositoryId=verify-$RID-nav&uri=http:%2F%2Fexample.com%2Fontology%23CustomerLoyalty'`,
  `$PW wait 'graphwise-reactodia .reactodia-canvas [data-element-id]' 30000`; the elements' text
  (`$PW eval "[...document.querySelectorAll('graphwise-reactodia [data-element-id]')].map(e=>e.innerText)"`) is
  one element `Thing / CustomerLoyalty`. Proof `screenshot`.
- **Upload settings.** `$PW click '[data-test="graph-navigator-settings-btn"] button'`,
  `$PW wait '[data-test="graph-navigator-settings-sidebar"]'`, set the file through `run-code`:
  `page.locator('[data-test="graph-navigator-settings-upload"] .p-fileupload-choose-button input[type=file]').setInputFiles('<abs path>/e2e-tests/fixtures/graph-navigator/graph-navigator-settings.ttl')`,
  then `$PW click '[data-test="graph-navigator-settings-sidebar"] .p-fileupload-upload-button'` → dialog
  `.p-confirmdialog` "Confirm upload / The diagram might behave unexpectedly with the new settings.";
  `$PW click '.p-confirmdialog >> role=button[name="Yes"]'` → Reset button enabled
  (`document.querySelector('[data-test="graph-navigator-settings-reset-btn"] button').disabled === false`).
  Read-back: `GET <gdb>/rest/repositories/verify-$RID-nav/graph-navigator/settings` → `200` JSON.
- **Reset.** `$PW click '[data-test="graph-navigator-settings-reset-btn"] button'`, `$PW wait '.p-confirmdialog'`
  ("Confirm reset … with the default settings."), `$PW click '.p-confirmdialog >> role=button[name="Yes"]'` →
  toast `.onto-toast.success` "The settings were reset to the defaults". Proof `screenshot`.
- **Context path.** Same seed + upload on a `--context /graphdb` stack (`@/graph-navigator?…`) → same element,
  toast "The settings were uploaded"; `$V/scripts/check-paths.sh $RID` → `OK no request left …/graphdb/`.
- **Cypress.** No verify spec. `$V/scripts/drive.sh e2e-tests/e2e-legacy/graph-navigator/graph-navigator.spec.js --run-id $RID`
  on a container stack (its `before()` deletes and recreates `SystemRepository`: never on the dev stack).

## Gotchas

- The settings endpoint needs a repository named `SystemRepository`; a fresh container has none. Without it
  `GET …/graph-navigator/settings` answers `400 The system repository 'SystemRepository' does not exist.`, the
  console logs `Failed to load the graph-navigator settings`, and the page stays blank under the title (no
  `graphwise-reactodia` element, no toast): the page mounts the diagram only after the settings load.
- Toasts of the new Angular pages render as `.onto-toastr-container .onto-toast.toast.<success|error>`, not in the
  legacy `#toast-container`; waiting for `#toast-container .toast-success` times out.
- The confirm dialog is PrimeNG: its root has both `modal-dialog` and `p-confirmdialog`, its buttons
  `cancel-btn p-confirmdialog-reject-button` / `confirm-btn p-confirmdialog-accept-button`. Target
  `.p-confirmdialog >> role=button[name="Yes"]` or `.p-confirmdialog .confirm-btn`. Legacy pages use a Bootstrap
  modal (`.modal-footer .confirm-btn`) without `.p-confirmdialog`.
- Once a fresh container left `SystemRepository` and the test repository `INACTIVE` with `500 Plugin
  'literals-index' failed to initialize` (both created seconds apart, then opened in the UI). It stuck to the
  repository id (delete + recreate failed the same way); a new stack fixed it. Create `SystemRepository` first
  and touch it (`GET <gdb>/repositories/SystemRepository/size` → `0`) before creating the next repository.
- The Settings button renders only with `CAN_MAINTAIN_ACTIVE_REPO` (`*appRestrictAccess` in the page template);
  not driven with security on.
- `graphwise-reactodia` has no shadow root: `document.querySelector('graphwise-reactodia [data-element-id]')`
  reaches the canvas.
