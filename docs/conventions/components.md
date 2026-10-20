# Component & template conventions

Rules for Angular components in `packages/workbench`. They describe the target
for new and touched code; existing components don't all follow them yet
(`OnPush`, `input()`/`output()`, separate template files). Don't refactor
untouched components just to comply.

Stencil components in `packages/shared-components` follow
[their own conventions](shared-components-stencil.md).

## Contents

- [Component library — PrimeNG first](#component-library--primeng-first): reach for PrimeNG, theme instead of forking, when a custom component is justified.
- [Components](#components): `input()`/`output()`, `OnPush`, separate template files, reactive forms.
- [Templates](#templates): native control flow, `class`/`style` bindings, signals over the async pipe, `data-test`.

## Component library — PrimeNG first

We use **[PrimeNG](https://primeng.org/)** as our component library.
**Reach for a PrimeNG component before hand-rolling one.** Don't reinvent a control
PrimeNG already provides — a bespoke version is more code to own, drifts from the
app's look and behaviour, and usually misses accessibility and keyboard support the
library already ships.

- **Default to PrimeNG** for any standard UI primitive: `Select` / `MultiSelect`
  (dropdowns and facets), `InputText` + `IconField`/`InputIcon` (text and search
  fields), `Button`, `Menu` (kebab menus), `Tag` (badges), `Card`, `Skeleton`,
  `Toast`/`Message`, `Splitter`, `Tooltip`, `Dialog`/`DynamicDialog`,
  and so on. Native `<select>`, `<input>`, ad-hoc skeleton `<div>`s and custom
  buttons are **not** the house style where a PrimeNG equivalent exists.
- **Theme, don't fork.** Adjust appearance through the PrimeNG theme / CSS variables
  (the `--gw-*` design tokens) and component style hooks rather than rebuilding the
  component to change how it looks. See [styling](styling.md).
- **Write a custom component only when** PrimeNG has no suitable primitive, or its
  primitive genuinely can't be made to fit after theming and configuration. When
  you do, say why in the component's JSDoc, and still compose PrimeNG primitives
  inside it where they apply.
- A thin app wrapper around a PrimeNG component (to centralise defaults or an
  accessible pattern) is encouraged — that is composing PrimeNG, not replacing
  it. `DialogProviderService` is one: open dialogs through it, not through
  PrimeNG's `DialogService` (see [frontend-angular](frontend-angular.md#dialogs)).

## Components

- One responsibility per component; keep them small.
- Use the `input()` and `output()` functions, not the `@Input()` / `@Output()`
  decorators.
- Use `computed()` for derived state.
- Set `changeDetection: ChangeDetectionStrategy.OnPush`.
- Always put templates and styles in **separate files** referenced from the
  component, using paths relative to the component `.ts` file
  (`templateUrl` / `styleUrl`). Don't use inline templates or styles.
- Use **Reactive** forms, not template-driven ones.
- Aim for WCAG AA — focus management, colour contrast, ARIA attributes — as an
  implementation target, not a gate. It is not a reason to add accessibility
  tests.

## Templates

- Use native control flow (`@if`, `@for`, `@switch`) — never `*ngIf`, `*ngFor`,
  `*ngSwitch`.
- Bind classes with `class` bindings, not `ngClass`.
- Bind styles with `style` bindings, not `ngStyle`.
- Render reactive data with signals / `computed()`. If an observable is
  unavoidable (some Angular/3rd-party APIs), convert it with `toSignal()` at the
  edge rather than reaching for the async pipe.
- Don't assume ambient globals (e.g. `new Date()`) are available in templates.
- Give elements that tests need a `data-test` attribute (kebab-case, prefixed
  with the component or page). Both the unit and the E2E specs select by it — see
  [e2e-testing](e2e-testing.md#6-selectors).
- Keep logic out of templates. Condense conditions into named flags on a UI model or `computed()`
  (`isEditable`, `hasReadAccess`, `limitDisabled`) and bind to them. A template doesn't compare values
  (`linksLimit > 999`) or apply defaults.
- Use semantic elements: `<button>` for actions, `<a>` only for navigation, `h1`–`h6` for headings, not styled
  `div`s. No Bootstrap classes in the workbench.
