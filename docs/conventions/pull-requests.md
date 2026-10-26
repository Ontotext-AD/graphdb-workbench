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
| **How to use** | Optional. How to trigger a new UI interaction a reviewer would not find by looking (see below). |
| **Change outline** | A visual summary of the change, only when the change is complex (see below). Otherwise `Not needed.` |
| **Testing** | The tests that cover the change, by name; a test that failed before and passes now is the strongest evidence. Manual steps, environments covered. |
| **Screenshots** | Before / after for every visible UI change. `No UI changes.` otherwise. |
| **Checklist** | Tick every item before requesting review. |

### Special things to note: two questions

- **Can it be rolled back?** A revert fixes most changes. Deleted data, a migration, or a public
  contract that other code already uses (an event, an API, a plugin extension point) does not
  roll back cleanly. Say so.
- **What can break outside this change?** Consumers of a changed component, plugins, legacy pages,
  layout on other screens.

## How to use

Add it when the PR adds a UI interaction that is not visible on the screen: keyboard shortcuts,
focus behaviour, gestures, states that need a setup. One or two lines, or a table:

| Keys | Result |
|---|---|
| Esc, then Tab | The focus moves to the next element after the editor |
| Tab / Shift+Tab | Indent / outdent, as before |

Leave out what the screenshots already show.

## Change outline

Give the reviewer the picture that is hard to put together from the diff: who calls whom, who owns what,
and what the contract between the parts looks like. Do not repeat what the changed lines say.

### When to write it

Write it when at least one of these applies:

| Criterion | Example |
|---|---|
| A **contract** between parts is new or changed: API request/response, model, component props or events | an event's detail changes from `{code, error}` to `{type, payload}` |
| A new component or service, or a **responsibility moves** between files or packages | tooltip HTML moves from the selector into its own component |
| The **data or control flow** through more than one unit changes | an upload error now travels API → page → settings popover |
| The change spans **two or more packages** | |

Otherwise write `Not needed.`. A local bug fix, style changes, a rename or a dependency bump usually does
not need one; Why and Screenshots are enough.

### Views

Pick the smallest set that explains the change, usually one or two. Put one short sentence before each.
Tell the story in the order that is easiest to follow: sometimes the contract first, sometimes the structure.

| View | Use it for |
|---|---|
| **Table** | before / after per package or part; a contract field by field; endpoints; who owns what |
| **Component tree** | UI structure that changed |
| **Call tree** | the path of data or an error through several units |
| **Mermaid sequence diagram** | an exchange between three or more participants (user, UI, service, backend) |
| **Pseudocode** | changed business rules or timing |
| **File tree** | files that are moved, deleted, or added as a new folder |

Mark changes in a tree with `+` / `-` in a `diff` block, instead of showing a code diff:

```diff
 <app-repository-picker-list>
+  <p-popover>                    # one for all rows, anchored to the hovered row
+    <onto-repository-info>
```

A table for a contract:

| | Before | After |
|---|---|---|
| Event | `graphwiseReactodiaError` | `graphwiseReactodiaEvent` |
| Detail | `{code, error}` | `{type, payload}` |

Show code only when the shape itself is the point, for example a new interface other code will implement.

## Style

- Write in English, as one person explaining the change to another. Short sentences, no jargon.
- Leave out what the diff already says clearly. Keep what it does not: intent, trade-offs, gaps.
- Keep the template headings so PRs read the same way. Leave a section's `<!-- -->` hint in or remove it; it is not rendered.
