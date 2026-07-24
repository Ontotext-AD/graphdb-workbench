# Plugins & extension points

Rules for extensibility work. The plugin system registers routes, menu items, themes, and other extension points without coupling new and existing components.

## Key points

- Plugin definitions are named `plugin.js` and gathered during bundling.
- Registration happens through `PluginRegistry.add(extensionPoint, definition)`.
- Extension points include `route`, `main.menu`, and `themes`.

## When doing extensibility work

- Look for existing `plugin.js` files first and match their shape.
- Preserve the extension point contract shapes.
- Respect plugin `order`, `priority`, and `disabled` semantics.

## See also

- Deep dive (registry API, ordering/priority rules, color-theme plugins): [reference/plugin-system.md](../reference/plugin-system.md)
- [Developers Guide hub](../developers-guide.md)
