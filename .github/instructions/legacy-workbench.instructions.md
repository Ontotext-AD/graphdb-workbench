---
applyTo: "packages/legacy-workbench/**"
---

# Review rules — legacy workbench (AngularJS)

Source of truth: `packages/legacy-workbench/AGENTS.md` and `docs/conventions/` (i18n, naming, styling).
Keep this checklist in sync when those change. Flag a violation with the rule and the doc.

## Structure
- `plugin.js` registrations keep their shape; renaming or removing breaks routing and the menu.
- Controllers use the `XxxRestService` factories, not raw `$http`.
- Controller/directive layout in new or changed code: public `$scope` fields first, then public functions, then
  private ones; startup logic in a private `init()` defined last and called at the end. Only what the template
  uses goes on `$scope`.
- HTTP: chain promises, end with `.catch` that reports the error, reset loading flags in `.finally`.
- Handlers bound to events are named `on<Event>`.
- `$timeout`, not `setTimeout`, when the callback changes `$scope`.
- Subscriptions, intervals and references are cleaned up in `$scope.$on('$destroy', …)`.
- `service(X)` resolved once at the top with the other dependencies.
- Navigate to another view with `navigate()` from `@ontotext/workbench-api` (keeps the context path).
- Use the TS bridge (`@ontotext/workbench-api`) instead of re-implementing: current user from
  `SecurityContextService#getAuthenticatedUser`, `SecurityConfig#isEnabled`/`#isFreeAccessEnabled`,
  `ObjectUtils.isNullOrUndefined`.
- No `console.log`; arrow functions for callbacks; `if` bodies in braces.

## Templates
- Bind to flags the controller computes, not inline condition chains. A template calls no functions except
  event handlers and filters (a model getter counts as a call).
- Tests select by `data-test`, not by class.
- Translate with the `translate` filter in the view, not into `$scope` strings refreshed on language change.

## Styles
- LESS/CSS only, never SCSS. Scope every selector under the directive's or view's root class; `.btn`, not
  `button.btn`. `--gw-*` tokens, never hardcoded colours.
- YASGUI styles go in `src/css/lib/ontotext-yasgui-web-component-styles/`, and the same change is needed in the new
  SPARQL view (`yasgui-component-facade.component.scss`).

## Twins
- Guide steps live in `graphdb-workbench-plugins`; changes to guided views or guide selectors need a matching
  change there.
