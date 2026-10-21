# Plugin system

The extension-point / plugin mechanism for extending GraphDB Workbench without coupling new and existing components.

## Contents

- [Overview](#overview): `PluginRegistry`, extension points, and plugin definitions.
- [Extension points](#extension-points): the registered ones and how a new one is added.
- [Plugin definitions](#plugin-definitions): `plugin.js` files, `disabled`, replacing a plugin by id, `order` / `priority`.
- [Where plugins come from](#where-plugins-come-from): the bundled `plugins.js` and external plugins from the manifest.
- [Consuming an extension point](#consuming-an-extension-point): reading plugins in application code.

## Overview

The plugin system has three parts:

- **`PluginRegistry`** ([`plugin-registry.ts`](../../packages/api/src/services/plugins/plugin-registry.ts)) keeps the
  plugins registered to each extension point at runtime. One instance is created in
  [`ontotext-root-config.ts`](../../packages/root-config/src/ontotext-root-config.ts) and published through
  `WindowService.setPluginRegistry()`, so it is reachable as `window.PluginRegistry` (legacy code, `plugin.js` files)
  and `WindowService.getPluginRegistry()` (TypeScript).
- **Extension points** are the contracts plugins register to. Each is a class extending `ExtensionPoint`.
- **Plugin definitions** are the objects registered to an extension point.

```typescript
class PluginRegistry {
  registerExtensionPoint(extensionPoint: ExtensionPoint): void;
  add(extensionPointName: string, plugin: Plugin | Plugin[]): void;
  get<T extends Plugin>(extensionPointName: string): T[];
  findPlugin<T extends Plugin>(extensionPointName: string, predicate: (item: T) => boolean): T | undefined;
  clear(extensionPointName: string): void;
  clearAll(): void;
}
```

## Extension points

Extension points live in `packages/api/src/models/plugins/extension-points/` and are registered explicitly at
bootstrap, in `ontotext-root-config.ts`:

| Name | Class | Used for |
|---|---|---|
| `main.menu` | `MainMenuExtensionPoint` | Main menu items |
| `route` | `RouteExtensionPoint` | Legacy workbench views (`$routeProvider` in `legacy-workbench/src/app.js`) |
| `guide.step` | `InteractiveGuideExtensionPoint` | Interactive guide steps |
| `themes` | `ThemesExtensionPoint` | Registered, currently unused |

- `add()` or `get()` on a name that isn't registered throws `ExtensionPointNotFoundError`.
- Registering the same name twice throws `ExtensionPointAlreadyRegisteredError`.
- A new extension point is a new `ExtensionPoint` subclass registered next to the others. The registry itself doesn't
  list its extension points.

## Plugin definitions

Bundled plugins are declared in files named `plugin.js` in `packages/legacy-workbench/src`. One file may register to
several extension points:

```javascript
// packages/legacy-workbench/src/js/angular/autocomplete/plugin.js
PluginRegistry.add('route', {
    'url': '/autocomplete',
    'module': 'graphdb.framework.autocomplete',
    'path': 'autocomplete/app',
    'chunk': 'autocomplete',
    'controller': 'AutocompleteCtrl',
    'templateUrl': 'pages/autocomplete.html',
    'title': 'Autocomplete index',
    'helpInfo': 'The Autocomplete index is used for automatic completion of URIs ...',
    'documentationUrl': 'autocomplete-index.html'
});

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"},
        {label: 'Autocomplete', href: 'autocomplete', order: 40, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY"}
    ]
});
```

Look at the existing `plugin.js` files for an extension point's shape before adding one.

### `disabled`

A plugin with `disabled: true` is skipped: it isn't validated or registered. Plugins are enabled by default.

### Replacing a plugin by id

An extension point may declare a `fieldIdName` (for `guide.step` it is `guideBlockName`). A plugin whose value of that
field matches an already registered plugin replaces it.

### `order` and `priority`

These apply only to extension points that extend `OrderedExtensionPoint`. **None of the registered extension points
does today**; main menu items carry their own `order`, which the navbar uses for sorting.

On an ordered extension point:

- plugins are kept sorted by `order`;
- `priority` (default `0`) decides between two plugins with the same `order`: the higher one replaces the other;
- the same `order` and the same `priority` throws `DuplicatePluginOrderError`.

## Where plugins come from

1. **Bundled `plugins.js`.** During the build, every `packages/legacy-workbench/src/**/plugin.js` is concatenated into
   `plugins.js` (see [Bundling](bundling.md)). `index.ejs` appends it as a `<script>` once root-config has loaded, so
   the `PluginRegistry.add(...)` calls run against the registry created there. Don't edit `plugins.js`; it is generated.
2. **External plugins.** At bootstrap, `PluginsService.loadPlugins()` (`packages/root-config/src/bootstrap/plugins/`)
   reads the manifest at `pluginsManifestPath` from the application configuration (default
   `plugins/plugins-manifest.json`, copied from the `graphdb-workbench-plugins` package). It imports each entry module
   and calls its `register(registry)` ([`PluginModule`](../../packages/api/src/models/plugins/plugin-module.ts)). If
   the manifest can't be loaded, the workbench continues with the bundled plugins only. In development, the dev server
   serves `wb-plugins/` under `/plugins`.

## Consuming an extension point

Application code reads an extension point's plugins and acts on them. The legacy routes are one example:

```javascript
// packages/legacy-workbench/src/app.js
const routes = PluginRegistry.get('route');
angular.forEach(routes, function(route) {
    $routeProvider.when(route.url, {
        controller: route.controller,
        templateUrl: route.templateUrl,
        title: route.title,
        helpInfo: route.helpInfo,
        documentationUrl: route.documentationUrl,
        reloadOnSearch: route.reloadOnSearch !== undefined ? route.reloadOnSearch : true
    });
});
```

From TypeScript:

```typescript
const menuItems = WindowService.getPluginRegistry().get<MainMenuPlugin>(MainMenuExtensionPoint.NAME);
```

---

See also: [Developers Guide](../developers-guide.md)
