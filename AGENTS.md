# AGENTS.md

## Project overview

`graphdb-workbench` is the web application for GraphDB APIs. It is a multi-package frontend repository built around microfrontends and webpack-based bundling.

The repository contains several top-level packages:

- `packages/api` — shared API/services package consumed through the `@ontotext/workbench-api` alias
- `packages/root-config` — root configuration/bootstrap for the microfrontend application
- `packages/workbench` — main modern workbench frontend
- `packages/shared-components` — reusable shared UI/components
- `packages/legacy-workbench` — legacy AngularJS-based workbench code
- `e2e-tests` — Cypress-based end-to-end and security tests
- `plugins` / `wb-plugins` — generated or bundled plugin artifacts

## Required environment

Verified from `package.json`:

- Node.js: `>=22.17`

Package manager:

- npm

## Common commands

Run all commands from the repository root unless stated otherwise.

### Install

```bash
npm run install:ci
```

For local clean install:

```bash
npm run clean-install
```

### Development

Starts the microfrontend development environment, including watches for API/shared packages and the root app:

```bash
npm run start
```

What this does at a high level:

- watches and rebuilds `packages/api`
- watches and rebuilds `packages/shared-components`
- starts `packages/api`
- starts `packages/workbench`
- serves the root config on port `9000`

Package dev ports:

- root config: `9000`
- `packages/workbench`: `9002`
- `packages/api`: `9003`

The dev server proxies requests to a GraphDB instance expected at:

- `http://localhost:7200`

#### Additional dev commands

Develop with external plugins watched and hot-copied:

```bash
npm run dev:with-plugins
```

Develop with a locally linked `graphwise-styleguide` package:

```bash
npm run dev:styleguide
```

Link/unlink the styleguide package individually:

```bash
npm run link:styleguide
npm run unlink:styleguide
```

### Build

Production build (also runs the webpack production post-build step):

```bash
npm run build
```

Production webpack post-build is also wired through the root scripts.

### Lint

```bash
npm run lint
```

### Validate

Used for translation/i18n validation:

```bash
npm run validate
```

### Test

```bash
npm run test
```

Coverage:

```bash
npm run test:coverage
```

### Cypress

Refer to `e2e-tests/package.json` for Cypress-specific commands, such as:

```bash
npm run cypress:open
npm run cypress:run
npm run cy:run:partial
```

## Architecture notes

### Microfrontend structure

This repo is organized as a microfrontend application with separate packages for API, root bootstrap, shared components, modern workbench, and legacy workbench.

Important implications:

- Changes may span multiple packages.
- Shared cross-package logic should generally go into `packages/api` or `packages/shared-components`, not duplicated locally.
- Bootstrap/application wiring usually lives in `packages/root-config`.

#### Package frameworks at a glance

| Package | Framework |
|---|---|
| `packages/workbench` | Angular 21 (standalone components, signals) |
| `packages/shared-components` | Stencil.js (compiled Web Components, TSX) |
| `packages/legacy-workbench` | AngularJS |
| `packages/api` | Framework-agnostic TypeScript |
| `packages/root-config` | single-spa + TypeScript |

### API package import rule

From `docs/developers-guide.md`:

Everything in the API package must be imported via:

- `@ontotext/workbench-api`

Do **not** import API package internals via relative or absolute filesystem paths across packages.

### ServiceProvider and `service()` helper

API services are singletons shared across all micro-frontends via `ServiceProvider`:

```typescript
import { ServiceProvider, RepositoryContextService } from '@ontotext/workbench-api';
const repoService = ServiceProvider.get(RepositoryContextService);
```

A convenience alias `service()` is also exported:

```typescript
import { service, RepositoryContextService } from '@ontotext/workbench-api';
const repoService = service(RepositoryContextService);
```

Use `ServiceProvider.get()` / `service()` for API-layer services in all packages (including Stencil components, root-config bootstrap code, and Angular components when Angular DI is unavailable). For Angular services injected through Angular's DI system (`@Injectable`), use `inject()` as normal.

### Legacy vs modern code

This repo contains both:

- modern package code
- legacy AngularJS workbench code in `packages/legacy-workbench`

When making changes, preserve the existing style and framework conventions of the package you are editing. Do not assume the same patterns apply everywhere.

### Modern workbench UI library

The new workbench microfrontend in `packages/workbench` uses Angular with `primeng`.

When implementing new pages or changing existing pages in `packages/workbench`:

- prefer PrimeNG components over custom UI implementations where practical
- follow existing PrimeNG usage patterns already present in the workbench codebase
- only introduce custom controls when there is no suitable PrimeNG component or when the design/system integration clearly requires it

