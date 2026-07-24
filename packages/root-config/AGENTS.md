# AGENTS.md — packages/root-config

The single-spa **root config / host application**: it bootstraps the whole workbench — registers and mounts the micro-frontends, owns the HTML shell and import map, and runs the startup sequence (config → security → i18n → theme → interceptors → plugins) before `single-spa.start()`.

> Part of the `graphdb-workbench` monorepo. Cross-cutting rules live in the [root AGENTS.md](../../AGENTS.md) and [docs/conventions/](../../docs/conventions/). This file covers only what is specific to this package. Relevant deep dives: [HTTP interceptors](../../docs/reference/http-interceptors.md), [theming](../../docs/conventions/theming.md), [i18n](../../docs/conventions/i18n.md).

## Stack & build

- **single-spa 6** + **single-spa-layout 3**, TypeScript. Path alias `@ontotext/workbench-api → ../api/src/ontotext-workbench-api.ts`.
- **No package-local build/serve script** — building and the dev server run from the **repo root** webpack (`webpack.config.{common,dev,prod}.js`). This package is the webpack **entry** (`src/ontotext-root-config.ts`, HTML template `src/index.ejs`). Dev server serves on port **9000**.
- The **import map** lives in `src/index.ejs` (dev vs prod branches); dev URLs point workbench-api → `9003`, workbench → `9002`.

## Commands

| Task | Command |
|---|---|
| Lint | `npm run lint` / `npm run lint:fix` |
| Validate translations | `npm run validate` (`node ./scripts/validate-translations.js`) |
| Test | `npm test` (coverage: `npm run test:coverage`, watch: `npm run test:watch`) |
| Single test | `npx jest test/validate-utils.test.ts` (or `-t "<name>"`) |
| Build / dev-serve | from repo root — no local script |

## Layout (`src/`)

- **`ontotext-root-config.ts`** — main entry: single-spa registration, the `appModules` map, `start()` orchestration, router-listener wiring, `PluginRegistry` + extension points (`MainMenu`, `Route`, `InteractiveGuide`, `Themes`).
- **`index.ejs`** — HTML shell, import map, splash screen, top-level web components (`onto-toastr`, `onto-tooltip`, …).
- **`bootstrap/`** — startup logic, one subfolder per concern (`configuration/`, `security/`, `license/`, `language/`, `repository/`, `plugins/`, `theme/`, `interceptors/`, …), composed by `bootstrap/bootstrap.ts` (`bootstrapWorkbench()`).
- **`services/`** — `logger-provider.ts` (`LoggerProvider`, module tag `ROOT_CONFIG`), `route-provider.ts`, `workbench-routes-provider.ts`, `legacy-routes-provider.ts`.
- **`assets/i18n/`** — `en.json`, `fr.json`, and **`language-config.json`** (default + available languages).
- `styles/`, `vendor/`, `models/models.ts`.

## Conventions

- **Bootstrap wiring:** each `bootstrap/<concern>/` module exports a function or an array of loader functions; `bootstrap.ts` composes them (`loadApplicationConfigurations` → `loadEssentials` → `loadApplicationData`). **Order matters** — interceptors register first, before any backend call; essentials run in parallel via `Promise.all` / `allSettled`.
- **Interceptors:** register in `bootstrap/interceptors/interceptors-registration.ts` — add to `REQUEST_INTERCEPTORS` / `RESPONSE_INTERCEPTORS` (wrapped in `HttpInterceptorList`), applied via `service(InterceptorService)`.
- **Theme:** `bootstrap/theme/theme-bootstrap.ts` dynamically imports `graphwise-styleguide/dist/variables-${theme}.css` and reacts to OS `prefers-color-scheme` + `RuntimeConfigurationContextService`.
- **Logging:** always use `LoggerProvider.logger` — do not instantiate loggers directly.
- **Cross-package access:** all shared services come from `@ontotext/workbench-api` via `service(...)`.

## Testing

- **Jest** + **ts-jest** (`testEnvironment: node`, `testMatch: test/**/*.test.{js,ts}`). Tests live in **`test/`** (not colocated), named `*.test.ts`, with fixtures under `test/fixtures/`. Current coverage is mainly the translation-validation script.

## Gotchas

- **No local build/start** — build and serve from the repo root (port `9000`, proxying backend `7200`); dev import map expects workbench on `9002`, api on `9003`.
- **Import map is the source of truth** for micro-frontend URLs (`src/index.ejs`); keep the `appModules` map in sync with it. `webpackIgnore` prevents webpack bundling the legacy/workbench imports.
- `src/assets` is copied verbatim into the deployed static output (what GraphDB/Spring serves) — keep asset paths relative and CSP-aware. New published static folders may need a matching Spring Security entry.
- `bootstrap.ts` intentionally swallows **401** during bootstrap (expected when unauthenticated); other errors propagate. `defineCustomElements()` and `start()` run only at the very end.
