# State management conventions

Rules for state in `packages/workbench`. Shared application state (active
repository, language, security, …) lives in the API package's context services —
see [architecture](architecture.md) and the
[Context API](../reference/context-api.md).

- Use signals for local component state.
- Use `computed()` for derived state.
- Never call `mutate` on a signal — use `update` or `set`.
- Keep state transformations pure: no side effects, same input → same output.
- Prefer Promises + signals over RxJS in workbench code. Where a value arrives
  as an observable or a subscription callback (Angular/3rd-party APIs, API-package
  context services), convert it to a signal at that boundary rather than threading
  it through the component.

This applies to the Angular workbench only. `packages/api` is framework-agnostic
and keeps its own observable/subscription-based model.