All components in `packages/workbench` use the Angular **standalone component** pattern (`standalone: true`) and Angular **signals** for reactive state (`signal()`, `computed()`). Services are injected via `inject()` (Angular DI) or `service()` (for API-layer singletons). Do not use `NgModule` declarations.

PrimeNG is configured with token prefix `gw` (see `packages/workbench/src/app/app.config.ts`), so generated CSS custom properties for PrimeNG tokens also use the `--gw-*` prefix.

#### Dialogs (PrimeNG DynamicDialog)

Use `DialogProviderService` (`packages/workbench/src/app/services/dialog/dialog-provider.service.ts`) to open dialogs imperatively. Do not call PrimeNG `DialogService` directly. The service wraps all dialogs with the `onto-dialog` CSS class.

#### Permission-based rendering

Use the `*appRestrictAccess` structural directive (`packages/workbench/src/app/directives/restrict-access.directive.ts`) to conditionally show or hide elements based on the authenticated user's rights:

```html
<div *appRestrictAccess="['isAdmin', 'canWriteActiveRepo']; else noAccess">...</div>
<ng-template #noAccess>...</ng-template>
```

Available permissions are defined in the `ViewPermissions` enum in the same file.

#### Unsaved changes

Register unsaved-changes callbacks via `UnsavedChangesService.register(callback)` (`packages/workbench/src/app/services/unsaved-changes/unsaved-changes.service.ts`). The returned `Subscription` unregisters the callback when called.

### Shared components (Stencil.js)

`packages/shared-components` is a **Stencil.js** Web Component library. Components:

- are implemented in `.tsx` files using JSX-based `render()` methods
- use `@Component({ tag: 'onto-*' })` for custom element registration (all tags prefixed `onto-`)
- use `@State()` for reactive internal state and `@Prop()` for inputs
- consume API services exclusively via `ServiceProvider.get(ServiceClass)` (no Angular DI)
- use `SubscriptionList` for managing subscription cleanup in `connectedCallback`/`disconnectedCallback`

Example: `packages/shared-components/src/components/onto-header/onto-header.tsx`

When adding new Stencil components, run `npm run generate` inside `packages/shared-components`.

### Design tokens and theming

The project also consumes a custom npm package:

- `graphwise-styleguide`

This package is the source of truth for design tokens coming from Figma Token Studio. It builds token input into theme stylesheets that are consumed by this repository.

Important implementation details verified in this repo:

- `packages/root-config/package.json` declares the `graphwise-styleguide` dependency
- `packages/root-config/src/bootstrap/theme/theme-bootstrap.ts` dynamically imports `graphwise-styleguide/dist/variables-light.css` and `graphwise-styleguide/dist/variables-dark.css`
- application styles consume the exported CSS custom properties through the `--gw-*` prefix

When working on styling or theming:

- prefer reusing existing `--gw-*` CSS variables instead of hardcoding colors, spacing, or component token values
- treat the generated Graphwise theme stylesheets as external build artifacts; do not manually duplicate token values into local styles unless there is a clear repo-local semantic variable layer
- if a needed token does not exist, the change may belong in the external `graphwise-styleguide` package rather than this repository
- when adding repo-local variables, map them to `--gw-*` variables where practical, as done in `packages/root-config/src/vendor/variables.css`
- verify styling changes in both light and dark theme modes when touching shared/global UI
- be careful not to break legacy styles that already depend on `--gw-*` variables in `packages/legacy-workbench`

## Plugins

The project has a plugin system used to register routes, menu items, themes, and other extension points.

Key points:

- plugin definitions are typically named `plugin.js`
- plugins are gathered during bundling
- registration happens through `PluginRegistry.add(...)`
- extension points include things like `route`, `main.menu`, and `themes`

If implementing extensibility-related work:

- look for existing `plugin.js` files first
- preserve extension point contract shapes
- respect plugin ordering, priority, and disabled semantics

## Internationalization (i18n)

Translations are merged from module-local `src/assets/i18n/*.json` files into bundled outputs.

When adding or changing translations:

- keep translations under each package's `src/assets/i18n`
- avoid duplicate keys across modules for the same language
- run:

```bash
npm run validate
```

If translation validation fails, inspect the generated:

- `translation-report.json`

### Transloco in `packages/workbench`

The modern Angular workbench uses `@jsverse/transloco` for runtime translations. Translation bundles are loaded from the API layer via `LanguageContextService` and fed to Transloco's `TranslocoService` at bootstrap (see `packages/workbench/src/app/bootstrap/transloco/transloco-bootstrap.ts`).

In templates, use the `TranslocoPipe`:

```html
{{ 'some.key' | transloco }}
```

