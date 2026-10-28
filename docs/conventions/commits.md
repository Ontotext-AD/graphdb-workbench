# Commits

How to write a commit message.

## Subject

`GDB-XXXXX: Short description`, taken from the branch name.

| Branch | Subject |
|---|---|
| `GDB-15269-repositories-page-accessible-names` | `GDB-15269: Add accessible names on the Repositories page` |

Imperative mood, sentence case, no trailing period.

## Body

```
Before: <The behaviour before the change.>

After: <The behaviour after the change.>

Special things to note: <Optional. What needs further explanation.>
```

Example:

```
GDB-15304: Add autocomplete warning on entity search

Before: Entity search in the Graph Navigator gave no hint when it relied
on the autocomplete index and autocomplete was off.

After: A warning toast, shown once per repository, explains why the
search finds nothing and links to the autocomplete view. The RDF search
also warns once per repository.
```

## Rules

- A commit message is reference text, not prose.
- A commit message is not rendered as markdown: use plain text.
- Describe behaviour, not code: the diff shows the code.
- For a change with no visible behaviour (a refactor, a dependency bump), describe the structure:
  `Before: the tooltip HTML was built in the selector. After: it is its own component.`
- Put each effect on its own line under `After:` when the change has several.
- Leave out `Special things to note:` when there is nothing to note.
- Leave out test changes.
