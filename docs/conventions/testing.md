# Testing conventions

> Test the **public-facing behaviour** of a unit, and mock at the **lowest
> possible level**. Coverage comes from driving the real stack through its public
> surface — not from a spec per class, method, or function.

This guide covers unit tests (Jest). Cypress specs follow
[e2e-testing](e2e-testing.md).

## Contents

- [The core rule](#the-core-rule): test through the consumer's seam, mock at the HTTP boundary, don't multiply specs.
- [What is "public" here](#what-is-public-here): what to test vs. what is covered indirectly, per layer; private methods and test-only `public`.
- [Exceptions — test these directly](#exceptions--test-these-directly): utilities, pipes, core primitives, and presentation registries get their own specs.
- [Unit tests and the browser](#unit-tests-and-the-browser): what belongs in Jest and what belongs in E2E.
- [Worked example — a domain slice](#worked-example--a-domain-slice): which specs a slice has, and which it deliberately doesn't.
- [Mechanics](#mechanics): running specs per package, mocking HTTP, the only stubs allowed, component DOM testing.
- [Why](#why): the reasoning behind testing through the public surface.

## The core rule

**Test behaviour that a consumer depends on, through the seam that consumer uses.**

A unit's public surface is the set of methods and outputs some *other* code relies
on: a domain service's commands, a context service's subscriptions and snapshots,
a component's rendered DOM and emitted events, a utility's return value. That
surface is what a test drives. Everything reached *behind* it — the mapper a
service calls, the response model it parses, the REST service it awaits, its own
private methods — is **implementation** and is covered **indirectly**, as a side
effect of testing the public behaviour.

Two consequences:

- **Mock at the lowest level.** In `packages/api`, stub `fetch` (via `TestUtil`)
  and let the *real* service → REST service → mapper run end-to-end. Mocking a
  collaborator one layer down (e.g. handing a service a fake REST service)
  bypasses the very contract the test should prove.
- **Don't multiply specs.** One integration spec at the public surface replaces a
  cluster of per-class specs (a `*-rest.service.spec.ts`, a mapper spec, a model
  spec) that would re-assert the same behaviour from lower down. Older slices
  still have such per-layer specs; don't add new ones.

## What is "public" here

Public is defined by **who consumes it**, not by the `public`/`private` keyword or
by `providedIn: 'root'` (almost everything is injectable — that doesn't make it a
test target).

| Layer | Public surface — test this | Covered indirectly — don't spec directly |
|---|---|---|
| Domain slice (`packages/api/src/services/domain/*`) | the **service**'s commands and the **context service**'s `on*` / snapshot API | its REST service, mappers, response models |
| Component / page | rendered **DOM**, emitted **outputs**, input reactions | its private methods |
| Domain model | its behaviour **as observed through** the service or component that exposes it | — |

A private method that you feel you *must* reach directly is the signal that it — or
the class around it — is badly factored. Extract it into its own unit with its own
public reason to exist, or restructure so the public API exercises it. Adding a
test hook (making it public, `as any`, `@VisibleForTesting`) treats the symptom.

**A public method must earn its visibility from a real consumer, not from a test.**
If the only caller of a `public` method is its spec, it should be private (and
tested through the method that *is* public), or it doesn't belong in the class.

## Exceptions — test these directly

Genuinely standalone, reusable units are themselves the public surface, so they get
one focused spec each:

- **Pure utility functions and classes** — e.g. validators, formatting helpers,
  date utilities. They have no "higher" surface to be tested through.
- **Pipes** — a pipe *is* a public, reusable transform; test its `transform`
  directly with plain inputs.
- **Generic core primitives** — `HttpService`, `ContextService`, interceptors.
  These are the shared building blocks every feature stands on; they are tested
  once, on their own, so features can trust them and *not* re-test transport or
  context mechanics.
- **A registry / lookup of pure presentation data** (e.g. a type → label/icon
  registry) when it is consumed from several places and its mapping is the point.

If you're unsure whether something is an "exception": ask *who else calls it*. Many
independent callers, no natural higher surface → test it directly. Exactly one
caller that is itself tested → fold the coverage into that caller's test.

## Unit tests and the browser

Split by whether the check needs a real browser.

- **Unit (Jest)**: method and service logic, state transitions and emitted
  intents, error handling, parsing, serialization and comparison, business
  rules, and component output that a jsdom render shows. Plain dependency mocks
  and a simple stand-in for a child component are fine.
- **Not in the unit suite**: mounting heavy third-party web components (mock
  their loader instead, as `graph-navigator-page.component.spec.ts` does for
  `graphwise-reactodia`), or checking real rendering and control behaviour of
  complex flows. Those belong in [E2E tests](e2e-testing.md). A unit spec never
  builds a fake of a third-party component's DOM.

## Worked example — a domain slice

For the license slice in `packages/api/src/services/domain/license`, the
consumer-facing surface is `LicenseService` (commands) and
`LicenseContextService` (state). So:

- **`license.service.spec.ts`** drives the real `LicenseService`, which uses the
  real `LicenseRestService` and the real `license-response-mapper`, with **only
  `fetch` mocked** through `TestUtil.mockResponse(new ResponseMock(url)…)`. It
  asserts the returned `License` and the context updates, and, *because the whole
  stack ran*, it has already proven the URLs/verbs and the response→model mapping.
  A separate `license-rest.service.spec.ts` (which exists today) adds nothing a
  new slice should copy.
- **Component specs** in `packages/workbench` render the component and assert
  DOM + outputs. A model's behaviour is verified **through** them, not in a
  standalone model spec.
- **A validator spec** exists on its own, because validators are pure utilities
  (the exception) shared by several forms — they have no single higher surface.

## Mechanics

- **Jest** everywhere. `packages/workbench` runs it through the
  `@angular-builders/jest` builder; `packages/api` and `packages/shared-components`
  call Jest directly. Run one spec:
  - workbench: `npx ng test --test-path-patterns <pattern> --coverage=false`
    (`--include`, `--watch` and `npx jest` don't work there);
  - api: `npm run test -- <pattern>` (the script sets `BABEL_ENV=test`);
  - shared-components: `npx jest <pattern>`.
- In `packages/api`, mock HTTP with `TestUtil.mockResponse` / `mockResponses`
  and `ResponseMock` (`packages/api/src/services/utils/test/`); restore with
  `TestUtil.restoreAllMocks()` in `afterEach`.
- Build test data with the real model classes (`new AuthenticatedUser({...})`), not plain objects cast to the type.
- In `packages/workbench`, the API package is a separate bundle, so the lowest
  practical boundary is the API-layer service a component consumes: spy on it
  through `ServiceProvider.get(...)`. Stub only the true edges a unit can't run
  without (runtime configuration, logging).
- For components, use `provideTranslocoForTesting()`
  (`packages/workbench/src/testing-utils/transloco-utils.ts`) and drive real DOM
  events; read state back from the rendered DOM, not from protected fields.

## Why

Testing through the public surface means the suite asserts **behaviour users and
callers depend on**, so it stays green through refactors that move logic between a
service, its mapper, and its private helpers — exactly the changes that a
per-function spec would break for no behavioural reason. Fewer, higher tests also
mean each covers a real contract, and a gap in them points at a missing *capability*
rather than a missing line. And the discipline feeds back into design: if behaviour
is hard to reach from the public API, that is the test suite telling you the module
seam is in the wrong place.
