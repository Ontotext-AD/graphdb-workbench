# Modern workbench (Angular) conventions

Rules for working in `packages/workbench`, the Angular 21 frontend.

## Components and state

- Use the **standalone component** pattern (`standalone: true`). Do **not** use `NgModule` declarations.
- Use Angular **signals** for reactive state: `signal()`, `computed()`.
- Inject Angular services via `inject()`; inject API-layer singletons via `service()` (see [architecture](architecture.md)).

## UI library — PrimeNG

The workbench uses `primeng`. When building or changing pages:

- Prefer PrimeNG components over custom UI where practical.
- Follow existing PrimeNG usage patterns already in the codebase.
- Only introduce custom controls when no suitable PrimeNG component exists or the design clearly requires it.

PrimeNG is configured with the token prefix `gw` (see `packages/workbench/src/app/app.config.ts`), so generated CSS custom properties use the `--gw-*` prefix. See [theming](theming.md).

## Dialogs

Open dialogs imperatively via `DialogProviderService` (`packages/workbench/src/app/services/dialog/dialog-provider.service.ts`). Do **not** call PrimeNG `DialogService` directly — the wrapper applies the `onto-dialog` CSS class to all dialogs.

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
