# Modern workbench (Angular) conventions

Rules for working in `packages/workbench`, the Angular 21 frontend. This page covers
the workbench-specific services and patterns; the general Angular rules are in
[angular](angular.md), [components & templates](components.md),
[state](state.md) and [services](services.md).

## Contents

- [Components and state](#components-and-state): standalone components, signals, `inject()` vs. `service()`.
- [UI library — PrimeNG](#ui-library--primeng): preferring PrimeNG and its `gw` token prefix.
- [Dialogs](#dialogs): open them through `DialogProviderService`.
- [Notifications and errors](#notifications-and-errors): toasts through `NotificationProviderService`, failure handling.
- [Third-party web components](#third-party-web-components): wrap them in a facade component.
- [Permission-based rendering](#permission-based-rendering): the `*appRestrictAccess` directive and `ViewPermissions`.
- [Unsaved changes](#unsaved-changes): registering callbacks with `UnsavedChangesService`.
- [Translations (Transloco)](#translations-transloco): the `transloco` pipe and `provideTranslocoForTesting()`.

## Components and state

- Use **standalone components** (the default in Angular 21 — don't set `standalone: true`). Do **not** use `NgModule` declarations.
- Use Angular **signals** for reactive state: `signal()`, `computed()` (see [state](state.md)).
- Inject Angular services via `inject()`; inject API-layer singletons via `service()` (see [architecture](architecture.md)).

## UI library — PrimeNG

The workbench uses `primeng`. When building or changing pages:

- Prefer PrimeNG components over custom UI where practical.
- Follow existing PrimeNG usage patterns already in the codebase.
- Only introduce custom controls when no suitable PrimeNG component exists or the design clearly requires it.

Details in [components](components.md#component-library--primeng-first).

PrimeNG is configured with the token prefix `gw` (see `packages/workbench/src/app/app.config.ts`), so generated CSS custom properties use the `--gw-*` prefix. See [theming](theming.md).

## Dialogs

Open dialogs imperatively via `DialogProviderService` (`packages/workbench/src/app/services/dialog/dialog-provider.service.ts`). Do **not** call PrimeNG `DialogService` directly — the wrapper applies the `onto-dialog` CSS class to all dialogs.

Put action buttons in the dialog's `#footer` template, not in the body.

## Notifications and errors

- Show toasts through `NotificationProviderService` (`services/notification/`), not `OntoToastrService` or
  `toastr`. It feeds the API-layer `NotificationService` queue, which a future notifications panel will read.
  Outside Angular DI (Stencil, legacy) call `notify(Notification.error(code))` from `@ontotext/workbench-api`.
- The toast type carries the severity: no "Error!" title or prefix on an error toast.
- Every REST call a user triggers handles failure: catch it and show a notification, or let it reach a caller that
  does. Never swallow it silently.
- When an error code has no translation, show a generic fallback message; don't hide the error.

## Third-party web components

Wrap a third-party web component (YASGUI, Reactodia, …) in a facade under `components/<name>-facade/` that owns
its initialisation, configuration and events; pages use the facade. Examples: `yasgui-component-facade`,
`graphwise-reactodia-facade`.

The facade is the boundary: models, contracts with the backend and doc comments outside it don't name the
wrapped library (`@reactodia/workspace`). Readers and the backend contract shouldn't depend on what's behind it.

## Permission-based rendering

Use the `*appRestrictAccess` structural directive (`packages/workbench/src/app/directives/restrict-access.directive.ts`):

```html
<div *appRestrictAccess="['isAdmin', 'canWriteActiveRepo']; else noAccess">...</div>
<ng-template #noAccess>...</ng-template>
```

Available permissions are in the `ViewPermissions` enum in that same file.

## Unsaved changes

Register callbacks via `UnsavedChangesService.register(callback)` (`packages/workbench/src/app/services/unsaved-changes/unsaved-changes.service.ts`). The returned `Subscription` unregisters the callback when called.

## Translations (Transloco)

The workbench uses `@jsverse/transloco`. Bundles are loaded from the API layer via `LanguageContextService` and fed to `TranslocoService` at bootstrap (`packages/workbench/src/app/bootstrap/transloco/transloco-bootstrap.ts`).

In templates:

```html
{{ 'some.key' | transloco }}
```

In unit tests, use the helper instead of configuring Transloco manually:

```typescript
import { provideTranslocoForTesting } from '../../../testing-utils/transloco-utils';
// In TestBed.configureTestingModule:
imports: [provideTranslocoForTesting()]
```

`provideTranslocoForTesting()` stubs Transloco with the preloaded English (`en.json`) bundle. For adding/validating translations see [i18n](i18n.md).

## See also

- [Developers Guide hub](../developers-guide.md)
