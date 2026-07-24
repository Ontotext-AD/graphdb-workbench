# Conventions & workflow for agents

The house rules for making changes, and how to verify them. These apply to every task; the framework-specific specifics live in the sibling docs.

## Golden rules

1. Match the style already used in the target package.
2. Keep changes package-local unless a shared abstraction is clearly warranted.
3. Prefer extending existing services, interceptors, plugin registrations, and context APIs over introducing parallel patterns.
4. Import API-package code from `@ontotext/workbench-api` (see [architecture](architecture.md)).
5. Avoid broad refactors unless the task requires them.
6. Be careful with legacy AngularJS codepaths in `packages/legacy-workbench`.
7. When touching translations, validate them ([i18n](i18n.md)).
8. When touching plugin behavior, verify the extension point contract ([plugins](plugins.md)).
9. When touching styles, prefer `--gw-*` design tokens and check both light and dark themes ([theming](theming.md)).
10. In `packages/workbench`, prefer PrimeNG components for page UI ([frontend-angular](frontend-angular.md)).

## Workflow

**Before editing:**

- Read the nearest package `package.json`.
- Inspect existing patterns in the same folder/module.
- Search for the symbol/feature across packages before introducing a new abstraction.

**After editing** — run targeted checks first, then broaden. Typical order:

```bash
npm run lint
npm run validate   # if translations were touched
npm run test
```

If the change affects runtime wiring, also consider `npm run start`.

## Pre-commit hooks

Husky + lint-staged run ESLint and Stylelint on staged files automatically. If a commit is blocked, run `npm run lint` to see the errors. Each package has its own `eslint.config.js`; shared base configs are `eslint.config.base.js` and `stylelint.config.base.cjs` at the repo root.

## Definition of done

A change is usually complete when:

- Code follows the conventions of the target package.
- Imports use correct package boundaries and aliases.
- Lint passes.
- Translation validation passes (if relevant).
- Tests pass for the affected scope.
- Any plugin/interceptor/i18n wiring is updated consistently.
- Styling changes stay compatible with the Graphwise token pipeline and both light/dark themes.

## See also

- [Developers Guide hub](../developers-guide.md)
