# Import RDF text snippet

A user pastes RDF into the Import view's text-snippet dialog, confirms the import settings, and sees the snippet
listed as imported; the statements are then queryable in the selected repository.

## Sub-features

- `import-snippet-default` imports a snippet in the dialog's default format, `Format: Turtle` (the snippet dialog
  has no Auto option; N-Triples parses as Turtle).
- `import-snippet-format` imports with an explicit format (wrong format shows `RDF Parse Error:`) — not driven.
- `import-snippet-settings` base URI / named graph in the settings dialog — not driven.
- Sibling entry points on the same view — upload RDF files, Get RDF data from a URL, Server files tab — not driven.

## How to get to it (user POV)

- Menu `Import` (route `/import#user`, tab `User data`) with a repository selected.
- Card `Import RDF text snippet` (`#import-user .import-rdf-snippet-btn`) › textarea `#wb-import-textarea` ›
  `Import` (`#wb-import-importText`) › settings dialog `Import`.

## Driving it with verify-workbench

Preconditions:

- Baseline from the README; the spec creates an empty `verify-<run-id>-import` repository via REST.

- **Open.** Select the repo and open Import › User data. `ImportUserDataSteps.visitUserImport(id)`. Proof `01-import-user-data`.
- **Paste.** Open the snippet dialog and type one N-Triples statement.
  `openImportTextSnippetDialog(); fillRDFTextSnippet(snippet)`. Proof `02-snippet-filled`.
- **Import.** `clickImportTextSnippetButton()` then `ImportSettingsDialogSteps.import()`. Row 0 reads
  `Text snippet …` with `Imported successfully`. Proofs `03-import-settings`, `04-imported-successfully`.
- **Side effect.** SPARQL read-back of `<urn:verify:s1> <urn:verify:p1> ?o` returns exactly the imported
  literal; saved as `triple-read-back.json`.
- **Run it.** `$V/scripts/drive.sh $V/specs/import-text-snippet.cy.js`.

## Gotchas

- The snippet button's popover covers the modal; `openImportTextSnippetDialog()` already fires `mouseleave`.
- `fillRDFTextSnippet` types character by character; keep snippets short or use `pasteRDFTextSnippet`.
- "Imported successfully" alone is not proof; the SPARQL read-back is.
