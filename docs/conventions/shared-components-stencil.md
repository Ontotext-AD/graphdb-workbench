# Shared components (Stencil.js) conventions

Rules for working in `packages/shared-components`, a Stencil.js Web Component library.

## Contents

- [Component conventions](#component-conventions): `.tsx`, `onto-*` tags, `@State`/`@Prop`, `ServiceProvider`, `SubscriptionList`.
- [Scaffolding new components](#scaffolding-new-components): `npm run generate`.

## Component conventions

- Implement components in `.tsx` files using JSX-based `render()` methods.
- Register custom elements with `@Component({ tag: 'onto-*' })` — all tags are prefixed `onto-`.
- Use `@State()` for reactive internal state and `@Prop()` for inputs.
- Consume API services exclusively via `ServiceProvider.get(ServiceClass)` / `service()` (no Angular DI — see [architecture](architecture.md)).
- Manage subscription cleanup with `SubscriptionList` in `connectedCallback` / `disconnectedCallback`.
- Name a handler bound to an event `on<Event>` (`onMouseOver`, `onMouseLeave`) and make it a class method.
- Render from state: change `@State` or the model and let Stencil re-render. Never add a dummy state field to
  force a render.
- Build markup with JSX (a functional component for a reusable fragment). Never assemble HTML by string
  concatenation; `innerHTML` is only for sanitized translations and static SVG.

Reference example: `packages/shared-components/src/components/onto-header/onto-header.tsx`

## Scaffolding new components

Run inside `packages/shared-components`:

```bash
npm run generate
```

## See also

- [Developers Guide hub](../developers-guide.md)
