# SPARQL templates

A user opens Setup › SPARQL Templates with a repository selected, creates a named SPARQL UPDATE template (template
IRI + query in an embedded SPARQL editor), sees it listed, opens it to edit the query, and deletes it; templates are
stored per repository.

## Sub-features

- `templates-create` `Create new SPARQL template` › IRI + UPDATE query › `Save` → back on `/sparql-templates`, row
  with the IRI.
- `templates-edit` row IRI link opens `/sparql-template/create?repositoryId=<id>&templateID=<iri>` with the
  stored query; `Save` is disabled until a key event marks the editor dirty; saving stores the new query.
- `templates-delete` row delete › `Warning` dialog `Are you sure you want to delete the SPARQL template '<iri>'?` › `Yes`.
- Validation messages (`.template-id-required`, `.template-id-invalid`, `.invalid-query-mode` for a non-UPDATE
  query, `.invalid-query`), unsaved-changes confirm on navigation, executing a template from SPARQL — not driven
  (the Cypress spec `e2e-legacy/setup/sparql-template/sparql-template-create.spec.js` covers the validation).

## How to get to it (user POV)

- Menu `Setup` › `SPARQL Templates` (route `/sparql-templates`, page `[data-test="sparql-templates-page"]`);
  create/edit at `/sparql-template/create`.
- Selectors: `[data-test="create-sparql-template-link"]`, `.sparql-template-id`, editor
  `.ontotext-yasgui .CodeMirror`, `.save-query-btn`, `.cancel-query-btn`, list `#configurations-table` rows with
  `a.configuration-name` and `.delete-configuration-btn`.
- Source: `packages/legacy-workbench/src/js/angular/sparql-template/plugin.js` (`SparqlTemplatesCtrl`,
  `SparqlTemplateCreateCtrl` in `sparql-template/controllers.js`), templates `src/pages/sparql-templates.html`,
  `src/pages/sparql-template-create.html`; REST `rest/sparql-templates.rest.service.js`:
  `GET|POST|PUT|DELETE rest/repositories/<id>/sparql-templates`, query read-back
  `GET …/sparql-templates/configuration?templateID=<iri>`.

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; `verify-<run-id>-tpl` from `$V/scripts/repo.sh $RID tpl`, selected.

- **Run it (Playwright CLI, proven 2026-11-24, container stack, GraphDB 12.0.0-TR23).** `PW="$V/scripts/pw.sh $RID"`,
  `T='#configurations-table tr:has(a.configuration-name:text-is("http://example.com/verify-template"))'`:
  - Create: `$PW goto "@/sparql-templates?repositoryId=verify-$RID-tpl"`
    (repository-switch `Confirm`: [driving.md](../reference/driving.md) › Setup data) →
    `$PW wait '[data-test="create-sparql-template-link"]'` → click it → `$PW wait '.ontotext-yasgui .CodeMirror' 30000`
    (editor starts with a sample `DELETE … INSERT … WHERE` query) →
    `$PW fill '.sparql-template-id' 'http://example.com/verify-template'` →
    `$PW eval "document.querySelector('.ontotext-yasgui .CodeMirror').CodeMirror.setValue('INSERT { ?id <urn:verify:p> \"templated\" } WHERE { }')"`
    → `$PW click '.save-query-btn'` → URL `/sparql-templates`, `$T` present; read-back
    `GET /rest/repositories/<id>/sparql-templates` = `["http://example.com/verify-template"]`.
  - Edit: `$PW click "$T a.configuration-name"` → editor shows the stored query → `setValue(…"edited"…)` as above →
    `$PW js "document.querySelector('.ontotext-yasgui .CodeMirror').CodeMirror.focus()"` → `$PW press End` (marks
    dirty, `.save-query-btn` enabled) → `$PW click '.save-query-btn'` → `$PW wait "$T"`;
    read-back `…/configuration?templateID=…` returns the `"edited"` query.
  - Delete: `$PW click "$T .delete-configuration-btn"` → `$PW click 'role=dialog >> role=button[name="Yes"]'` →
    `$PW wait-gone "$T"`; read-back `[]`.
  `screenshot --filename=…` after each state.
- **Run it (Cypress).** No verify spec; `SparqlTemplatesSteps` / `SparqlCreateUpdateSteps`
  (`e2e-tests/steps/setup/`) hold the selectors.

## Gotchas

- The edit view's dirty flag comes from a jQuery `keyup` on `.CodeMirror textarea`
  (`core/directives/yasgui-component/yasgui-component.directive.js`). `CodeMirror.setValue` and `type` do not fire
  it, so `Save` stays disabled; follow `setValue` with `CodeMirror.focus()` and `$PW press End`. The editor does not
  take focus on load (GDB-15818): `press End` without `focus()` lands on the page and `Save` stays disabled.
  A new template saves without it (`isNewTemplate`).
- The Cypress steps type the IRI with `{force: true}` because the editor grabs focus while loading; `fill` after the
  editor is visible avoids that.
- The template IRI must be a valid absolute IRI (`.template-id-invalid` otherwise) and the query an UPDATE.
