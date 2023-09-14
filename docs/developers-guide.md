# Developers Guide



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
    'helpInfo': 'The Autocomplete index is used for automatic ...'
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
    'helpInfo': 'The Autocomplete index is used for automatic completion of URIs in the SPARQL editor and the View resource page. Use this view to enable or disable the index and check its status.'
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
    'grey-rgb': '151, 153, 156',
    'grey-color': '#97999C',
    // Colors for the toastr notifications in any of their four states.
    'color-danger-dark': '#a41424',
    'color-success-dark': '#005934',
    'color-warning-dark': '#734721',
    'color-info-dark': '#115590'
});
```

All available registered themes are loaded using the PluginsRegistry and displayed in a combobox in the my settings page.
The definition of the selected in the ‘my settings’ page and saved theme is loaded and applied by default when the 
workbench is opened. If no theme is selected and saved in the local storage, then the default-theme is applied.
All properties in the definition are mandatory. Definitions with missing properties are rejected, and an error will be
reported in the browser log. Theme plugins validation happens when definitions are loaded through the PluginRegistry by 
the "my settings" page controller. The themes selector menu is in a widget on that page and it lists all available
registered theme plugins for the user to select from. There are two prebuilt themes in the workbench. The 
`default-theme` is carefully crafted so that the colors used in the theme comply with the WCAG AAA color contrast 
standard. The second provided theme uses the Ontotext brand colors and does not comply with the WCAG color standard.


## Bundling

The workbench application consists of many resources: script files, stylesheets, images, fonts. In
a non optimized build this would lead to hundreds of http requests. Nowadays web applications are
usually optimized by bundling their resources and minifying them. The reason for this is to have 
significantly fewer http requests which leads to faster initial load and less traffic. 

Bundling of the workbench is done with webpack. It's configured with three config files:
* webpack.config.common.js
* webpack.config.dev.js
* webpack.config.prod.js

The common config contains shared configuration for the other two. 

There are two ways the application to be built. First is for production and the other is for dev. 
See the _Build_ and _Dev server_ sections above.

The code for production is build in in the `/dest` folder. The bundling covers the following
tasks:
* Processing the template.html and generating an index.html file. The file is also compressed and 
optimized. During the process, in the file are injected:
    * the favicon link pointing to the automatically copied icon image 
    * the bundled and compressed stylesheets
    
* Application code is bundled given it's entry point is the `/app.js` and is emitted in `/dest` in a 
bundle file named `bundle.[hash].js`. The hash is generated and applied in order to allow cache 
busting. Every change in the application code forces new hash to be generated thus forcing browsers 
to request the new bundle version. If the application code contains dynamic imports, webpack emits 
new bundle. This is the case for the `clustermanagement` module which is only imported if the 
workbench is loaded in enterprise mode.
* Vendor code is imported in a `vendor.[hash].js` and is bundled by the webpack. Here goes third 
party libraries like jquery, angularjs and third party libraries stylesheets.
* Some workbench application source files are imported in a separated file `main.js` which is 
bundled by the webpack and emitted as `main.[hash].js`. This is needed because importing them in the 
`app.js` breaks the bundle.
* Bundle files are injected during build time in the `index.html` at the end of the body tag.
* Th less stylesheets are processed with the `less-loader`, converted to javascript in the bundles
with `css-loader` and finally injected at the end of the head tag in `index.html`. Not injecting 
them during the build time would lead to unwanted showing the un-styled application until webpack 
injects them runtime.
* Many libraries such as `bootstrap` and `angular` depend on `jquery` to be loaded and present 
globally. That's why it is mandatory `jquery` to be properly pre-loaded and exposed in the global 
scope. This is done using the `expose-loader`. It ensures that when requested, it will be available 
for the libraries.
* Many resources like view and angular directive templates are directly copied in the `/dist` 
folder. Resources referenced from within those templates are also directly copied to allow proper
loading. The copying is done using the `CopyPlugin`.  
    * **An optimization would be to have separate bundle for every view. Then the main app bundle 
    would be much tinier thus even faster initial loading.**
    * **Another optimization is to have those templates emitted with a hash code in their names in
    order to prevent incorrect caching from browsers.**
    
* During the `template.html` processing, referenced images are automatically copied in the `/dist`
folder. The `file-loader` is used for the purpose.
* Resources referenced from stylesheets like images and fonts are copied in `/dist` folder using the
`url-loader`.
* The `/dist` directory is cleaned up before every build to prevent accumulating bundle files with
different hashes in their names.
