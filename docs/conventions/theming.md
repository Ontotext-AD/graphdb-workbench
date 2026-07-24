# Theming & design tokens

Rules for styling work across the repo. Applies whenever you touch colors, spacing, or component tokens.

## Source of truth: `graphwise-styleguide`

Design tokens come from Figma Token Studio and are built into theme stylesheets by the external `graphwise-styleguide` npm package. Verified in this repo:

- `packages/root-config/package.json` declares the `graphwise-styleguide` dependency.
- `packages/root-config/src/bootstrap/theme/theme-bootstrap.ts` dynamically imports `graphwise-styleguide/dist/variables-light.css` and `variables-dark.css`.
- Styles consume exported CSS custom properties through the `--gw-*` prefix.

## Rules

- Prefer reusing existing `--gw-*` CSS variables over hardcoding colors/spacing/token values.
- Treat the generated Graphwise stylesheets as external build artifacts — do not duplicate token values into local styles unless there is a clear repo-local semantic layer.
- If a needed token does not exist, the change may belong in the external `graphwise-styleguide` package, not here.
- When adding repo-local variables, map them to `--gw-*` where practical (see `packages/root-config/src/vendor/variables.css`).
- **Verify styling changes in both light and dark theme modes** when touching shared/global UI.
- Be careful not to break legacy styles that depend on `--gw-*` variables in `packages/legacy-workbench`.

## Local styleguide development

To develop against a locally linked `graphwise-styleguide`:

```bash
npm run dev:styleguide          # link + start
npm run link:styleguide         # link only
npm run unlink:styleguide       # unlink
```

## See also

- Custom color themes as plugins: [reference/plugin-system.md](../reference/plugin-system.md)
- [Developers Guide hub](../developers-guide.md)
