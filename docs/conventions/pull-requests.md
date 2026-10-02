# Pull requests

How to write a pull request description. The skeleton lives in
[`.github/pull_request_template.md`](../../.github/pull_request_template.md) and GitHub pre-fills it.

The goal: a reviewer understands **why** the change exists and **the shape of the implementation**
before opening the diff.

## Title and branch

| Item | Format | Example |
|---|---|---|
| Branch | `GDB-XXXXX-short-description` | `GDB-15269-repositories-page-accessible-names` |
| PR title | `GDB-XXXXX: Short description` | `GDB-15269: Add accessible names on the Repositories page` |
| Commit subject | same as the PR title | |

## Sections

| Section | Rule |
|---|---|
| Header | Link to the Jira ticket. Add the parent ticket, design, or related PRs when relevant. |
| **Why** | One or two sentences. The problem, not the solution. |
| **Special things to note** | 1-3 bullets a reviewer must not miss: surprising decisions, deliberate omissions, compatibility or migration concerns, what was not verified. Write `None.` when there are none. |
| **Change outline** | A visual summary of the change (see below). Not prose, not a file-by-file changelog. |
| **Testing** | Tests added or updated, manual verification steps, environments covered. |
| **Screenshots** | Before / after for every visible UI change. `No UI changes.` otherwise. |
| **Checklist** | Tick every item before requesting review. |

## Change outline

Pick the smallest set of views that explains the change. Put one short sentence before each block.
Tell the story in the order that is easiest to follow: sometimes the data shape first, sometimes the files.

- **Representative diff**: when the same pattern repeats, show it once.
- **Contract or type change**: API request/response, model, DTO, i18n keys.
- **File tree**: a shallow tree with the responsibility of each changed file.
- **Component or call tree**: when structure or control flow changed.
- **Pseudocode**: for changed business logic.

Use a `diff` block when an existing shape changes; use a plain (`text`, `ts`, `json`) block when the
shape is mostly new.

````markdown
The pattern is the same for every icon-only control on the page:

```diff
 <button class="btn btn-link delete-repository-btn"
+        aria-label="{{'repos.delete.repo.label' | translate: {repositoryId: repository.id} }}"
         ng-click="deleteRepository(repository)">
-    <em class="ri-delete-bin-6-line"></em>
+    <em class="ri-delete-bin-6-line" aria-hidden="true"></em>
 </button>
```

```text
packages/legacy-workbench/src/
├── pages/repositories.html                            # labels + aria-pressed
├── js/angular/repositories/templates/fedx-repo.html   # click handlers moved onto the buttons
└── i18n/locale-{en,fr}.json                           # 11 new parameterised keys
```
````

A full example: [#3265](https://github.com/Ontotext-AD/graphdb-workbench/pull/3265).

## Style

- Write in English, as one person explaining the change to another. Short sentences, no jargon.
- Leave out what the diff already says clearly. Keep what it does not: intent, trade-offs, gaps.
- Keep the template headings so PRs read the same way. Leave a section's `<!-- -->` hint in or remove it; it is not rendered.
