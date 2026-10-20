# Styling conventions

## Design tokens — use `--gw-*`, never PrimeNG's native `--p-*`

Our apps' look comes from **`graphwise-styleguide`**, a Graphwise design
system built on top of PrimeNG. It ships CSS custom properties prefixed
`--gw-*`; light and dark switch by toggling the `dark` class on the root element
(`ThemeService` in `packages/api/src/services/theme/theme.service.ts`). How the
styleguide is loaded and linked locally is in [theming](theming.md).

PrimeNG's own theme also defines variables — `--p-text-muted-color`,
`--p-content-border-color`, and so on — plus older PrimeNG releases used bare
names like `--surface-border` or `--text-color-secondary`. **None of these
exist in an app themed by the styleguide.** The styleguide doesn't define them, so a
`var(--p-..., fallback)` or `var(--surface-..., fallback)` silently renders
its hardcoded fallback forever, in both themes — it looks fine at a glance but
is dead on arrival and never follows theme or dark-mode changes.

- Style custom components with `var(--gw-*)` tokens, not `--p-*` or bare
  PrimeNG legacy names.
- PrimeNG components used in our apps are **already themed** by the
  styleguide — don't override their internals with hand-picked colors; theme
  through the exposed `--gw-*` hooks instead (see
  [components](components.md#component-library--primeng-first)).
- Before inventing a variable name, confirm it actually exists:
  ```bash
  grep -- '--gw-your-guess' packages/root-config/node_modules/graphwise-styleguide/dist/variables-light.css
  ```
  or run `npm run generate-tokens-html` inside `graphwise-styleguide` to browse
  the full token set in a page. A guessed name that happens to start with
  `--gw-` is just as broken as a `--p-*` one if it isn't actually declared —
  check it, don't assume it.
- Common tokens: `--gw-text-color` / `--gw-text-muted-color` for foreground
  text, `--gw-border-color-default` / `--gw-divider-border-color` /
  `--gw-card-border-color` for borders, `--gw-primary-base` for the brand
  accent, `--gw-background-subtle` / `--gw-hover-background` for fills.
- A hardcoded fallback (`var(--gw-text-muted-color, #6b7280)`) is unnecessary —
  the token is always declared by the styleguide — but harmless if present
  for defense; don't add new ones purely out of habit.

## Writing styles

- For a known component kind, use its component-level token (`--gw-tag-error-background`, the button tokens)
  before a general semantic one.
- No inline `style` attributes and no `!important`. Put the rule in the stylesheet with a selector specific enough.
- A component doesn't set its own `:host` layout (`display: block; width: 100%`); the parent decides.
- Let content size itself with flex layouts instead of fixed widths, since translated labels differ in length.
- A stylesheet styles only its own component or page. A selector in a global file or under `::ng-deep` is scoped
  under the component's root class, so it can't leak into other pages.
- App-wide reusable classes (alerts, buttons) go in `packages/root-config/src/styles/partials/`, not in a page.
- For visually hidden text use `.screen-reader-only` (our class), not Bootstrap's `.sr-only`.
- Size with `rem`, not `px`.
