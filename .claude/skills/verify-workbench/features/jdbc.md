# JDBC (SQL table configurations)

A user opens Setup › JDBC with a repository selected, creates an SQL table configuration (table name + SPARQL
SELECT data query with a `#!filter` placeholder + column types), previews the rows the table will expose, saves
it, and deletes it; external SQL clients then see the table through GraphDB's JDBC driver.

## Sub-features

- `jdbc-create` `Create new SQL table configuration` › table name › default data query
  (`SELECT ?id ?label { ?id rdfs:label ?label #!filter }`) › `Save` → `/jdbc` lists the table.
- `jdbc-columns-suggest` the first `Preview` with no columns suggests them (`ID` `VARCHAR: IRI`, `LABEL`
  `VARCHAR: String`) and switches to the `Column types` tab.
- `jdbc-preview` the second `Preview` renders the rows in the embedded result table (`ID LABEL`, one row per match).
- `jdbc-delete` row delete › `Warning` dialog `Are you sure you want to delete the SQL table configuration '<name>'?` › `Yes`.
- Edit (`.edit-query-btn`), `Suggest` button, column type/nullable/literal-type edits, column delete, cancel with
  unsaved changes, validation (`.jdbc-configuration-name-required`, `.invalid-query-mode`, `.invalid-query`),
  querying the table over JDBC/SQL (needs the GraphDB JDBC driver and a SQL client) — not driven.

## How to get to it (user POV)

- Menu `Setup` › `JDBC` (route `/jdbc`, page `[data-test="jdbc-page"]`); create/edit at
  `/jdbc/configuration/create`.
- Selectors: `[data-test="create-sql-table-configuration"]`, `.jdbc-configuration-name`, tabs `.nav-item`
  (`Data query`, `Column types`), `.column-suggestion-row`, `.preview-btn`, `.suggest-btn`, `.save-query-btn`,
  `.cancel-button`, list `#configurations-table` with `.edit-query-btn` / `.delete-configuration-btn`.
- Source: `packages/legacy-workbench/src/js/angular/jdbc/plugin.js` (`JdbcListCtrl`, `JdbcCreateCtrl` in
  `jdbc/controllers.js`), templates `src/pages/jdbc.html`, `src/pages/jdbc-create.html`; REST
  `rest/jdbc.rest.service.js`: `GET rest/sql-views/tables`, `GET|DELETE rest/sql-views/tables/<name>`,
  `POST|PUT rest/sql-views/tables[/<name>]` (save), `POST rest/sql-views/columns` (column names) +
  `POST rest/sql-views/types` (type suggestions), `POST rest/sql-views/preview`; edit route
  `/jdbc/configuration/create?name=<table>`; repository via header `X-GraphDB-Repository: <id>`.

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; `verify-<run-id>-jdbc` from `$V/scripts/repo.sh $RID jdbc`, selected, with a few
  `rdfs:label` triples POSTed to `/repositories/<id>/statements` (setup) so the preview has rows.

- **Run it (Playwright CLI, proven 2026-11-24, container stack, GraphDB 12.0.0-TR23).** `PW="$V/scripts/pw.sh $RID"`,
  `T='#configurations-table tr:has-text("verify_table")'`:
  - Create: `$PW goto "@/jdbc?repositoryId=verify-$RID-jdbc"`
    (repository-switch `Confirm`: [driving.md](../reference/driving.md) › Setup data) →
    `$PW wait '[data-test="create-sql-table-configuration"]'` → click it → `$PW wait '.ontotext-yasgui .CodeMirror' 30000`
    → `$PW fill '.jdbc-configuration-name' verify_table`.
  - Preview: `$PW click '.preview-btn'` (suggests columns, `Column types` tab) → `$PW click '.preview-btn'` again →
    `$PW wait '.ontotext-yasgui .yasr table' 30000` → rows `urn:verify:a alpha`, `urn:verify:b beta`.
  - Save: `$PW click '.save-query-btn'` → `$PW wait "$T"` on `/jdbc`; read-back
    `curl -s <stack>/rest/sql-views/tables/verify_table -H 'X-GraphDB-Repository: verify-$RID-jdbc'` → query +
    columns `id iri`, `label string`.
  - Delete: `$PW click "$T .delete-configuration-btn"` → `$PW click 'role=dialog >> role=button[name="Yes"]'` →
    `$PW wait-gone "$T"`; read-back `GET rest/sql-views/tables` = `[]`.
  `screenshot --filename=…` after each state.
- **Run it (Cypress).** No verify spec; `JdbcSteps` / `JdbcCreateSteps` (`e2e-tests/steps/setup/`) and
  `e2e-legacy/setup/jdbc/jdbc.spec.js` (create, edit, preview, delete) hold the selectors.

## Gotchas

- `Preview` is two-step on a new table: the first click only fills the column suggestions and switches tabs
  (`getPreview` in `jdbc/controllers.js`); wait for the result table after the second click.
- Table names are SQL identifiers; `verify_table` works, a `verify-<run-id>-…` name with `-` is not what the
  Cypress specs use (not tried).
- The configuration lives in the repository; the REST read-backs pick it with the `X-GraphDB-Repository` header.
- The editor is the same `ontotext-yasgui` as in [sparql-templates.md](./sparql-templates.md); an edit that only
  calls `CodeMirror.setValue` may not mark the form dirty (not tried here).
