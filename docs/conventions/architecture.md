# Architecture & package boundaries

How the microfrontend repo is laid out and the rules for crossing package lines. Read this before touching more than one package.

## Contents

- [Package map](#package-map): the packages, their frameworks, and their roles.
- [Package-boundary rules](#package-boundary-rules): where shared logic and wiring belong; keeping each package's own conventions.
- [API package import rule](#api-package-import-rule): always import through `@ontotext/workbench-api`.
- [ServiceProvider and the `service()` helper](#serviceprovider-and-the-service-helper): getting API-layer singletons vs. Angular `inject()`.
- [State ownership](#state-ownership): one owner per piece of shared state; resolving collaborators.
- [Deployment under a context path](#deployment-under-a-context-path): URLs that keep working when GraphDB is served under `/graphdb/`.

## Package map

| Package | Framework | Role |
|---|---|---|
| `packages/api` | Framework-agnostic TypeScript | Shared API/services, consumed via the `@ontotext/workbench-api` alias |
| `packages/root-config` | single-spa + TypeScript | Root bootstrap/wiring of the microfrontend app |
| `packages/workbench` | Angular 21 (standalone, signals) | Main modern workbench frontend |
| `packages/shared-components` | Stencil.js (Web Components, TSX) | Reusable UI components |
| `packages/legacy-workbench` | AngularJS | Legacy workbench code |
| `e2e-tests` | Cypress | End-to-end and security tests |
| `plugins` / `wb-plugins` | — | Generated/bundled plugin artifacts |

## Package-boundary rules

- Changes may span multiple packages — search for a symbol across packages before adding a new abstraction.
- Shared cross-package logic belongs in `packages/api` or `packages/shared-components`, not duplicated locally.
- Bootstrap/application wiring lives in `packages/root-config`.
- Preserve the existing framework conventions of the package you are editing. Do not assume one package's patterns apply elsewhere — modern and legacy stacks coexist.
- Dependencies point one way. `packages/api` knows nothing about UI: no view URLs, UI event names or component
  types. `shared-components` knows nothing about the applications that host them (routes, view URLs, app events)
  or about unrelated components. Pass what a component needs from outside, as a property, data-provider callback
  or emitted event, and let the host decide.
- A registry or generic base class doesn't know its concrete entries: extension points are registered from
  outside (bootstrap), not listed inside the registry.
- Reach browser globals (`window`, `crypto`, `location`) through `WindowService`
  (`packages/api/src/services/window/`), so the code stays testable.
- Components don't inject REST services. They go through the domain service or context service that wraps it.
- Query parameters used by one page are defined with that page, not in `application-query-params.ts`.

## API package import rule

Everything in the API package **must** be imported through the alias:

```typescript
import { ServiceProvider, RepositoryContextService } from '@ontotext/workbench-api';
```

Never import API internals via relative or absolute filesystem paths across packages. The api module is a separate package loaded via import maps where the alias is defined.

## ServiceProvider and the `service()` helper

API services are singletons shared across all micro-frontends via `ServiceProvider`:

```typescript
const repoService = ServiceProvider.get(RepositoryContextService);
// `service()` is an exported convenience alias for the same thing:
const repoService = service(RepositoryContextService);
```

Use `ServiceProvider.get()` / `service()` for API-layer services everywhere (Stencil components, root-config, and Angular components when Angular DI is unavailable). For Angular services registered through Angular DI (`@Injectable`), use `inject()` as normal.

## State ownership

- Shared state has one owner: its context service. Read it from there when you need it. A copy in a service
  field, REST client, component or controller goes stale.
- The owner also supplies the default (e.g. the selected language falls back to the default one inside the
  context service), so consumers don't invent their own.
- Resolve collaborators once, as fields — not inside handlers or loops. Don't `new` a class with logic
  (resolver, strategy, handler) inside another class; get it via `service()` or pass it in, so tests can swap it.

## Deployment under a context path

GraphDB can run behind a reverse proxy under a path prefix (`https://example.com/graphdb/`, with
`graphdb.external-url` set to that URL). Every page, asset and REST call must then stay under the prefix. Changes to
routing, navigation or URL building break this most often.

- **`<base href>` is the source of the prefix.** `root-config/src/index.ejs` ships `<base href="/">`; GraphDB serves
  it rewritten to the prefix, always with a trailing slash. Read it through `getBasePath()` (`@ontotext/workbench-api`,
  `routing-utils.ts`), never from `location`. The modern workbench feeds it to Angular as `APP_BASE_HREF`.
- **Write URLs relative to the base:** `href="monitor/queries"`, `rest/repositories`. The browser resolves them
  against `<base href>`, so they pick up the prefix. A root-absolute `/monitor/queries` escapes it.
- **Navigate in code with `navigate()` / `navigateTo()`.** `navigate()` prepends the prefix to a root-absolute path
  and resolves the rest against `getOrigin()` (origin + base path). Build absolute URLs with `buildUrl()`.
- **Strip the prefix with `getPathName()` / `getCurrentRoute()`** when comparing against routes.
- **Verify** a change of this kind with the `verify-workbench` skill on a context stack
  (`container.sh up --context /graphdb`, then `check-paths.sh`); its `features/context-path.md` lists what to drive.

## See also

- Deep dive: [Context API](../reference/context-api.md), [Persistence API](../reference/persistence-api.md)
- Models and mappers in a domain slice: [API domain layer](api-domain-layer.md)
- [Developers Guide hub](../developers-guide.md)
