# Evidence

Where proof lands, what counts as proof, and the tools that produce comparative evidence. Evidence lives under
`~/.cache/verify-workbench/runs/<run-id>/` (root: `VERIFY_WB_OUT`) and survives cleanup.

## Layout

- `playwright/` — `pw.sh` output: your named `screenshot`/`snapshot` files, the CLI's `.playwright-cli/` logs.
  Save REST read-backs here too (`curl -s <url>/rest/repositories > …/side-effect-after-create.json`).
- `<spec-name>/` — one `drive.sh` run: `screenshots/<spec>.cy.js/NN-*.png` (`proof()` captures the Cypress
  runner: command log, URL bar and app; failures add `… (failed).png`), `side-effects/*.json` (REST read-backs,
  app errors), `cypress.log`, `summary.txt` (exit code, git sha, time). Re-driving with the same run id moves the
  old dir to `<spec-name>.prev-HHMMSS`; `--repeat` writes `iter-<i>/`.
- `compare/`, `smoke/`, `a11y/` — the tools below.

## Proof standard

- Exercise the real user path (menus, buttons, dialogs) for the behaviour being proven; REST only for setup,
  teardown and the second, read-only view of side effects.
- Capture the action and the resulting state, and read the side effect back (repository in
  `/rest/repositories`, triple returned by SPARQL) next to what is visible. Assert visibility (`be.visible`), not
  DOM presence: the SPARQL result table and the resource view render after their DOM exists.
- Open the final screenshot before claiming success.
- **Style changes:** `pw.sh css` read-back before and after; a screenshot alone, or the source, proves nothing
  about the computed value.
- **Vendored libraries** (yasgui, styleguide, D3 views): claims about their behaviour are proven in the running
  app, not argued from their code.
- Report the evidence directory with the feature and entry point; a sub-feature not driven is reported as not
  verified.

## Expected noise

`scripts/compare/noise.txt` holds the expected noise, one commented pattern per entry; `smoke.sh` and
`compare.sh` filter with it. New expected noise goes into that file.

## Before/after: `compare.sh`

Builds the baseline ref in its own cached worktree (`~/.cache/verify-workbench/baseline/<sha12>[-dep]`), starts
both stacks, shoots the same routes (or one `--steps` flow) with the same repository, viewport and theme, and
prints the HTML report (swipe slider, side by side, AE pixel table). Hand that page to the user.

- The baseline is always `compare.sh --ref <ref>`; another worktree's `dist/` or files swapped in place are no
  baseline.
- Identical code compares at 0 AE. Live data is noise: `/monitor/system` charts ~1 % AE, `/sparql-new` ~20 px
  (caret blink). A diff on a changed page is evidence, a diff elsewhere a regression or noise: open the diff PNG
  before claiming either.
- A/B of a dependency (styleguide …): `--ref HEAD --base-dep <pkg>=<dir or npm-pack .tgz>`, same commit on both
  sides. An unbuilt dependency branch: build it in its own checkout, `npm pack`, pass the .tgz.
- Annotated screenshot (red box + caption): `--mark '<selector>'`, or `shot(name, {mark, caption})` in a
  `--steps` file.
- It cleans both stacks unless `--keep`; the baseline worktree stays cached (removal command in `--help`).

## Smoke sweep: `smoke.sh`

Before a PR or after a wide change: every route of the build, errors and a screenshot each. Sweep a master stack
first and pass `--baseline <master-run-id>`, so only new errors fail (some bare routes error on master too).

## Accessibility: `a11y.sh`

Accessibility tickets are measured with the IBM Equal Access checker; read [a11y.md](a11y.md) before running it.
