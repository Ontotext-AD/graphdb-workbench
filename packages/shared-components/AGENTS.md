# AGENTS.md — packages/shared-components

The **Stencil.js web-component library**: reusable `onto-*` custom elements (header, navbar, layout, dropdowns, dialogs, toastr, tooltip, repository/language selectors, login/user-menu, …) consumed by the micro-frontends as lazy-loaded ES modules.

> Part of the `graphdb-workbench` monorepo. Cross-cutting rules live in the [root AGENTS.md](../../AGENTS.md) and [docs/conventions/](../../docs/conventions/). **Read [shared-components-stencil.md](../../docs/conventions/shared-components-stencil.md) first** — it documents the `.tsx` / `@Component` / `@State`/`@Prop` / `SubscriptionList` / `npm run generate` conventions. This file adds the concrete map and package-specific facts.

## Stack & build

- **Stencil 4** (`@stencil/core` 4.35.1), SCSS via `@stencil/sass`, namespace `shared-components`. Config: `stencil.config.ts`.
- Output targets: `dist` (with `esmLoaderPath: ../loader`), `docs-readme` (auto-generates each component's `readme.md`), and `www` (dev/demo). Tag prefix `onto-` (plus `translate-label`).

## Commands

| Task | Command |
|---|---|
| Dev server | `npm start` (`stencil build --dev --watch --serve`, port `3333`) |
| Build | `npm run build` (`--watch` variant: `build:watch`) |
| Scaffold component | `npm run generate` |
| Test (unit) | `npm test` → `jest` (coverage: `npm run test:coverage`) |
| Single test | `npx jest src/components/onto-navbar/test/navbar-service.spec.tsx` |
| Cypress | `npm run cy:open` / `npm run cy:run` (CI: `npm run cy:run:ci` via docker compose) |
| Lint | `npm run lint` / `npm run stylelint` (+ `:fix`) |

## Layout (`src/`)

- `components/` — one folder per element (`onto-*/`), each with `onto-*.tsx` + `onto-*.scss` + generated `readme.md`; specs alongside or in a `test/` subfolder. Larger components split into functional sub-files and have local `models/`. `components/dialogs/` groups dialog components.
- `services/` — `translation.service.ts` (singleton `TranslationService`, subscribes to API `LanguageContextService`, exposes `onTranslate`) and `logger-provider.ts` (`Loggers.getLoggerInstance('SharedComponents')`).
- `models/` — shared types/enums by feature (`dialog/`, `dropdown/`, `translation/`, …).
- `utils/` — tooltip (Floating UI) wrappers, `html-util` (`sanitizeHTML`), function utils; many with co-located specs.
- `assets/` (i18n + images), `pages/` (static HTML demo harnesses served by `www`, plus `fake-server.js`). No `directives/`.

Package-root folders:
- `api/` — a **synced source copy** of the sibling `@ontotext/workbench-api`; actual resolution points at `../api/dist` via TS paths + Jest/Stencil `moduleNameMapper`.
- `loader/` — generated Stencil lazy loader, exported as the `./loader` subpath so hosts can `defineCustomElements()`.
- `dist/`, `www/` — generated output.

## Conventions (package-specific)

- **Consuming API services:** import from `@ontotext/workbench-api` and get singletons via `ServiceProvider.get(...)`; use `LoggerProvider.logger`, not `console`.
- **Translation** — two idioms: (a) inject `TranslationService` and call `onTranslate(key, params, cb)` (fires immediately + on every language change; returns an unsubscribe fn wired in `connectedCallback`/`disconnectedCallback`); (b) render `<translate-label labelKey=... translationParameters=...>`. Translated strings are run through `sanitizeHTML` before display.
- **Styling:** per-component `.scss` via `@Component({ styleUrl })`; most components are **light DOM** (`shadow: false`) so global Bootstrap/remixicon styles apply — scope SCSS to avoid collisions. Stylelint extends the monorepo base.
- **New component flow:** `npm run generate` scaffolds `onto-*/`; add a demo page under `src/pages/` and Cypress specs by hand; `npm run build` regenerates `dist/`, `loader/`, each `readme.md`, and typings.

## Testing

- **Unit (Jest):** preset via `jest-stencil-runner`; the Stencil `newSpecPage` harness is used for render tests; the API import is mocked by `__mocks__/@ontotext/workbench-api.ts`. Specs named `*.spec.ts(x)` / `*.test.*`.
- **Cypress:** **e2e only** (no component runner). `baseUrl http://localhost:3333`; specs in `cypress/e2e/<feature>/`, reusable steps in `cypress/steps/`. CI runs headless via `docker-compose.yaml` (a `node:22-alpine` service runs `npm start` on 3333, a `cypress/included` service runs the suite).

## Gotchas

- Consumers load these as lazy ESM + the `loader`, resolving `@ontotext/workbench-api` through an **import map** — the api package must be built and served alongside.
- `dist/`, `www/`, `loader/`, per-component `readme.md`, and generated typings are all build artifacts — regenerate with `npm run build`, never hand-edit.
- The package-root `api/` folder is a synced copy of `packages/api` source; a stale/unbuilt api package breaks TS types and the Jest/Stencil module mapping.
- Dev server port is fixed at **3333** (Cypress `baseUrl` and the docker health-check depend on it).
