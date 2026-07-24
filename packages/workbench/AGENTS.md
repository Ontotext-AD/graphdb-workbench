# AGENTS.md — packages/workbench

The main **Angular single-spa micro-frontend**: the core Workbench UI (SPARQL editor, login, page shell, shared components/directives) that mounts into the root-config shell.

> Part of the `graphdb-workbench` monorepo. Cross-cutting rules live in the [root AGENTS.md](../../AGENTS.md) and [docs/conventions/](../../docs/conventions/). **Read [frontend-angular.md](../../docs/conventions/frontend-angular.md) first** — it documents the standalone/signals/PrimeNG/dialogs/permissions/Transloco conventions. This file adds the concrete file map and package-specific facts.

## Stack & build

- **Angular 21**, standalone bootstrap (no NgModules). `src/app/app.config.ts` is the `ApplicationConfig`.
- **single-spa** via `single-spa-angular`. Entry `src/main.single-spa.ts` wraps `bootstrapApplication` and exports `bootstrap`/`mount`/`unmount`.
- Built with `@angular-builders/custom-webpack` (`angular.json` + `extra-webpack.config.js`): output module `workbenchApp.js`, `@ontotext/workbench-api` marked **external**. Dev port **9002**.

## Commands

| Task | Command |
|---|---|
| Dev server | `npm start` (`ng serve` on port `9002`) |
| Build | `npm run build` (prod); `npm run build:debug`, `npm run watch` |
| Test | `npm test` (`ng test` → **jest**, not karma) |
| Single test | `npx jest src/app/directives/restrict-access.directive.spec.ts` (or `-t "<name>"`) |
| Lint | `npm run lint` / `npm run stylelint` (+ `:fix`) |

## Layout (`src/app/`)

- `app.component.ts` — root `app-root`; wires single-spa `NAVIGATION_END` to the Angular Router.
- `app.config.ts` — providers: single-spa platform, router, **`providePrimeNG` with `prefix: 'gw'`** in the `primeng` cssLayer, `DialogService`, transloco.
- `app.routes.ts` — flat route table; every page via `loadComponent()`; page metadata (`title`/`helpInfo`/`documentationUrl`) in route `data`, resolved by `services/route-data-resolver.ts`.
- `bootstrap/` — `bootstrap.ts` aggregates providers; `bootstrap/transloco/transloco-bootstrap.ts` binds API-layer `LanguageContextService` bundles into `TranslocoService`.
- `services/` — `dialog/dialog-provider.service.ts` (+ `confirmation-provider`), `unsaved-changes/unsaved-changes.service.ts`, `logger/logger-provider.ts` (`Loggers.getLoggerInstance('Workbench')`), `repository-url-sync.service.ts`.
- `directives/restrict-access.directive.ts` — `*appRestrictAccess` + the `ViewPermissions` enum.
- `components/` — reusable UI (`page-layout/`, `yasgui-component-facade/`, dialogs, banners, tooltips).
- `pages/` — folder-per-page `*-page.component.ts` (`sparql-editor/`, `login/`, `not-found/`, …).
- `models/`, `utils/`, `src/testing-utils/transloco-utils.ts` (**`provideTranslocoForTesting()`**), `src/styles/primeng*`.

## Conventions (package-specific)

- **Routing is single-spa-driven:** `AppComponent` listens for `NAVIGATION_END` and calls `router.navigate(...)`, plus an anchor-click interceptor for internal links — normal browser navigation assumptions don't hold.
- **Add a page** = a lazy `loadComponent` route + a folder under `pages/`, composing `PageLayoutComponent`.
- **Shared services** come from `@ontotext/workbench-api` (a webpack external) via `service(X)` — not local re-implementations.
- **Testing** components that touch translations: `TestBed` + `provideTranslocoForTesting()`.
- **PrimeNG** uses the **`gw`** token prefix inside the `primeng` cssLayer; overrides live in `src/styles/primeng*`. Using the default `p` prefix or unlayered styles breaks theming.
- **TS is strict** (`noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `strictTemplates`): bracket-access index-signature props, always type returns.

## Testing

- **Jest** (`jest-preset-angular`, `jsdom`, coverage on) via `angular.json`'s `@angular-builders/jest:run`. Specs colocated, named `*.spec.ts`. `moduleNameMapper` resolves `@ontotext/workbench-api → ../api/dist/...`.

## Gotchas

- `@ontotext/workbench-api` is resolved from the **built** sibling package (`packages/api/dist`) for both runtime and jest — the api package must be built; there is no source-level import.
- `provideAnimationsAsync()` in `app.config.ts` is deprecated but pinned until PrimeNG is upgraded — leave as is.
- **`README.md` is stale** (mentions Angular 18, port 4200, Karma). Real facts: Angular 21, port 9002, jest.
