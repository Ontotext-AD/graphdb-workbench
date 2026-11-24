# My Settings

A user opens Setup › My Settings, changes the SPARQL editor defaults (expand over owl:sameAs, include inferred
data, show schema in the visual graph, count total results, ignore shared queries) or the Workbench theme, and
saves; the defaults are stored on the GraphDB user and the theme in browser storage, and both apply right away.

## Sub-features

- `settings-sparql-defaults` toggles inference / sameAs / schema and saves to the user's `appSettings`; the SPARQL
  editor then opens with the new default (`icon-inferred-off`).
- `settings-sameas-follows-inference` switching inference off also switches sameAs off and disables its toggle
  (`shouldDisableSameAs()`); sameAs must be switched on again by hand after inference is back on.
- `settings-theme` Workbench settings › Theme (`#themeSelect`: System / Light / Dark); shows `Save changes to apply
  the new theme.` until saved; saved to localStorage `ontotext.gdb.application.settings`.
- `settings-return` after a successful save the view returns to the previous route after 2 s.
- `settings-count`, `settings-ignore-shared` (plain checkboxes `#defaultCount`, `#ignore-shared`), password change
  (security on), cookie policy button — not driven.

## How to get to it (user POV)

- Menu `Setup` › `My Settings` (`[data-test="sub-menu-my-settings"]`, route `/settings`), or the header user menu
  `My Settings` when security is on.
- Source: route in `packages/legacy-workbench/src/js/angular/security/plugin.js`, controller
  `security/controllers/user-settings.controller.js` (`UserSettingsController`), template
  `security/templates/user.html` (shared with Edit user). Save = `PATCH /rest/security/users/<username>`
  (`UsersRestService.updateCurrentUser`); read-back `GET /rest/security/users/admin` (security off = `admin`).

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; a `verify-<run-id>-ms` repository from `$V/scripts/repo.sh $RID ms` for the SPARQL check.
  The settings are global for the user: restore them at the end (the run's container makes this harmless, the
  dev stack does not).

- **Run it (Playwright CLI, proven 2026-11-24, container stack, GraphDB 12.0.0-TR23).** `PW="$V/scripts/pw.sh $RID"`:
  - Open via menu: `$PW goto @/graphs` → `$PW wait '#wb-export'` → `$PW click 'role=button[name="Setup"]'` →
    `$PW wait '[data-test="sub-menu-my-settings"]'` → `$PW click` it → `$PW wait '#user-settings'`.
  - Inference off: `$PW click 'label[for="inferenceCheck"]'` → `$PW eval "document.querySelector('#inferenceCheck').checked"`
    is `false` → `$PW click '#wb-user-submit'` → toast `The user admin was updated.` →
    `curl -s <stack>/rest/security/users/admin` shows `DEFAULT_INFERENCE: false, DEFAULT_SAMEAS: false`.
  - Effect: `$PW goto '@/sparql?repositoryId=verify-$RID-ms'` → `$PW wait '.yasqe_inferStatementsButton' 30000` →
    its class contains `icon-inferred-off`.
  - Theme: `$PW select '#themeSelect' 'Dark'` → save → `<html class="… dark">`, localStorage
    `ontotext.gdb.application.settings` = `{"theme":"default","themeMode":"dark"}`. Selecting `Light` afterwards
    shows `.alert-save` `Save changes to apply the new theme.` and `<html>` keeps `dark` until saved.
  - Return: entering from `/graphs` via the menu, toggling `label[for="schemaCheck"]` and saving lands on
    `/graphs` ~2 s later; read-back `DEFAULT_VIS_GRAPH_SCHEMA: false`.
  - Restore: toggle back inference **and** sameAs, schema, `select '#themeSelect' 'System (Currently Light)'`, save,
    read back all `true`.
  `screenshot --filename=…` after each state. No Cypress spec yet; `e2e-legacy/setup/settings/my-settings.spec.js`
  and `SettingsSteps` (`e2e-tests/steps/setup/settings-steps.js`) hold the Cypress selectors.

## Gotchas

- The switch inputs (`#inferenceCheck`, `#sameAsCheck`, `#schemaCheck`) are visually hidden; `click` on them fails
  as not visible. Click their `label[for=…]`.
- Turning inference off silently clears sameAs too; a restore that only re-enables inference leaves
  `DEFAULT_SAMEAS: false` for later runs.
- After a `goto @/settings` (full load) there is no previous route and the view stays on `/settings` after saving;
  only menu navigation shows the return-to-previous-route behavior.
- The theme select's option labels are dynamic (`System (Currently Light)`); select `Light`/`Dark` by label, or
  read the options first.
- The template is shared with Setup › Users › Edit user (`/user/<name>`); a change there can break this view.