In unit tests, use the provided helper instead of configuring Transloco manually:

```typescript
import { provideTranslocoForTesting } from '../../../testing-utils/transloco-utils';
// In TestBed.configureTestingModule:
imports: [provideTranslocoForTesting()]
```

The `provideTranslocoForTesting()` function stubs Transloco with the preloaded English (`en.json`) bundle.

## HTTP interceptors

The app supports request/response interceptor chains in the API layer.

Relevant locations are documented in `docs/developers-guide.md`, especially around:

- `packages/api/src/services/interceptor/...`
- `packages/root-config/src/bootstrap/interceptors/interceptors-registration.ts`

When adding request/response preprocessing behavior:

- prefer implementing an interceptor rather than scattering request mutation logic
- pay attention to interceptor priority ordering

## Logging

There is a centralized logging service in `packages/api`.

When adding logging:

- use the shared logging abstractions instead of ad hoc `console.*` when appropriate
- follow the logger service / logger type conventions documented in `docs/developers-guide.md`

Each package defines a local `LoggerProvider` class that wraps `Loggers.getLoggerInstance(MODULE_NAME)` from `@ontotext/workbench-api`. Follow this pattern when adding logging to a package:

```typescript
import { Loggers } from '@ontotext/workbench-api';
const MODULE_NAME = 'MyPackage';
export class LoggerProvider {
  static get logger() {
    return Loggers.getLoggerInstance(MODULE_NAME);
  }
}
```

Examples: `packages/root-config/src/services/logger-provider.ts`, `packages/workbench/src/app/services/logger/logger-provider.ts`.

## Bundling/build notes

Webpack config files at the repo root:

- `webpack.config.common.js`
- `webpack.config.dev.js`
- `webpack.config.prod.js`

Build output is emitted to `dist/`.

Be careful when introducing new static output folders or renamed published assets. The developer guide notes that backend Spring Security configuration may also need corresponding updates for served static resources.

Theme stylesheets from `graphwise-styleguide` are loaded at runtime by the root config theme bootstrap rather than being hand-authored inside this repo.

## Style and conventions for agents

When changing code in this repository:

1. Match the style already used in the target package.
2. Keep changes package-local unless a shared abstraction is clearly warranted.
3. Prefer extending existing services, interceptors, plugin registrations, and context APIs rather than introducing parallel patterns.
4. For API package usage across packages, always import from `@ontotext/workbench-api`.
5. Avoid broad refactors unless they are required by the task.
6. Be careful with legacy AngularJS codepaths in `packages/legacy-workbench`.
7. When touching translations, validate them.
8. When touching plugin-related behavior, verify the extension point contract.
9. When touching styles, prefer `--gw-*` design tokens and validate both light and dark themes.
10. In `packages/workbench`, prefer PrimeNG components for page UI when possible.

## Recommended workflow for coding agents

Before editing:

- read the nearest package `package.json`
- inspect existing patterns in the same folder/module
- search for the symbol or feature across packages before introducing a new abstraction

After editing:

- run targeted checks first where possible
- then run broader verification if the scope warrants it

Typical verification order:

```bash
npm run lint
npm run validate
npm run test
```

If the change affects frontend integration/runtime wiring, also consider:

```bash
npm run start
```

## Repo-specific cautions

- The repo mixes modern and legacy frontend stacks.
- Some documentation references older Node versions in CI docs, but the root `package.json` currently requires Node `>=22.17`. Prefer the root `package.json` as the source of truth for local development unless the task specifically concerns CI.
- The dev environment expects GraphDB to be available locally, typically at `localhost:7200`.
- The root dev server serves on port `9000`.
- Pre-commit hooks (Husky + lint-staged) run ESLint and Stylelint on staged files automatically. If a commit is blocked by lint errors, run `npm run lint` to identify them. Each package has its own `eslint.config.js`; shared base configs are at `eslint.config.base.js` and `stylelint.config.base.cjs` in the repo root.

## Useful files

- `README.md`
- `docs/developers-guide.md`
- `package.json`
- `packages/workbench/package.json`
- `packages/root-config/package.json`
- `packages/root-config/src/bootstrap/theme/theme-bootstrap.ts`
- `packages/root-config/src/vendor/variables.css`
- `webpack.config.common.js`
- `webpack.config.dev.js`
- `webpack.config.prod.js`

## Definition of done for typical changes

A change is usually complete when:

- code follows the conventions of the target package
- imports use the correct package boundaries and aliases
- lint passes
- translation validation passes if relevant
- tests pass for the affected scope
- any plugin/interceptor/i18n wiring is updated consistently
- styling changes remain compatible with the Graphwise token pipeline and both light/dark themes

