# AGENTS.md

`graphdb-workbench` is the microfrontend web application for GraphDB APIs — a multi-package (npm workspaces) repo bundled with webpack.

## Essentials

- **Package manager:** npm (monorepo — run commands from the repo root).
- **Node:** `>=22.17` (source of truth: root `package.json`; CI uses the `nodejs-22` Jenkins tool).
- **Dev server:** root config serves on port `9000` and proxies to a GraphDB backend expected at `http://localhost:7200`.

## Commands

| Task | Command |
|---|---|
| Install (CI) | `npm run install:ci` |
| Install (local clean) | `npm run clean-install` |
| Dev (watch + serve everything) | `npm run start` |
| Build (production) | `npm run build` |
| Lint | `npm run lint` |
| Validate translations | `npm run validate` |
| Test | `npm run test` (coverage: `npm run test:coverage`) |

Additional dev modes: `npm run dev:with-plugins` (external plugins hot-copied), `npm run dev:styleguide` (locally linked `graphwise-styleguide`). Cypress commands live in `e2e-tests/package.json`.

## Package map

| Package | Framework | Package guide |
|---|---|---|
| `packages/api` | Framework-agnostic TS — shared services, imported via `@ontotext/workbench-api` | [AGENTS.md](packages/api/AGENTS.md) |
| `packages/root-config` | single-spa + TS — bootstrap/wiring | [AGENTS.md](packages/root-config/AGENTS.md) |
| `packages/workbench` | Angular 21 (standalone, signals) — modern frontend | [AGENTS.md](packages/workbench/AGENTS.md) |
| `packages/shared-components` | Stencil.js — Web Components (`onto-*`) | [AGENTS.md](packages/shared-components/AGENTS.md) |
| `packages/legacy-workbench` | AngularJS — legacy code | [AGENTS.md](packages/legacy-workbench/AGENTS.md) |

Changes may span packages, and modern + legacy stacks coexist. **When working inside a package, read its `AGENTS.md` first**, then the guides below.

## Conventions & guides (`docs/conventions/`)

- **[Conventions & workflow](docs/conventions/conventions.md)** — house rules, verification order, definition of done. **Start here.**
- **[Architecture & package boundaries](docs/conventions/architecture.md)** — package map, import rules, `ServiceProvider` / `service()`.
- **[Modern workbench (Angular)](docs/conventions/frontend-angular.md)** — standalone components, signals, PrimeNG, dialogs, permissions, Transloco.
- **[Shared components (Stencil)](docs/conventions/shared-components-stencil.md)** — `.tsx`, `onto-*` tags, `@State`/`@Prop`.
- **[Theming & design tokens](docs/conventions/theming.md)** — `graphwise-styleguide`, `--gw-*` variables, light/dark.
- **[Internationalization](docs/conventions/i18n.md)** — translation files and validation.
- **[Plugins & extension points](docs/conventions/plugins.md)** — `plugin.js`, `PluginRegistry`.
- **[Logging](docs/conventions/logging.md)** — centralized logging service and `LoggerProvider`.
- **[HTTP interceptors](docs/conventions/http-interceptors.md)** — request/response chains.

## Deep reference

For how internals actually work (build pipeline, CI/release, context/persistence APIs, security testing, known issues) see the **[Developers Guide](docs/developers-guide.md)**.
