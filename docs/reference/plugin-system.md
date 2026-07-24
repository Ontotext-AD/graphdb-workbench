# Plugin system

The extension-point / `plugin.js` mechanism for extending GraphDB Workbench without coupling, including color themes (implemented as a plugin).

## Extending the GraphDB Workbench

## Plugin system

Since v1.2, GraphDB workbench features a plugin system which allows components to be plugged in 
without introducing coupling between new and existing components. The new system allows extending or 
replacing existing components, introduction of new single or compositional components. All this 
could be achieved without any changes in the rest of the system.

_Currently the new system is integrated in the workbench main components registration. These are the
components which implement the main workbench views (extension point `route`) and their respective 
main menu entries (extension point `main.menu`). In next versions more extension points might be 
introduced._

### What is the plugin system and how a developer can use it?

The plugin system consist of four components. 

The `PluginRegistry` which is a service that has a role to maintain a runtime registry of all 
registered to given extension point plugins. It has the following interface:
```javascript
PluginRegistry {
    add(extensionPoint:String, pluginDefinition:[Object|Array]),
    get(extensionPoint:String):Array,
    clear(extensionPoint:String),
    listModules()
}
```

The second component is the plugin definition which a developer can define for each extension point
where he needs new behavior or customization. When there is a need given component to be extended or 
customized, the developer declares an extension point which is the contract to which plugins can be 
registered. Every plugin should conform to that contract. Plugin definitions are javascript files 
with mandatory name `plugin.js`.

Example of a plugin definition: 
```javascript
// src/js/angular/autocomplete/plugin.js
PluginRegistry.add('route', {
    'url': '/autocomplete',
    'module': 'graphdb.framework.autocomplete',
    'path': 'autocomplete/app',
    'chunk': 'autocomplete',
    'controller': 'AutocompleteCtrl',
    'templateUrl': 'pages/autocomplete.html',
    'title': 'Autocomplete index',
    'helpInfo': 'The Autocomplete index is used for automatic ...',
    'documentationUrl': 'autocomplete-index.html'
});
```

**In a single plugin.js definition file can be registered plugins to multiple extension points.**

The above `plugin.js` definition can be extended like this: 
```javascript
PluginRegistry.add('route', {
    'url': '/autocomplete',
    'module': 'graphdb.framework.autocomplete',
    'path': 'autocomplete/app',
    'chunk': 'autocomplete',
    'controller': 'AutocompleteCtrl',
    'templateUrl': 'pages/autocomplete.html',
    'title': 'Autocomplete index',
    'helpInfo': 'The Autocomplete index is used for automatic completion of URIs in the SPARQL editor and the View resource page. Use this view to enable or disable the index and check its status.',
    'documentationUrl': 'autocomplete-index.html'
});

PluginRegistry.add('main.menu', {
    'items': [
        {label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"},
        {label: 'Autocomplete', href: 'autocomplete', order: 40, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY"}
    ]
});
```

Plugin definitions can have the following optional attributes: `order`, `priority`, `disabled`.
* The plugin `order` can be used when the extension point contract requires plugins to be loaded in 
particular order.
```javascript
// src/module_1/plugin.js
PluginRegistry.add('extension.point', {
    'label': 'plugin-1',
    'order': 10
});
```
```javascript
// src/module_2/plugin.js
PluginRegistry.add('extension.point', {
    'label': 'plugin-2',
    'order': 20
});
``` 
```javascript
// src/main.js
const plugins = PluginRegistry.get('extension.point');
// plugins[0] -> `plugin-1`
// plugins[1] -> `plugin-2`
```
If order is not provided, then plugins are loaded in order of their registration which is the order 
in which the plugin.js files are processed during the application bundling.

