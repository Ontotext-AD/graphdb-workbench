# Developers Guide

## Font awesome icons

The font kit used in the project is our own and is a custom PRO set. Below are the steps for manually updating and managing the fontawesome iconset:

---

### Updating the Font Kit
If there is an update to the custom PRO font kit:

1. Log in to [fontawesome.com](https://fontawesome.com) using our organization account.
2. Navigate to the custom kit in our profile and download the latest version.
3. Extract the downloaded files.
4. Replace the relevant files in the following directory of the project:
```angular2html
src/js/lib/awesome_me/css
```
Make sure you copy all necessary CSS, fonts, and any other related files.

5. Commit the updated files to the repository.

---

### Customizations
If any icons or configurations within the PRO set are changed:

1. Update the custom kit on [fontawesome.com](https://fontawesome.com).
2. Download the updated kit.
3. Follow the steps above to manually replace the files in:
```angular2html
src/js/lib/awesome_me/css
```
4. Test the changes locally to ensure the updated icons are working correctly.

---

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

# Extending Translation Capabilities with the Language Service

## Overview

The introduction of `$languageServiceProvider` allows for flexible, dynamic language support within the GraphDB Workbench. This enhancement enables administrators to add or configure new languages directly through the configuration file (`languages.json`), eliminating the need for code changes or redeployment.

## Key Benefits

1. **Development-Free Translation Management**:
    - Administrators can now manage supported languages by simply updating `languages.json`.
    - This configuration-based approach makes it easy to introduce or remove languages without modifying the application code.

2. **Dynamic Language Settings**:
    - The workbench adapts automatically to the languages defined in `languages.json`, allowing administrators to plug in translations as needed.
    - Language fallbacks and defaults are handled seamlessly, improving the application’s accessibility and usability.

## How It Works

- **Configuration File**: The `languages.json` file, located in the `src/i18n` directory, defines the `defaultLanguage` and `availableLanguages`.
    - Example of `languages.json`:
      ```json
      {
          "defaultLanguage": "en",
          "availableLanguages": [
              { "key": "en", "name": "English" },
              { "key": "fr", "name": "Français" }
          ]
      }
      ```
- **Provider Integration**: `$languageServiceProvider` reads this configuration during the application initialization and exposes methods for retrieving the default language and available languages.
- **Application-Wide Language Access**: Components across the application can access language settings via `$languageService`, ensuring consistency in language display and fallback behavior.

## How to Add a New Language

1. **Edit `languages.json`**: Add a new language entry in the `availableLanguages` array with the desired language `key` and `name`.
   ```json
   {
       "defaultLanguage": "en",
       "availableLanguages": [
           { "key": "en", "name": "English" },
           { "key": "fr", "name": "Français" },
           { "key": "es", "name": "Español" }
       ]
   }
   
2. **Ensure Translations Are Available** Make sure a translation file (e.g., `es.json`) exists for the new language, following the naming convention used for other languages.

3. **Reload the Application** The workbench will recognize the new language without requiring additional code changes or redeployment.


## E2E Testing with Cypress

### Testcontainers Integration 

### How it works

- **Management of Docker Containers:**  
  Uses the `testcontainers` library to dynamically start and stop Docker containers for GraphDB and Workbench during test execution.

- **Dynamic Port Allocation:**  
  Uses the `get-port` package to assign a free port to each Cypress instance, which is then used as the `baseUrl` for tests.

- **Custom Cypress Tasks and Hooks:**  
  Implements custom tasks (e.g., `startGraphDb`, `startWorkbench`, `stopGraphDb`, `stopWorkbench`) to orchestrate container lifecycle and uses hooks (`before`, `after`, `after:run`) to ensure proper setup and cleanup.

- **Additional:**
    - Uses parallel test execution (using `cypress-parallel`).
---

### Details:

#### 1. File: `test-cypress/support/index.js`

#### Hooks and Tasks:
- **`Cypress.on('test:before:run')`:**
    - **Purpose:** Before each test run, this hook updates the Cypress configuration’s `baseUrl` with the value stored in the environment variable `base`. If the value is same, it does nothing.
    - **Outcome:** Ensures every test uses the correct URL endpoint (which is dynamically set).

- **`before()` Hook:**
    - **Purpose:** Runs once before all tests in a spec.
    - **Actions:**
        - Calls `cy.task('startGraphDb')` to launch a GraphDB container.
            - A high timeout (300000 ms) is set to allow sufficient startup time.
        - Uses the returned GraphDB port to call `cy.task('startWorkbench')`, thereby starting a Workbench container with the GraphDB URL passed as a build argument.
    - **Outcome:** Both testcontainers (GraphDB and Workbench) are running before any tests in the spec begin.

- **`after()` Hook:**
    - **Purpose:** Runs once after all tests in a spec have completed.
    - **Actions:**
        - Calls `cy.task('stopWorkbench')` and `cy.task('stopGraphDb')` to stop the respective containers.
        - Uses container IDs stored in Cypress environment variables.
    - **Outcome:** Cleans up Docker resources to prevent resource leaks.

---

#### 2. File: `test-cypress/plugins/index.js`

#### Docker Container Management with Testcontainers:
- **Imports and Setup:**
    - Imports `GenericContainer` and `Network` from the `testcontainers` library, and Node’s `path` module.
    - Creates Maps (`graphDbContainers` and `workbenchContainers`) to keep track of running containers.
    - Declares variables (`currentGraphDbContainer`, `currentWorkbenchContainer`, `network`) for holding container and network references.

- **Custom Tasks:**
    - **`startGraphDb`:**
        - Checks if a GraphDB container is already running; if so, returns its connection details. This is done because when Cypress updates the `baseUrl` it reloads the browser. In this way we reuse existing containers.
        - If not, starts a new Docker network (if needed) and launches a GraphDB container with:
            - Specified environment variables (e.g., for import directory and logging configuration).
            - An exposed port (7200) and a bind mount for importing data.
            - A network alias ("graphdb").
        - Stores container information and sets `graphdbContainerId` in Cypress’s environment.
        - Returns the host, first mapped port, and container ID.

    - **`stopGraphDb`:**
        - Stops and removes the GraphDB container using its container ID from the Map.

    - **`startWorkbench`:**
        - Checks if a Workbench container is already running; if so, returns its connection details.
        - Otherwise, builds a Workbench Docker image from a Dockerfile, passing the GraphDB URL (with the port) as a build argument.
        - Starts the Workbench container with:
            - Exposed ports (using a free port provided by the Cypress configuration).
            - Network alias ("workbench").
            - Attachment to the same Docker network.
        - Stores container information and sets `workbenchContainerId` in Cypress’s environment.
        - Returns the host, first mapped port, and container ID.

    - **`stopWorkbench`:**
        - Stops and removes the Workbench container using its container ID.

- **Additional Hooks:**
    - **`after:run` Hook:**
        - Stops the Docker network if it was created, ensuring all resources are properly released after test execution.
---

### 3. File: `test-cypress/cypress.config.js`

- **free port:**
    - Uses the `get-port` package to obtain a free port at startup.

- **Dynamic Base URL Setup:**
    - The obtained free port is stored in a variable (`freePort`) and then:
        - Set in Cypress’s environment (as `env.freePort` and `env.base`).
        - Used to update the `baseUrl` in the `test:before:run` hook.
    - Logs the assigned `baseUrl`.

- **Outcome:**  
  Each Cypress instance runs on its own unique port, reducing the risk of port conflicts during parallel execution.
---
