# AGENTS.md — packages/api

`@ontotext/workbench-api` is the framework-agnostic core library of the workbench: the singleton services, domain models, HTTP interceptors, event emitters, and the `ServiceProvider` DI layer that every other micro-frontend consumes at runtime.

> Part of the `graphdb-workbench` monorepo. Cross-cutting rules live in the [root AGENTS.md](../../AGENTS.md) and [docs/conventions/](../../docs/conventions/). This file covers only what is specific to this package. See especially [architecture](../../docs/conventions/architecture.md) (ServiceProvider / `service()`) and the deep dives on the [Context API](../../docs/reference/context-api.md), [Persistence API](../../docs/reference/persistence-api.md), and [HTTP interceptors](../../docs/reference/http-interceptors.md).

## Stack & build

- TypeScript (strict), transpiled with **Babel** (not `tsc`) for the bundle.
- Built as a **single-spa utility module** via `webpack.config.js` (`webpack-config-single-spa-ts`). `npm run build` runs the webpack bundle **and** `tsc` declarations concurrently, both emitted to `dist/`.
- Consumed by other packages purely through the `@ontotext/workbench-api` alias (import map + TS `paths`) — it is **not** a normal npm dependency of consumers.

## Commands

| Task | Command |
|---|---|
| Dev server | `npm start` (webpack serve on port `9003`) |
| Build (bundle + types) | `npm run build` |
| Lint | `npm run lint` / `npm run lint:fix` |
| Test | `npm test` (coverage is on by default) |
| Watch tests | `npm run watch-tests` |
| Single test | `npm test -- src/services/plugins/test/plugins.service.spec.ts` (or `-t "pattern"`) |

## Layout (`src/`)

- **`ontotext-workbench-api.ts`** — the **only** public barrel; the alias resolves here. Anything importable by other modules must be re-exported from this file.
- `providers/` — DI core: `ServiceProvider` registry, the `service()` helper, the `Service` marker interface, `onCreated` lifecycle hook.
- `services/` — all business logic as singletons: `context/` (the `ContextService` abstraction), `domain/*` (REST-backed services), plus `language/`, `theme/`, `storage/`, `http/`, `plugins/`, `notification/`, etc. Convention: `<feature>.service.ts` / `-context.service.ts` / `-rest.service.ts` / `-storage.service.ts`, each folder with an `index.ts` barrel and `mappers/`.
- `models/` — ~40 domain-model folders, each with its own `index.ts` and often a `test/`.
- `interceptor/` — HTTP interceptors (`auth/` holds the auth/unauthenticated/unauthorized ones).
- `emitters/`, `error/` — event emitters and custom error types.

## Conventions

- **Never `new` a service.** Obtain singletons via `ServiceProvider.get(MyService)` or `service(MyService)`; instances are shared across all micro-frontends. Intra-service deps are resolved as instance fields the same way.
- Implement `onCreated()` for post-construction registration (as `ContextService` does with `ContextSubscriptionManager`).
- **Stateful/subscribable shared state** should extend the abstract `ContextService<TFields>` (`services/context/context.service.ts`) rather than rolling custom pub/sub.
- REST → model mapping goes through `MapperFn` functions in each service's `mappers/`.
- **Public-export discipline:** to expose a symbol to other packages, add it to `src/ontotext-workbench-api.ts`. Within the package use relative imports (and the `@api/*` alias in tests); never import internal deep paths from consumers.

## Testing

- **Jest** (`jsdom`, `babel-jest` with `BABEL_ENV=test`). Specs are colocated in `test/` subfolders, named `*.spec.ts`.
- Module aliases: `@api/* → src/*`, `.css → identity-obj-proxy`. Coverage is collected by default — scope to one file when iterating.

## Gotchas

- **Foundational dependency:** must be built (or its dev server running) before/with any consumer, which resolve it through the import map, not `node_modules`.
- A new public symbol compiles locally but stays invisible to consumers until it is exported from the barrel.
- Two outputs from one build: a passing webpack bundle does not guarantee `tsc` declarations compiled (and vice versa).
- `dist/` is generated — never edit by hand.