* The `priority` attribute can be used when an ordered plugin should be overridden by another plugin. 
If not provided, priority for every plugin is set by default to `0`. Having two plugins with same 
order but different priority results in overriding the lower priority plugin by the other. If there 
are two plugins with equal order and priority, then an error is thrown to warn the developer for the 
issue.
 ```javascript
 // src/module_1/plugin.js
 PluginRegistry.add('extension.point', {
     'label': 'plugin-1',
     'order': 10
 });
 ``` 
 ```javascript
 // src/module_2/plugin.js
 PluginRegistry.add('extension.point', {
     'label': 'plugin-2',
     'order': 10,
     'priority': 10
 });
 ``` 
 ```javascript
 // src/main.js
 const plugins = PluginRegistry.get('extension.point');
 // plugins[0] -> `plugin-2`
 ```
 
 * A plugin can be disabled by setting the `disabled: true` attribute which means that the plugin 
 won't be loaded. All plugins by default are considered enabled. If a plugin is disabled, its 
 definition is not validated and processed - it's just skipped.
 ```javascript
 // src/module_1/plugin.js
 PluginRegistry.add('extension.point', {
     'label': 'plugin-1',
     'disabled': true
 });
 ``` 
 ```javascript
 // src/module_2/plugin.js
 PluginRegistry.add('extension.point', {
     'label': 'plugin-2',
 });
 ``` 
 ```javascript
 // src/main.js
 const plugins = PluginRegistry.get('extension.point');
 // plugins[0] -> `plugin-2`
 ```

The third component from the plugin system is the `plugins.js` file which is autogenerated and is 
composed from all `plugin.js` files during the workbench build. Usually developers don't need to 
touch this file. 

The last part are the extension points which the developer implements in the application code. An 
extension point is the place where plugins are loaded and eventually executed. 

Below is an example of extension point in the workbench which allows registering modules that can be
accessed by navigating to different url (routes).
```javascript
// src/app.js
// 1. Get all registered extension for the "route" extension point. 
let routes = PluginRegistry.get('route');
// 2. Loop through all extensions
routes.forEach(function (route) {
    // 3. Register every extension with the $routeProvider
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

### How does the plugin system work? 

* During the workbench packaging with webpack, the source code directory is scanned for plugin 
definitions.
* The content of every plugin definition which is found is copied and appended to a file named 
`plugins.js`. This file is programmatically generated during the bundling.
* Both `PluginRegistry` and the `plugins.js` are defined in the main application html template.
```
<head>
    <script src="plugin-registry.js"></script>
    <script src="plugins.js"></script>
