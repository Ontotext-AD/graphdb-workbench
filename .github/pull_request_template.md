<!--
PR title: GDB-XXXXX: Short description (matches the branch name)
Guide: docs/conventions/pull-requests.md
HTML comments are not rendered; you can leave them in.
-->

[GDB-XXXXX](https://graphwise.atlassian.net/browse/GDB-XXXXX)

## Why

<!-- One or two sentences: the problem this PR solves and what changes for the user once it ships. -->


## Special things to note

<!--
1-3 bullets a reviewer must not miss: surprising decisions, deliberate omissions,
compatibility or migration concerns, what was NOT verified. Write "None." if there are none.
Ask yourself: can this be rolled back with a revert (deleted data, a changed public contract,
a migration)? What can break outside this screen (consumers, plugins, legacy pages, layout)?
-->
- None.

## How to use

<!--
Optional. Keep it when the PR adds a UI interaction a reviewer would not find by looking:
keyboard shortcuts, gestures, hidden states. Where it is, the keys or steps, and what happens.
A table of keys and results works well. Remove the section otherwise.
-->


## Change outline

<!--
Only when the change is complex: a new or changed contract, a responsibility that moves,
a changed flow through several units, or two or more packages. Otherwise write "Not needed.".
Show the picture the diff does not: a table (before/after, contract, endpoints), a component
or call tree, a Mermaid sequence diagram, pseudocode, or a file tree. Mark changes in a tree
with +/- in a `diff` block. One short sentence before each view.
-->
Not needed.

## Testing

<!--
Name the tests that cover the change, not just the framework ("jest, cypress" says nothing).
A test that failed before and passes now is the strongest evidence. Add manual steps and
the environments covered.
-->


## Screenshots

<!-- Before / after for every visible UI change. Write "No UI changes." otherwise. -->


## Checklist

- [ ] Branch name follows `GDB-XXXXX-short-description`
- [ ] Target branch is correct
- [ ] Commit messages follow `docs/conventions/commits.md`
- [ ] Commits are squashed
- [ ] PR title follows `GDB-XXXXX: Description`
- [ ] PR description is complete (Why, Change outline, Testing, Screenshots)
- [ ] Tests added or updated
- [ ] Browser support verified
