# Shared components (Stencil.js) conventions

Rules for working in `packages/shared-components`, a Stencil.js Web Component library.

## Component conventions

- Implement components in `.tsx` files using JSX-based `render()` methods.
- Register custom elements with `@Component({ tag: 'onto-*' })` — all tags are prefixed `onto-`.
- Use `@State()` for reactive internal state and `@Prop()` for inputs.
- Consume API services exclusively via `ServiceProvider.get(ServiceClass)` / `service()` (no Angular DI — see [architecture](architecture.md)).
- Manage subscription cleanup with `SubscriptionList` in `connectedCallback` / `disconnectedCallback`.

Reference example: `packages/shared-components/src/components/onto-header/onto-header.tsx`

## Scaffolding new components

Run inside `packages/shared-components`:

```bash
npm run generate
```

## See also

- [Developers Guide hub](../developers-guide.md)
