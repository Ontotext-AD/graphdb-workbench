# Interactive guides

A user opens Help › Interactive guides, sees the guides GraphDB ships (title, description, level), starts one,
and follows Shepherd step boxes that highlight the next element to click across Workbench views; the guide
advances when the user clicks the highlighted element or `Next`, and can be exited through a confirm dialog.

## Sub-features

- `guides-list` lists the guides from `GET /rest/guides` (GraphDB 12.0.0-TR23 ships `star-wars` and
  `movies-database`, both `Beginner`).
- `guides-start` the row's play button starts the guide: Shepherd box `Welcome to <guide> — 1/2`.
- `guides-advance` `Next` advances; on an interactive step, clicking the highlighted element (`.shepherd-target`)
  advances and navigates (Setup › Repositories → `/repository`, step `Create repository — 4/7`).
- `guides-exit` the box's X opens the confirm dialog (`Exit the guide?`, buttons `Cancel` / `Exit`); `Exit` removes
  every `.shepherd-element`.
- `guides-autostart` `/?autostartGuide=<guideId>` starts the guide on load; its exit dialog adds
  `Don't start automatically`.
- `guides-mocked` a guide list served by a Playwright route mock renders and starts like a shipped one.
- Pagination / page size, `Skip section`, `Previous`, a full guide run (creates and imports a `movies`/`starwars`
  repository the run did not name), `Don't start automatically` — not driven.

## How to get to it (user POV)

- Menu `Help` › `Interactive guides` (`[data-test="sub-menu-guide"] a`, route `/guides`; menu role
  `ROLE_REPO_MANAGER`).
- Row play button: `#guides-table tr:has-text("<guide name>") button`.
- Source: route/menu `packages/legacy-workbench/src/js/angular/guides/plugin.js`, list `GuidesCtrl`
  (`guides/controllers.js`, template `src/pages/guides.html`), start → `GuidesService.startGuide`
  in `packages/api/src/services/domain/guides/` (`guides.service.ts`, Shepherd via `shepherd.service.ts`, REST
  `guides-rest.service.ts`); the legacy `guides/guides.service.js` only supplies the guide blocks.

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; any repository selected (the list works without one, see
  `e2e-legacy/help/guides/guides-without-repository.spec.js`).

- **Run it (Playwright CLI, proven 2026-11-24, container stack, GraphDB 12.0.0-TR23).** `PW="$V/scripts/pw.sh $RID"`,
  step box `B='.shepherd-element:visible'`:
  - List via menu: `$PW click 'role=button[name="Help"]'` → `$PW wait '[data-test="sub-menu-guide"]'` →
    `$PW click '[data-test="sub-menu-guide"] a'` → `$PW wait '[data-test="guides-list"]'`.
  - Start: `$PW click '#guides-table tr:has-text("The Movies database guide") button'` →
    `$PW wait "$B .shepherd-title"`; title `Welcome to The Movies database guide — 1/2`.
  - Advance: `$PW click "$B .shepherd-button:has-text(\"Next\")"` ×4 (2/2, Create repository 1/7, 2/7 `Click on the Setup menu.`) → `Create repository — 3/7`, `Click on the
    Repositories menu.`; `$PW click '.shepherd-target[data-test="sub-menu-repositories"] a'` → URL `/repository`,
    step `4/7` targeting `#wb-repositories-addRepositoryLink`.
  - Exit: `$PW click "$B .shepherd-cancel-icon"` → `$PW wait '[data-test="exit-btn"]'` → `$PW click` it →
    `$PW wait-gone '.shepherd-element'`.
  - Autostart: `$PW goto '@/?autostartGuide=star-wars'` → `$PW wait "$B .shepherd-title" 20000` →
    `Welcome to The Star Wars guide — 1/2`; exit dialog shows `[data-test="dont-show-again-btn"]`.
  - Mocked list (for a GraphDB without guides or a custom guide):
    `$PW run-code "async page => { await page.route('**/rest/guides', r => r.fulfill({json: [{guideId: 'verify-mock', guideName: {en: 'Verify mock guide'}, guideLevel: 0, steps: [{guideBlockName: 'welcome'}]}]})); }"`
    → `goto @/guides` → row `Verify mock guide` → start → `Welcome to Verify mock guide — 1/2`. Undo with
    `run-code "async page => { await page.unrouteAll(); }"`.
  Read the current box with `$PW eval` over `.shepherd-element` filtered by `checkVisibility()` (title,
  `.shepherd-text`, `.shepherd-button` labels) and `document.querySelector('.shepherd-target')`.
- **Run it (Cypress).** No verify spec; the repo's own specs replay with
  `$V/scripts/drive.sh e2e-tests/e2e-legacy/help/guides/guides-with-repository.spec.js` (cypress-legacy config;
  `e2e-legacy/guides/*` uses cypress-guides) —
  not run in this session.

## Gotchas

- Finished steps stay in the DOM hidden: `.shepherd-element .shepherd-button:has-text("Next")` hits strict mode
  (2+ matches). Scope every locator to `.shepherd-element:visible`.
- `wait '[data-test="confirm-cancel-dialog"]'` times out (the wrapper is not "visible" to Playwright) although the
  dialog shows; wait for `[data-test="exit-btn"]` instead.
- The row play button has no accessible name (`button ""` in the snapshot); target it by row text.
- Driving a guide to the end creates repositories named by the guide (`options.repositoryIdBase`, e.g. `movies`),
  not `verify-<run-id>-*`; `cleanup.sh --run-id` does not find them. Only do that on a container stack.
- Step boxes are `.shepherd-element` (Shepherd library), not ARIA dialogs; the `snapshot` tree is noisy around them —
  use `eval` reads.
