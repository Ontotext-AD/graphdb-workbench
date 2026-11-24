# Gotchas

Traps that cost a run before. Per-feature traps live in that feature's `features/*.md` › Gotchas.

## Stacks

- Docker here is the snap package: it cannot see `/tmp` (where agent worktrees live) and fails silently with an
  empty mount. `container.sh` therefore copies `dist/` into its stack dir; GraphDB also refuses a read-only
  `workbench.home` (it calls `createDirectories()` on it).
- GraphDB answers `406` to a page request without `Accept: text/html` and serves a bootstrap page at `/` that
  fetches the real `index.html` by XHR: curl a content-hashed bundle (`main.*.js`) to check what is served.
- A container GraphDB starts empty: specs that assume other repositories fail (the repositories table vanishes
  when the last repository is deleted).
- The GraphDB java command line carries API keys in local setups: keep `ps` output and container env out of
  evidence.
- Every `doctor.sh` run lists the machine's `verify-wb-*` containers and WARNs about ones no run record owns:
  those belong to other sessions, leave them.

## Browser

- Playwright CLI sessions outlive the shell; `cleanup.sh --run-id <RID>` closes the run's own. Other
  `verify-wb-*` sessions are other agents': close only your own (never `close-all`/`kill-all`).
- Interactive sessions are not stubbed: the page sends Google Analytics hits (Cypress stubs them).
- Dev stack only: a runtime error opens the webpack overlay iframe, which swallows every click;
  `pw.sh <RID> errors` prints it and removes it.

## Cypress

- `cy.screenshot` with `capture: 'viewport'` resizes the app; the SPARQL result table then re-renders into an
  endless spinner. `proof()` uses `capture: 'runner'` for this reason.
- The base config sets `e2e.retries.runMode: 2` and `--config retries=0` does not override it, hence drive.sh's
  generated wrapper config.
- `e2e-tests/support/e2e.js` unsets the selected repository before every test: select it in the test
  (`cy.presetRepository`) or through the header selector.
- Repository params are matched by their **label**, and the labels in e2e `repo-template.json` are stale for
  `queryTimeout`, `enableContextIndex` and `enablePredicateList`: a `cy.createRepository` override of those is
  dropped without an error (a product test bug, reported separately). `repo.sh --param` takes the live labels.