</head>
```  
This allows the plugins to be registered runtime in the registry immediately after the web 
application is loaded by issuing calls to `PluginRegistry.add(extensionPoint, pluginDefintion)` 
method.

## Color themes

The workbench allows custom color themes to be provided by developers. Themes are implemented as plugins
and can be registered to the `themes` extension point. Any custom theme must be placed in the project's
src folder a file named `plugin.js`. Example theme plugin can be seen below:

```javascript
PluginRegistry.add('themes', {
    // The name of the theme. Must contain only lowercase letters, hyphen, underscore. This is the differentiator
    // property for all registered themes.
    'name': 'default-theme',
    // The theme label or a key for a label from i18n resource bundle.
    'label': 'security.workbench.settings.theme.default-theme',
    // CSS variables, "foo: bar" becomes "--foo: bar"
    'variables': {
        // Primary color, like a main brand color. This is in a HSL format composed by three values below
        'primary-color-hue': '13.4',
        'primary-color-saturation': '87.9%',
        'primary-color-lightness': '33%',
        // Secondary color, like a contrast main brand color. This is in a HSL format composed by three values below
        'secondary-color-hue': '207.3',
        'secondary-color-saturation': '100%',
        'secondary-color-lightness': '19.4%',
        // Tertiary color, like a complimentary color. This is in a HSL format composed by three values below
        'tertiary-color-hue': '174.6',
        'tertiary-color-saturation': '97.7%',
        'tertiary-color-lightness': '33.5%',
        // A color used for the font/svg icons when placed on a primary color background.
        'icon-on-primary-color': 'rgba(255, 255, 255, 0.8)',
        'gray-color': '#97999C',
        'gray-color-dark': '#575757',
        // Colors for the toastr notifications, the tag-xxx and the text-xxx classes in any of their four states
        // (i.e. dark colored things)
        'color-danger-dark': 'hsl(353, 78%, 36%)',
        'color-success-dark': 'hsl(var(--tertiary-color-hue), var(--tertiary-color-saturation), calc(var(--tertiary-color-lightness)*0.5))',
        'color-warning-dark': 'var(--primary-color-dark)',
        'color-info-dark': 'var(--secondary-color-light)',
        // Colors for the alert boxes (i.e. light colored things).
        // Success and info are the same color since we don't use success much if at all
        'color-danger-light': '#a4142433',
        'color-success-light': 'hsla(var(--tertiary-color-hsl), 0.15)',
        'color-warning-light': 'hsla(var(--primary-color-hsl), 0.07)',
        'color-info-light': 'hsla(var(--tertiary-color-hsl), 0.15)',
        'color-help-light': 'hsla(var(--secondary-color-hsl), 0.1)',
        // Colors for the logo - logo proper, text in logo, logo background
        'logo-color': 'var(--primary-color-light)',
        'logo-text-color': 'white',
        'logo-background-color': 'var(--secondary-color-dark)'
    },
    // Dark theme
    'dark': {
        'variables': {
            // Dark definition variables that affect things at a global scale
            'body-filter': 'invert(95%) hue-rotate(180deg)',
            'html-background': '#0d0d0d',
            'media-filter': 'invert(100%) hue-rotate(180deg)',
            'alert-filter': 'contrast(2)',
            'checkbox-filter': 'invert(100%) hue-rotate(180deg)',
            'toast-filter': 'invert(95%) hue-rotate(180deg) contrast(1.2)',
            // Slightly different colors that work better in dark mode
            'primary-color-lightness': '60%',
            'secondary-color-saturation': '70%',
            'color-warning-light': 'hsla(var(--primary-color-hsl), 0.15)',
            'logo-color': 'var(--primary-color-dark)'
        },
        // CSS properties, "foo: bar" becomes "foo: bar"
        'properties': {
            // Notify browser that we support dark theme, makes checkboxes look better
            'color-scheme': 'light dark'
        }
    }
});
```

The plugin definition is compiled to a stylesheet and embedded in the html document

```css
:root {
    --primary-color-hue: 13.4;
    --primary-color-saturation: 87.9%;
    --primary-color-lightness: 33%;
    --primary-color-hsl: var(--primary-color-hue), var(--primary-color-saturation), var(--primary-color-lightness);
    --primary-color: hsl(var(--primary-color-hsl));
    --primary-color-light: hsl(var(--primary-color-hue), var(--primary-color-saturation), calc(var(--primary-color-lightness)*1.2));
    --primary-color-dark: hsl(var(--primary-color-hue), var(--primary-color-saturation), calc(var(--primary-color-lightness)*0.8));

    --secondary-color-hue: 207.3;
    --secondary-color-saturation: 100%;
    --secondary-color-lightness: 19.4%;
    --secondary-color-hsl: var(--secondary-color-hue), var(--secondary-color-saturation), var(--secondary-color-lightness);
    --secondary-color: hsl(var(--secondary-color-hsl));
    --secondary-color-light: hsl(var(--secondary-color-hue), var(--secondary-color-saturation), calc(var(--secondary-color-lightness)*1.2));
    --secondary-color-dark: hsl(var(--secondary-color-hue), var(--secondary-color-saturation), calc(var(--secondary-color-lightness)*0.8));

    ...
}

:root.dark {
    --body-filter: invert(95%) hue-rotate(180deg);
    --html-background: #0d0d0d;
    --media-filter: invert(100%) hue-rotate(180deg);
    --alert-filter: contrast(2);
    --checkbox-filter: invert(100%) hue-rotate(180deg);
    --toast-filter: invert(95%) hue-rotate(180deg) contrast(1.2);
    
    ...
    
    color-scheme: light dark;
}
```

All available registered themes are loaded using the PluginsRegistry and displayed in a combobox in "my settings" page.
The definition of the selected in the ‘my settings’ page and saved theme is loaded and applied by default when the 
workbench is opened. If no theme is selected and saved in the local storage, then the default-theme is applied.
All properties in the definition are mandatory. Definitions with missing properties are rejected, and an error will be
reported in the browser log. Theme plugins validation happens when definitions are loaded through the PluginRegistry by 
the "my settings" page controller. The themes selector menu is in a widget on that page and it lists all available
registered theme plugins for the user to select from. There are two prebuilt themes in the workbench. The 
`default-theme` is carefully crafted so that the colors used in the theme comply with the WCAG AAA color contrast 
standard. The second provided theme uses the Ontotext brand colors and does not comply with the WCAG color standard.

---

See also: [Developers Guide](../developers-guide.md)
