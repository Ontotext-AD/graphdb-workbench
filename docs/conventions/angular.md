# Angular conventions (framework-level)

Framework-level rules for `packages/workbench`. The workbench-specific services
and patterns (dialogs, permissions, Transloco) are in
[frontend-angular](frontend-angular.md).

- Use standalone components. Do **not** set `standalone: true` in Angular
  decorators — it's the default in v20+. Many existing components still set it;
  leave it out of new code and drop it when you touch a component.
- Lazy-load feature routes (`loadComponent` / `loadChildren` in `app.routes.ts`).
- Do **not** use `@HostBinding` / `@HostListener`. Put host bindings in the
  `host` object of the `@Component` / `@Directive` decorator instead.
- Use `NgOptimizedImage` for all static images. It does **not** work for inline
  base64 images.

See also: [components & templates](components.md),
[state management](state.md), [services](services.md).
