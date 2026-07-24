# Architecture & package boundaries

How the microfrontend repo is laid out and the rules for crossing package lines. Read this before touching more than one package.

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

## See also

- Deep dive: [Context API](../reference/context-api.md), [Persistence API](../reference/persistence-api.md)
- [Developers Guide hub](../developers-guide.md)
