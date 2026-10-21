---
applyTo: "packages/api/**"
---

# Review rules — API package

Source of truth: `docs/conventions/` (architecture, api-domain-layer, typescript, jsdoc, testing, naming) and
`packages/api/AGENTS.md`. Keep this checklist in sync when those change. Flag a violation with the rule and the doc.

## Boundaries
- `packages/api` knows nothing about UI: no view URLs, UI event names, component types or translated text.
- Registries and generic base classes don't list their concrete entries; entries register from outside.
- Browser globals (`window`, `location`, `crypto`) only through `WindowService`.
- Never `new` a service or a class with logic; use `service()` and resolve collaborators once, as fields.
- Shared state has one owner, its context service; no copies in other services, clients or components.
- A new public symbol is exported from `src/ontotext-workbench-api.ts`.

## Domain layer
- REST service → response model → mapper → UI model. REST services are stateless and return response models.
- Response models are named `…Response` (never `…Dto`); optional only where the backend omits the field; no
  index signatures. Response and UI models don't share a base type.
- All transformation happens in `MapperFn` mappers; mappers don't mutate their input.
- UI models: private fields with getters; constructor takes `Partial<Model>` assigned 1:1, no `ModelInit`
  interfaces, no parsing. Models depend only on other models. Collections extend `ModelList` and default to an
  empty list, not `[]`; models with an `id` extend `IdModel`. Consumers call model methods instead of
  `find`/`filter` on the model's arrays.
- A default lives in one place: the mapper or the field initialiser.
- `fetch*` calls the backend; `get*`/`find*` are local lookups.

## Reuse
- `ObjectUtil.isNullOrUndefined`, `RdfVersionUtil.withVersion`, `BuildUtil.isDevMode`, `navigate()`/
  `navigateToLoginPage()`, `SecurityContextService#getAuthenticatedUser`, `SecurityConfig#isEnabled`/
  `#isFreeAccessEnabled`, `AuthenticationService#isLoggedIn`, `notify(Notification.error(code))`.

## TypeScript and docs
- No `any`; `unknown` and narrow. Pick `?:` over `| undefined`.
- A custom error class only when a caller branches on it: one class with a `kind`, explicit `name`, `cause`.
- Every exported class/interface and public member has a JSDoc: one opening line, method ≤5 lines, class ≤8,
  `@param`/`@returns`/`@throws`, contract and why, no implementation narration.
- Logging through the logger service, not `console.*`.

## Tests
- Test through the public service; mock HTTP with `TestUtil.mockResponse`; build data with real model classes.
