---
applyTo: "packages/workbench/**"
---

# Review rules — modern workbench (Angular)

Source of truth: `docs/conventions/` (components, angular, state, services, frontend-angular, styling, i18n,
naming, testing). Keep this checklist in sync when those change. Flag a violation with the rule and the doc.

## Angular
- No `standalone: true`, no `NgModule`, no `@HostBinding`/`@HostListener` (use `host`), no `@Input`/`@Output`
  (use `input()`/`output()`). `OnPush`, separate `templateUrl`/`styleUrl`, reactive forms.
- Native control flow only (`@if`/`@for`/`@switch`); `class`/`style` bindings, not `ngClass`/`ngStyle`.
- Signals and `computed()` for state; observables converted with `toSignal()` at the edge, no async pipe.
  Never `mutate` a signal.
- Templates hold no logic: bind to named flags or `computed()`, no value comparisons or defaults in the template.
- `inject()` for Angular services, `service()` for API-layer services. A `providedIn: 'root'` service is not
  also listed in a component's `providers`. No `Onto` prefix on workbench classes.
- Components don't inject REST services; they use the domain or context service.

## UI
- PrimeNG first; no native `<select>`/`<input>`, no Bootstrap classes. Dialogs via `DialogProviderService`,
  action buttons in `#footer`.
- Third-party web components are wrapped in a `*-facade` component; nothing outside the facade names the wrapped
  library.
- Toasts via `NotificationProviderService`, not `OntoToastrService`/`toastr`; no "Error!" prefix; user-triggered
  REST calls handle failure; untranslated error codes get a fallback message.

## Styles
- `--gw-*` tokens only (never `--p-*` or guessed names); component-level token before a semantic one.
- No inline `style`, no `!important`, `rem` not `px`, no `@import`.
- Styles stay scoped: global or `::ng-deep` selectors sit under the component's root class. App-wide classes go
  in `root-config/src/styles/partials/`. `.screen-reader-only`, not `.sr-only`.
- A component doesn't set its own `:host` layout; the parent decides.

## i18n
- Keys grouped by feature/component, named by meaning, one key per use, whole sentences with parameters.
- Translate in the template (`transloco` pipe) or at emit time, not into fields kept in sync on language change.

## Naming
- Names describe behaviour/state, not the consumer. Booleans read as questions (`isX`, `hasX`, `shouldX`).
- No unexplained abbreviations (`vm`, `cta`) or sequence names (`scenario16`). Test helpers: `*-testing-utils.ts`.
- A renamed feature is renamed everywhere: files, classes, routes, i18n keys, `data-test`, guide selectors.

## Tests
- Test public behaviour, mock at the lowest level; no spec per internal class. Test data built with real model
  classes. Elements tests need carry a kebab-case `data-test`.
