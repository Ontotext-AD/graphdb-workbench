# Naming conventions

Names are read far more often than they are written. A reviewer should understand a symbol from its name alone.

- Name a property, input or flag after the behaviour or state it controls, not after the consumer that needs it.
  A child component doesn't know who its parent is.
- Booleans read as a yes/no question: `isMoreAvailable`, `shouldPrefix`, `hasReadAccess` — not `prefixedKey`.
- A name says what the code does: `createDialog` creates one; `repositionPopover` repositions, it doesn't sync.
- No abbreviations a newcomer can't expand (`vm`, `cta`). Spell it out: `viewModel`, `actionLabelKey`.
- No sequence names (`createScenario16`, `data2`). Name the case: `createReadOnlyUserScenario`.
- A specific thing gets a specific name: a service that only handles view restrictions is `ViewRestrictionService`,
  not `RestrictionService`. Don't add suffixes the siblings don't have (`…Snapshot`).
- Renaming a feature renames everything: files, classes, components, routes, i18n keys, `data-test` attributes,
  guide selectors and e2e steps. A half-renamed feature has two names forever.
- Test-only helpers say so in the file name: `resize-observer-testing-utils.ts`.

## See also

- i18n key names: [i18n](i18n.md#naming-keys)
- `fetch*` vs. `get*` / `find*`: [API domain layer](api-domain-layer.md#naming)
