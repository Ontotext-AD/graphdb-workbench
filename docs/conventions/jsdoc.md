# JSDoc conventions

JSDoc is reference text, not prose. A reader skims the first line and stops.

## Contents

- [Form](#form): multiline vs. single-line comments; `@param`, `@returns`, `@throws`.
- [Length](#length): one opening sentence and the line budgets.
- [Content](#content): document the contract and the why, not the how; say each thing once.
- [Tone](#tone): the literary habits to avoid.
- [Example](#example): a class, a field, and a method documented by these rules.

## Form

- Always use the multiline form for classes, interfaces, functions and methods:
  `/**`, the content, and `*/` each on their own line. "Multiline" is about
  formatting only — it is not licence to write more.
- Every exported class and interface, and every public method and property, gets a doc comment — in every
  package, legacy included for new and changed members.
- Single-line `/** ... */` is fine for fields, properties and enum members.
- Always document every parameter with `@param`, every return value with
  `@returns`, and every thrown error with `@throws`. Keep each to one line where
  the name and type already carry the meaning; add the constraint, the unit, or
  the empty/`null` case when there is one.

## Length

- Open with one sentence, on one line, saying what the thing is or does.
  Everything after it is optional and must earn its place.
- Budgets, excluding tags: **8 lines** for a class or interface, **5 lines** for
  a method, field or function. Over budget means the text is no longer API
  documentation — move it to an ADR or a `CONTEXT.md` and link to it:
  `See ADR-0001 for why the namespace is frozen.`
- A one-line delegating method with a self-describing name gets a one-line
  description plus its tags, and nothing else.

## Content
- Document the contract: what it requires, what it returns, what it throws. 
- Document the reasoning behind the design and the trade-offs made. The reader should be able to understand
  the "why" without reading the code.
- Avoid implementation details: the reader can read the code to see how it works. The
  doc comment is for what it does, not how.
- Say each thing once, where it is most specific. A fact stated on the class is
  not restated on the field, the method and the computed signal — reference it
  with `{@link}` instead.
- Explain non-obvious code at the code: ordering hazards, guards and
  workarounds belong in a one-line `//` comment on the line they protect, not
  in a paragraph the reader meets 200 lines earlier.
- No structure inside a doc comment: no headings, no bold for emphasis, no
  multi-paragraph argument. If it needs sections, it is a document, not a
  comment.
- No reference to spec files, JIRA tickets, or other external artifacts unless the reader is expected to follow them.

## Tone

State facts plainly. These read as literary and cost the reader time:

- Rhetorical negation — "not a form of its own", "a request that finished is
  not a page that finished".
- Aphorisms and flourishes — "belongs to nobody", "which is the point",
  "whatever became of it afterwards".
- More than one em-dash aside per paragraph.
- Narrating the user's experience — "the user can watch it follow the label
  they are typing" — where a fact would do: "re-derived on every form change".

## Example

```ts
/**
 * Lists the projects the current user can open.
 *
 * Projects are loaded once per visit and filtered client-side, because the
 * API has no search endpoint (ADR-0003). {@link ProjectsService} owns the
 * cache; this page only reads from it and never writes.
 */
export class ProjectsCatalogPage {
  /** Whether the first load finished. Never reset — reloads keep the list visible. */
  private readonly loaded = signal(false);

  /**
   * Returns the projects whose label contains the filter text.
   *
   * @param filter - Case-insensitive text; empty returns every project.
   * @returns The matching projects, in catalog order.
   */
  private matching(filter: string): Project[] {
    return this.projects().filter((project) => project.matches(filter));
  }
}
```
