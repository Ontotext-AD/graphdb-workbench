# Talk to Your Graph (TTYG)

A user opens Talk to Your Graph, creates an agent bound to a repository (model, context size, temperature/top-p,
query methods such as SPARQL over an ontology graph, full-text, similarity, retrieval, IRI discovery), then chats
with it; the agent answers natural-language questions by querying the repository through an LLM. Agents and chats
are stored by GraphDB.

## Sub-features

- `ttyg-no-agents` with no agents the view shows `[data-test="no-agents-view-component"]` (info text, `Create your
  first agent`, LLM API prerequisite message).
- `ttyg-create-modal` `Create your first agent` opens `Create Agent` with the selected repository preselected,
  model from the server defaults (`GET rest/chat/agents/default`, `gpt-4.1` on 12.0.0-TR23), query methods off.
- `ttyg-ontology-graph-check` saving with SPARQL › `Fetch ontology from a named graph` on an empty graph shows the
  toast `There is no data in the ontology named graph.`
- `ttyg-create-agent`, chats, agent edit/clone/delete, agent select menu, external integration (Dify / query
  methods URLs), explain response — **verified unreachable** on the container stack: with the ontology graph
  filled, `Save` gets `POST rest/chat/agents` 400/500 and the toast `Set the config property 'graphdb.llm.api-key'
  to your LLM API key`. Prerequisite: GraphDB started with `graphdb.llm.api-key` (and the matching LLM API type/URL
  for a non-OpenAI endpoint); `container.sh` sets none.

## How to get to it (user POV)

- Menu `Talk to Your Graph` (route `/ttyg`) with a repository selected.
- Selectors: `[data-test="no-agents-view-component"] .create-agent-btn`, modal `.agent-name-label input`,
  `.repository-id select`, methods `#<method>_method_heading .extraction-method-toggle label` (`sparql_search`,
  `fts_search`, `similarity_search`, `retrieval_search`, `autocomplete_iri_discovery_search`), SPARQL panel
  `#sparql_search_method_content .ontology-graph-option input[type=radio]` + `#ontologyGraph`, `.save-agent-settings-btn`.
- Source: `packages/legacy-workbench/src/js/angular/ttyg/plugin.js` (`TTYGViewCtrl`, template
  `ttyg/templates/ttyg.html`); REST `rest/ttyg.rest.service.js`: `rest/chat/agents`, `rest/chat/conversations`,
  `rest/chat/chats`; external integration URLs `rest/llm/tool/ttyg/<agentId>`, `rest/llm/ttyg/<agentId>/dify`.

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; a selected `verify-<run-id>-*` repository. For the ontology check, one triple in
  graph `urn:verify:ontology` (setup: POST `text/x-nquads` to `/repositories/<id>/statements`).

- **Run it (Playwright CLI, proven 2026-11-24, container stack, GraphDB 12.0.0-TR23, no LLM key).**
  `PW="$V/scripts/pw.sh $RID"`:
  - `$PW goto "@/ttyg?repositoryId=<repo>"` → `$PW wait '[data-test="no-agents-view-component"]' 30000`.
  - `$PW click '[data-test="no-agents-view-component"] .create-agent-btn'` → `$PW wait '.modal .agent-name-label input'`
    → `$PW fill` it `verify-agent` → `.repository-id select` shows the repo.
  - `$PW click '.modal #sparql_search_method_heading .extraction-method-toggle label'` (heading gets `selected`) →
    `$PW click '#sparql_search_method_content .ontology-graph-option input[type=radio]'` →
    `$PW fill '#sparql_search_method_content #ontologyGraph' urn:verify:ontology` →
    `$PW click '.modal .save-agent-settings-btn'`: empty graph → toast `There is no data in the ontology named
    graph.`; filled graph → toast `Set the config property 'graphdb.llm.api-key' …`, modal stays,
    `GET rest/chat/agents` = `[]`. Close with `.modal .close`.
- **Run it (Cypress).** The repo's TTYG specs (`e2e-tests/e2e-legacy/ttyg/`) stub every `rest/chat/*` call
  (`TTYGStubs`), so they replay without an LLM key; they prove UI wiring, not GraphDB's TTYG.

## Gotchas

- Error toasts vanish within a few seconds; screenshot or read `.toast` right after the click (a 4 s sleep missed it).
- No missing-API-key toast appears on opening `/ttyg` on a real GraphDB without a key; the e2e
  `getMissingApiKeyToastMessage` state is stubbed. The key error shows only on save.
- The ontology-graph check runs before the API-key check: fill the graph first, or the key error is never reached.
