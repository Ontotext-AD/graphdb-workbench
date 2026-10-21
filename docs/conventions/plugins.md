# Plugins & extension points

Rules for extensibility work. The plugin system registers routes, menu items, guide steps and other extension points without coupling new and existing components.

## Contents

- [Key points](#key-points): `plugin.js`, `PluginRegistry.add`, and the extension points.
- [When doing extensibility work](#when-doing-extensibility-work): match existing plugins; respect `disabled`, ids, and ordering.

## Key points

- Bundled plugin definitions are `plugin.js` files in `packages/legacy-workbench/src`, concatenated into `plugins.js`
  during bundling. External plugins (guide steps among them) come from `graphdb-workbench-plugins` through the
  plugins manifest.
- Registration happens through `PluginRegistry.add(extensionPoint, definition)`.
- Extension points are `main.menu`, `route`, `guide.step` and `themes` (currently unused). They are registered in
  `packages/root-config/src/ontotext-root-config.ts`; adding to an unregistered one throws.

## When doing extensibility work

- Look for existing `plugin.js` files first and match their shape.
- Preserve the extension point contract shapes.
- Respect `disabled`, the extension point's id field (`fieldIdName`), and, on an ordered extension point, `order`
  and `priority`.

## See also

- Deep dive (registry API, plugin sources, ordering/priority rules): [reference/plugin-system.md](../reference/plugin-system.md)
- [Developers Guide hub](../developers-guide.md)
