# API domain layer — models and mappers

How data moves through a domain slice in `packages/api`, and where each piece of logic belongs.

## Contents

- [The pipeline](#the-pipeline): REST service → response model → mapper → UI model.
- [Models](#models): encapsulation, behaviour on the model, one place for defaults, `ModelList`.
- [Mappers](#mappers): `MapperFn` functions, one instance per service.
- [Naming](#naming): `fetch*` vs. `get*` / `find*`.

## The pipeline

REST service → response model → mapper → UI model → service / context service → consumers

- The **REST service** returns the backend payload typed as a **response model**, and nothing else. It keeps no
  state: config, headers and tokens are read from their context service on each call, never cached in the client.
- The **mapper** turns the response model into the **UI model**. Every transformation happens there: renaming,
  defaults, normalisation, enum conversion (`toEnum`, `services/utils/enum-util.ts`). Mapping back for a request goes
  through a mapper too.
- The backend shape is a **response model** named `…Response` (`AuthenticatedUserResponse`), never `…Dto`.
  It marks a field optional only when the backend actually omits it, and it has no index signature.
- A response model and a UI model don't extend a shared type; if they would be identical, they are one type.
- Past the mapper, code works only with UI models. A UI model never holds a response model, and its constructor
  doesn't parse response data.

## Models

- Keep fields private; expose getters, and setters or methods only where a consumer needs them.
- Behaviour that belongs to the data lives on the model (`isNew()`, `clearHoveredState()`), not in a `*-utils.ts`.
- A default lives in one place: the mapper or the model's field initialiser. Not both, and never in a template or
  a consumer.
- Collections extend `ModelList` (`models/common/model-list.ts`). A method specific to one model goes in the
  subclass, never in `ModelList`.
- Consumers don't `find`, `filter` or index into a model's arrays. Add the method to the model or its `ModelList`
  subclass, so the structure can change without touching callers.
- A collection field defaults to its own type (an empty `ModelList` subclass), never to a plain `[]`.
- Models depend only on other models: no services, mappers or `window`.
- A model's constructor takes `Partial<Model>` and assigns it 1:1. Don't add a `ModelInit` interface that repeats
  the model's fields, and don't transform data there; that is the mapper's job.
- A model with an `id` extends `IdModel`.
- Models carry no translated text or translation keys for display. The layer that renders them decides wording.

## Mappers

- Mappers are `MapperFn` functions in the service's `mappers/` folder. Where a mapper is a class, the service keeps
  one instance as a field instead of creating it per call.

- A mapper doesn't mutate its input. Derive values into locals and build the model from them.

## Naming

- `fetch*` is for methods that call the backend; local lookups are `get*` / `find*`.

## See also

- [Architecture](architecture.md#state-ownership) — who owns shared state.
- [Testing](testing.md#worked-example--a-domain-slice) — testing a slice through its service.
