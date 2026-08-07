# Testing conventions

> Test the **public-facing behaviour** of a unit, and mock at the **lowest
> possible level**. Coverage comes from driving the real stack through its public
> surface — not from a spec per class, method, or function.

## The core rule

**Test behaviour that a consumer depends on, through the seam that consumer uses.**

A unit's public surface is the set of methods and outputs some *other* code relies
on: a context service's selectors and commands, a component's rendered DOM and
emitted events, a utility's return value. That surface is what a test drives.
Everything reached *behind* it — the mapper a service calls, the DTO it parses, the
REST client it awaits, its own private methods — is **implementation** and is
covered **indirectly**, as a side effect of testing the public behaviour.

Two consequences:

- **Mock at the lowest level.** Prefer stubbing the HTTP boundary
  (`HttpTestingController`) and letting the *real* context → API service → mapper →
  REST client run end-to-end. Mocking a collaborator one layer down (e.g. handing a
  context a fake API service) bypasses the very contract the test should prove.
- **Don't multiply specs.** One integration spec at the public surface replaces a
  cluster of per-class specs (`*.mapper.spec.ts`, a separate API-service spec, a
  model spec) that would re-assert the same behaviour from lower down.

## What is "public" here

Public is defined by **who consumes it**, not by the `public`/`private` keyword or
by `providedIn: 'root'` (almost everything is injectable — that doesn't make it a
test target).

| Layer | Public surface — test this | Covered indirectly — don't spec directly |
|---|---|---|
| Domain slice (`services/domain/*`) | the **context service**'s selectors + commands | its API service, mapper, DTOs, REST calls |
| Component / page | rendered **DOM**, emitted **outputs**, input reactions | the services it injects, its private methods |
| Domain model | its behaviour **as observed through** the context or component that exposes it | — |

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

- **Pure utility functions and classes** — e.g. validators
  (`project-validators.ts`), formatting helpers, `DateService`. They have no
  "higher" surface to be tested through.
- **Pipes** — e.g. `RelativeTimePipe`. A pipe *is* a public, reusable transform;
  test its `transform` directly with plain inputs.
- **The generic `core/` primitives** — `RestClient`, `AsyncState`, `ApiError`,
  interceptors. These are the shared building blocks every feature stands on; they
  are tested once, on their own, so features can trust them and *not* re-test
  transport or async-state mechanics.
- **A registry / lookup of pure presentation data** (e.g. the model-type registry)
  when it is consumed from several places and its mapping is the point.

If you're unsure whether something is an "exception": ask *who else calls it*. Many
independent callers, no natural higher surface → test it directly. Exactly one
caller that is itself tested → fold the coverage into that caller's test.

## Worked example — a domain slice

For the projects slice, the component-facing surface is
`ProjectsContextService`. So:

- **`projects-context.service.spec.ts`** drives the real context, which uses the
  real `ProjectsApiService`, the real `projectMapper`, and the real `RestClient`,
  with **only HTTP mocked**. It asserts the public selectors (`projects()`,
  `status()`, `statsFor()`, `isFirstLoad()` …) and, *because the whole stack ran*,
  it has already proven the URLs/verbs, the DTO→model mapping (ISO→epoch, null
  description, unknown `modelType` passthrough) and the batch-stats fan-out. There
  is **no** separate `projects-api.service.spec.ts` or `project.mapper.spec.ts`.
- **`project-card.spec.ts` / `projects.spec.ts`** render the components and assert
  DOM + outputs. The `Project` model's behaviour (`matches`, `shortNamespace`,
  `hasDescription`, `isKnownModelType`) is verified **through** them — the filter
  narrows the grid, the short namespace shows in the footer, the empty-description
  affordance appears, the badge renders known vs. raw. No standalone
  `project.model.spec.ts`.
- **`project-validators.spec.ts`** exists, because validators are pure utilities
  (the exception) used by forms that don't exist yet — they have no higher surface.

## Mechanics

- Vitest via `ng test` (not Karma/Jasmine). Run a subset with
  `ng test --watch=false --include='<glob>'`.
- Provide HTTP with `provideHttpClient()` + `provideHttpClientTesting()`; assert and
  flush through `HttpTestingController`; `httpMock.verify()` in `afterEach`.
- Stub only the true edges a unit can't run without — `ConfigService` (base URL),
  `LoggerService` — the way the existing slice specs do.
- For components, use the shared `provideTranslocoTesting()` and drive real DOM
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
