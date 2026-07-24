# AGENTS.md — packages/legacy-workbench

The **legacy AngularJS 1.3.8 micro-frontend** that still renders most GraphDB Workbench views (security & users, repositories, SPARQL/YASGUI, Explore/graph views, Import, connectors, cluster management, backup-and-restore, GraphQL playground, TTYG, similarity, autocomplete, JDBC, namespaces, …). Registered with single-spa as `@ontotext/legacy-workbench`.

> Part of the `graphdb-workbench` monorepo. Cross-cutting rules live in the [root AGENTS.md](../../AGENTS.md) and [docs/conventions/](../../docs/conventions/). This file covers only what is specific to this package. Relevant deep dives: [plugin system](../../docs/reference/plugin-system.md), [i18n](../../docs/conventions/i18n.md).
>
> **This is legacy code slated for eventual retirement. Preserve the existing style and AngularJS conventions — do not modernize.**

## Stack & build

- **AngularJS 1.3.8** (core vendored at `src/js/lib/angularjs/1.3.8/angular.js`), with jQuery, D3 v7, ECharts, and lodash as hard global deps.
- **single-spa** via a local fork `src/single-spa-angularjs.js`. `src/app.js` (the webpack entry) builds the lifecycles; `mount` runs `startWorkbench()` → loads translations + `rest/info/version`, then `angular.bootstrap(...'graphdb.workbench')`. Route modules are lazy-loaded with **oclazyload** (`$ocLazyLoad.inject`).
- **NO local build/test/start script.** Built from the **repo-root webpack** (`webpack.config.common.js`: entry `legacyWorkbench: ./packages/legacy-workbench/src/app.js`, a `plugin.js` glob, and per-module `CopyPlugin` entries for `pages/`, `templates/`, `css/`, `i18n/`, …). Served by `root-config` via the import map (`legacy-routes-provider.ts`).
- **LESS, not SCSS** — compiled locally with `less-watch-compiler`.

## Commands

| Task | Command |
|---|---|
| Lint | `npm run lint` / `npm run lint:fix` |
| Compile LESS (watch) | `npm run less:watch` |
| Preprocess LESS | `npm run less:preprocess` |
| Validate translations | `npm run validate` |
| Build / test / start | **none here** — build & serve from repo root; Cypress e2e is monorepo-level (`scripts/run-cypress-tests.sh`) |

## Layout (`src/`)

- **`vendor.js`** — third-party globals (jQuery, vendored AngularJS 1.3.8, bootstrap); loads first.
- **`main.js`** — pure LESS/CSS imports.
- **`app.js`** — real entry: registers the root `graphdb.workbench` module, configures `$routeProvider` from `PluginRegistry.get('route')`, `$translateProvider`, interceptors, toastr, menu, and the single-spa lifecycles.
- **`single-spa-angularjs.js`** — mount/unmount adapter; drives digests off shared events.
- **`js/angular/<module>/`** — the bulk of the app. Module areas include `security`, `repositories`, `sparql-editor`, `explore`, `graphexplore`, `import`, `clustermanagement`, `externalsync`, `graphql`, `ttyg`, `similarity`, `namespaces`, `rest` (all `*.rest.service.js`), `core` (shared services/directives/filters), and ~20 more.
- `pages/` (route HTML), `templates/` (shared partials), `less/`, `css/`, `i18n/`, `img/`, `font/`, `res/`.

A **typical module folder** contains: `plugin.js` (route + menu registration), `app.js` (`angular.module('graphdb.framework.<area>', [...])`), `controllers.js` + `controllers/`, `services/`, `directives/`, `templates/`.

## Conventions (must follow when editing)

- **Registration:** `angular.module('graphdb.framework.<area>.<thing>', [deps])` then chained `.controller()/.factory()/.directive()/.filter()`. Explicit DI arrays: `Fn.$inject = ['$http', ...]`.
- **PluginRegistry is load-bearing:** each feature registers routes/menu in its `plugin.js` via `PluginRegistry.add('route', ...)` / `PluginRegistry.add('main.menu', ...)`, discovered by the root webpack `plugin.js` glob. Keep the shape intact — renaming/removing breaks routing and the menu. Route objects carry `url`, `module`, `path`, `chunk`, `controller`, `templateUrl`, `title`, `helpInfo`, `documentationUrl`, `allowAuthorities`.
- **Data access:** use the `.factory('XxxRestService', ...)` services in `js/angular/rest/` (with `rest/...` URL constants), not raw `$http`, in controllers. Controllers are `$scope`-based.
- **Shared TS bridge:** talk to the modern layer through `@ontotext/workbench-api` (`ServiceProvider`, `service()`, `AuthenticationService`, `SecurityContextService`, `LanguageContextService`, `EventService`, `OntoToastrService`, …) — used in ~53 files. Prefer these over reimplementing.
- **Web components:** `ontotext-yasgui-web-component` and `ontotext-graphql-playground-component` are registered via `defineCustomElements()` and used through `ng-custom-element`.
- **Templates:** route views use `templateUrl` into `pages/*.html` or a module's `templates/*.html`, cache-busted with `?v=[AIV]{version}[/AIV]`.
- **i18n:** `angular-translate` (`pascalprecht.translate`), bundles in `i18n/locale-<lang>.json`, languages in `src/i18n/languages.json`. Validate with `npm run validate`.
- **Styling:** LESS in `src/less/` (+ vendored CSS). Never introduce SCSS.

## Testing

- No local unit-test framework or `test` script. e2e is Cypress at the monorepo level.
- **ESLint is the main gate** (`eslint.config.cjs`): extends the shared base + `eslint-config-google` but **deliberately disables** stylistic rules (`quotes`, `indent`, `max-len`, `require-jsdoc`, …) because the code predates current standards — only correctness rules (`eqeqeq`, `curly`, `semi`, `no-console`, …) are enforced. Globals `angular`, `$`, `_`, `d3`, `getError` are readonly.

## Gotchas

- **Do not modernize** — match surrounding code; don't "fix" quotes/indent/JSDoc or convert to modern Angular.
- **`package.json` `name` is `"graphdb-workbench"`** (a legacy holdover); the import-map/single-spa name is `@ontotext/legacy-workbench`.
- **jQuery is a global** (`$`), used app-wide including bootstrap data fetches in `app.js`. AngularJS 1.3.8 lacks 1.5+ APIs (components, `<`-bindings); digest is manually kicked via shared events.
- **No standalone build** — bundled and served only via the repo-root webpack + `root-config`. A new module `templates/` dir may need a matching `CopyPlugin` entry in `webpack.config.common.js`, or its HTML won't reach the browser. New published static folders may need a Spring Security entry.
- `$locationProvider.html5Mode(true)` is on, with special OAuth-implicit route handling in `app.js`.
