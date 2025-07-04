# Developers Guide

## Table of Contents
- [Context API](#stateful-context-services-and-context-api-implementation-in-graphdb-workbench)
- [Persistence API and Local Storage Implementation in GraphDB Workbench](#persistence-api-and-local-storage-implementation-in-graphdb-workbench)
- [Font awesome icons](#font-awesome-icons)
- [Extending the GraphDB Workbench](#extending-the-graphdb-workbench)
  - [Plugin system](#plugin-system)
    - [What is the plugin system and how a developer can use it?](#what-is-the-plugin-system-and-how-a-developer-can-use-it)
    - [How does the plugin system work?](#how-does-the-plugin-system-work-)
  - [Color themes](#color-themes)
- [Bundling](#bundling)
- [Extending Translation Capabilities with the Language Service](#extending-translation-capabilities-with-the-language-service)
  - [Overview](#overview)
  - [Key Benefits](#key-benefits)
  - [How It Works](#how-it-works)
  - [How to Add a New Language](#how-to-add-a-new-language)
- [CI](#ci) 
- [Release](#release)
- [Known Issues](#known-issues)

## Stateful Context services and Context API implementation in GraphDB Workbench

This guide introduces the `ContextService` API, a versatile abstraction for managing application context in the GraphDB 
Workbench application. Each view in the application is expected to implement a concrete version of the ContextService 
API, tailored to its specific requirements.

### Overview

The `ContextService` API facilitates state management by:

* Allowing context value updates.
* Notifying subscribers about context changes.
* Enforcing type safety with generic constraints.

The API is implemented as an abstract class, requiring developers to define specific fields and methods for their 
application's needs.

### Core Concepts

#### Abstract `ContextService`

The `ContextService` class is generic and requires a type parameter `TFields` that defines the fields the service can 
handle. Each field corresponds to a property of the service and is managed via the context map.

Key methods include:

`updateContextProperty`: Updates the value of a property.

`getContextPropertyValue`: Retrieves the current value of a property.

`subscribe`: Registers a callback to be notified of property value changes.

#### Utility Types

`SnakeToPascalCase`

Converts `SNAKE_CASE` field names to `PascalCase` for method naming.

`DeriveContextServiceContract`

Generates update methods for each field. For example, a field `SELECTED_REPOSITORY` generates an 
`updateSelectedRepository` method.

---

### Implementation Example: `RepositoryContextService`

The `RepositoryContextService` class manages repository-related application context for views in the GraphDB Workbench. 
It implements the abstract `ContextService` and provides methods for updating and subscribing to repository-related data.

#### Fields
```typescript
readonly SELECTED_REPOSITORY = 'selectedRepository';
readonly REPOSITORY_LIST = 'repositoryList';
```
These fields define the context properties managed by the service.

#### Methods

**Updating Context**

`updateSelectedRepository(repository: Repository | undefined): void`
Updates the selected repository.

`updateRepositoryList(repositories: RepositoryList): void`
Updates the list of repositories.

**Subscribing to Changes**

`onSelectedRepositoryChanged(callbackFunction: ValueChangeCallback<Repository | undefined>): () => void`
Subscribes to changes in the selected repository.

`onRepositoriesChanged(callbackFunction: ValueChangeCallback<RepositoryList | undefined>): () => void`
Subscribes to changes in the repository list.

---

### Step-by-Step Guide to Using `ContextService`

**1. Define Context Fields and Parameters**

Define the fields and their corresponding parameter types:

```typescript
type RepositoryContextFields = {
  readonly SELECTED_REPOSITORY: string;
  readonly REPOSITORY_LIST: string;
};

type RepositoryContextFieldParams = {
  readonly SELECTED_REPOSITORY: Repository;
  readonly REPOSITORY_LIST: RepositoryList;
};
```

**2. Extend ContextService**

Implement a concrete class that extends `ContextService`:

```typescript
export class RepositoryContextService extends ContextService<RepositoryContextFields> implements DeriveContextServiceContract<RepositoryContextFields, RepositoryContextFieldParams> {
  readonly SELECTED_REPOSITORY = 'selectedRepository';
  readonly REPOSITORY_LIST = 'repositoryList';

  updateSelectedRepository(repository: Repository | undefined): void {
    this.updateContextProperty(this.SELECTED_REPOSITORY, repository);
  }

  onSelectedRepositoryChanged(callbackFunction: ValueChangeCallback<Repository | undefined>): () => void {
    return this.subscribe(this.SELECTED_REPOSITORY, callbackFunction);
  }

  updateRepositoryList(repositories: RepositoryList): void {
    this.updateContextProperty(this.REPOSITORY_LIST, repositories);
  }

  onRepositoriesChanged(callbackFunction: ValueChangeCallback<RepositoryList | undefined>): () => void {
    return this.subscribe(this.REPOSITORY_LIST, callbackFunction);
  }
}
```

**3. Using the Service**

Import the Service using the `ServiceProvider` API:

> Warning: Everything in the api package must be imported using the alias `@ontotext/workbench-api` and not by relative 
> or absolute paths. The reason for this is that the api module is a separate package managed as a microservice which is
> loaded using import maps where the alias is defined.


```typescript
import { ServiceProvider, RepositoryContextService } from '@ontotext/workbench-api';
// Get the service instance
const repositoryContextService = ServiceProvider.get(RepositoryContextService);
```

Update Context Values:

```typescript

const repository: Repository = { id: 1, name: 'Repo1' };
repositoryContextService.updateSelectedRepository(repository);

const repositoryList: RepositoryList = [{ id: 1, name: 'Repo1' }, { id: 2, name: 'Repo2' }];
repositoryContextService.updateRepositoryList(repositoryList);
```

**4. Subscribe to Changes**

```typescript
const unsubscribeSelectedRepository = repositoryContextService.onSelectedRepositoryChanged((newRepository) => {
  console.log('Selected repository changed:', newRepository);
});

const unsubscribeRepositoryList = repositoryContextService.onRepositoriesChanged((newList) => {
  console.log('Repository list changed:', newList);
});

// To unsubscribe:
unsubscribeSelectedRepository();
unsubscribeRepositoryList();
```
---

### Summary

The `ContextService` API provides a simple yet powerful mechanism for managing context in GraphDB Workbench views. By
extending `ContextService`, developers can create view-specific services that streamline state management and improve 
code maintainability.


## Persistence API and Local Storage Implementation in GraphDB Workbench

This guide explains the `Persistence` API and its local storage implementation in the GraphDB Workbench application. It 
includes details about the key interfaces, abstract classes, and practical examples for implementing persistent storage
using local storage.

---

### Overview of the `Persistence` API

The `Persistence` API provides a generic interface for interacting with a storage system. It supports storing, 
retrieving, and removing data via a `Storage` interface-compatible implementation (e.g., localStorage or sessionStorage).

### Key Components

**`Persistence` Interface**

The `Persistence` interface defines the structure for storage-related services.

**Methods:**

`getStorage(): Storage` - Returns the underlying storage implementation.

`get(key: string): StorageData` - Retrieves the value associated with the provided key.

`set(key: string, value: string): void` - Stores the given value under the provided key.

`remove(key: string): void` - Deletes the value associated with the provided key.

---

### Local Storage Implementation

The `LocalStorageService` abstract class implements the `Persistence` interface using the localStorage API. This 
implementation serves as a base class for specialized storage services.

#### Key Features

**1. Namespace Support:**

* Each service defines a unique `NAMESPACE` to scope its keys.
* Keys are prefixed with a global namespace (`StorageKey.GLOBAL_NAMESPACE`) and the service-specific namespace.

**2. Storage Methods:**

`get(key: string): StorageData` - Fetches a value from `localStorage`.

`storeValue(key: string, value: string): void` - Saves a value to `localStorage`.

`remove(key: string): void` - Removes a value from `localStorage`.

**3. Key Management:**

* The `getPrefixedKey(key: string): string` method ensures that all keys are prefixed correctly for consistency and 
collision avoidance.

#### Implementation Example

```typescript
export class LanguageStorageService extends LocalStorageService {
  readonly NAMESPACE = 'i18n';

  set(key: string, value: string) {
    this.storeValue(key, value);
  }
}
```
In this example, `LanguageStorageService` manages language-related properties in the `localStorage`, scoped under the 
i18n namespace.

---

### Handling Storage Change Events

The `LocalStorageSubscriptionHandlerService` listens to storage change events and updates the application context 
accordingly. It works in conjunction with `ContextService` implementations to resolve and update the context properties.

#### Workflow

1. On a `StorageEvent`, the service parses the key to extract the namespace and property name.
2. It resolves the appropriate handler using the `resolveHandler(namespace, propertyName)` method.
3. If a handler exists, it invokes the handler to update the corresponding context property.

#### Key Method

```typescript
handleStorageChange(event: StorageEvent): void {
  const withoutGlobalPrefix = event.key?.substring(StorageKey.GLOBAL_NAMESPACE.length + 1);
  let namespace = '';
  let contextPropertyKey = '';

  if (withoutGlobalPrefix) {
    namespace = withoutGlobalPrefix.substring(0, withoutGlobalPrefix.indexOf('.'));
    contextPropertyKey = withoutGlobalPrefix.substring(namespace.length + 1);
  }

  const handler = this.resolveHandler(namespace, contextPropertyKey);
  if (handler) {
    handler.updateContextProperty(contextPropertyKey, event.newValue);
  }
}
```

---

### Practical Considerations

1. Prefixed Keys:
Always use prefixed keys to ensure isolation and avoid conflicts.
2. Service Specialization:
Extend `LocalStorageService` to define domain-specific storage services, specifying the `NAMESPACE` and implementing 
additional functionality if needed.
3. Error Handling:
Handle cases where a key or handler is missing with appropriate logging or fallback mechanisms.

---

### Summary

The `Persistence` API and its local storage implementation provide a robust framework for managing persistent data in
the GraphDB Workbench application. By adhering to the namespace conventions and leveraging the `LocalStorageService` as
a base class, developers can efficiently implement and maintain storage-related functionality.

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

## HTTP interceptors

### What it is
The system can intercept HTTP requests and responses done by the [HttpService](/packages/api/src/services/http/http.service.ts).
This allows us to perform certain actions upon requests, before they are sent, or after a response has been received.

### How does it work
There are two chains of interceptors. A request interceptor chain and a response interceptor chain.
Once a request is triggered it will first be processed by the request interceptor chain:
[InterceptorService#preProcess](/packages/api/src/services/interceptor/interceptor.service.ts)
The finished request object will then be used to form the actual HTTP Request to the backend in the HttpService
The resulting response will be processed by the response interceptor chain, before being finally returned to the caller.

Currently, there is no explicit mechanism for cancelling a request/response, but throwing an error, or rejecting
the promise will stop either chain.

### What can it be used for
An example can be made with the [AuthRequestInterceptor](/packages/api/src/interceptor/auth/auth-request-interceptor.ts),
which is used to add auth headers to each request, before it is sent to the backend

### Order of execution
Interceptors are executed based on their priority. Each interceptor has a `priority` property, which defaults to 0.
Higher priority indicates execution priority as well. The highest number will be executed first, lower numbers will be next.

### How to implement and register a new interceptor
1. Create a class, which extends the abstract [http-interceptor.ts](/packages/api/src/models/interceptor/http-interceptor.ts)
The generic type determines, what type of interceptor it will be.
Request interceptors should provide `HttpRequest` in the generic type, whereas response interceptors should provide `Response`

Example request interceptor:
```typescript
import {HttpInterceptor} from './http-interceptor';
import {HttpRequest} from './http-request';

class MyRequestInterceptor extends HttpInterceptor<HttpRequest> {
  shouldProcess(request: HttpRequest) {
    // implementation
  }
  
  process(request: HttpRequest) {
    // implementation
  }
}
```

Example response interceptor:
```typescript
import {HttpInterceptor} from './http-interceptor';

class MyResponseInterceptor extends HttpInterceptor<Response> {
  shouldProcess(response: Response) {
    // implementation
  }
  
  process(response: Response) {
    // implementation
  }
}
```

2. Register the interceptor
You can register the interceptor in two ways. The first is to add it to the relevant interceptor list,
which is in [interceptors.ts](/packages/api/src/interceptor/interceptors.ts)
Example:
```typescript
export const REQUEST_INTERCEPTORS = new ModelList<HttpInterceptor<HttpRequest>>([
  new MyRequestInterceptor()
]);

/**
 * An array of HTTP response interceptors to be used in the application.
 */
export const RESPONSE_INTERCEPTORS = new ModelList<HttpInterceptor<Response>> ([
  new MyResponseInterceptor()
]);
```
The second way is, by using the `registerRequestInterceptors` and/or `registerResponseInterceptors` in
[interceptor.service.ts](../packages/api/src/services/interceptor/interceptor.service.ts)

Example:

```typescript
import {ServiceProvider} from './service.provider';

const interceptorService = ServiceProvider.get(InterceptorService);
interceptorService.registerRequestInterceptors(new ModelList([new MyRequestInterceptor()]));
interceptorService.registerResponseInterceptors(new ModelList([new MyResponseInterceptor()]));
```

## Internationalization (i18n) Guide for the Application

### How It Works

The system ensures that translations from different modules are merged into a single bundle per language,
using the [merge-i18n-plugin.js](./webpack/merge-i18n-plugin.js). After they are merged, all `.json`
files from `src/assets/i18n` directories are transferred to the webpack output directory. That includes
[language-config.json](packages/root-config/src/assets/i18n/language-config.json), which contains the default language
and the available languages for the application. The configuration file is read, upon starting the application inside
[ontotext-root-config.js#getLanguageConfig](packages/root-config/src/ontotext-root-config.js). The default language
is loaded and the app starts listening for [ontotext-root-config.js#onLanguageChange](packages/root-config/src/ontotext-root-config.js)
events. Once a language changes, the respective bundle is loaded and emitted via [language-context.service.ts#updateLanguageBundle](packages/api/src/services/language/language-context.service.ts).
Modules listen for bundle changes from [language-context.service.ts#onLanguageBundleChanged](packages/api/src/services/language/language-context.service.ts)
and apply translation logic independently from each other.

### Translation File Structure

Every module in the application must follow the convention of placing translation files under the `src/assets/i18n` directory.
For example:
```code
packages/ 
  module1/
    src/assets/i18n/en.json 
    src/assets/i18n/fr.json 
  module2/ 
    src/assets/i18n/en.json 
    src/assets/i18n/fr.json
```

Translation files should be JSON objects where the keys are the translation identifiers, and the values are the translated strings.
For example:

`src/assets/i18n/en.json`:
```json
{
  "greeting": "Hello",
  "farewell": {
    "label": "Goodbye"
  }
}
```
src/assets/i18n/fr.json:

```json
{
  "greeting": "Bonjour",
  "farewell": {
    "label": "Au revoir"
  }
}
```

### Bundling Translations
The [merge-i18n-plugin.js](./webpack/merge-i18n-plugin.js) aggregates these translation files
across all modules and merges them into a single bundle for each language. For example:

`packages/module1/src/assets/i18n/en.json` and `packages/module2/src/assets/i18n/en.json` will be combined into a single en.json.
The output will look like this:
```code
dist/${outputDirectory}/en.json
```  

### Conflicts
The plugin resolves conflicts by throwing an error if multiple files define the same key for the same language.
For example:<br>
`module1/src/assets/i18n/en.json`
```json
{
  "some-prop": "Hello",
  "menu.logo.link.title": {
    "label": "Goodbye"
  }
}
```
`module2/src/assets/i18n/en.json`:

```json
{
  "another-prop": "Bonjour",
  "menu.logo.link.title": {
    "another-label": "Different Goodbye"
  }
}
```

Will result in an error, similar to this one:
```code
Processing file: en.json
Error: Conflict detected for key 'menu.logo.link.title' in language 'en' in file: packages/workbench/src/assets/i18n/en.json
```

### Key Features:
`Automatic Directory Traversal`: Scans all modules for src/assets/i18n folders.<br>
`Conflict Detection`: Throws an error if there are duplicate keys in the same language.<br>
`JSON Merging`: Combines all translations into one file per language.<br>
`Asset Emission`: Writes the merged bundles to the specified output directory in the Webpack dist folder.<br>

### Plugin Options
`startDirectory`: The base directory where the plugin begins searching for modules.<br>
`outputDirectory`: The directory inside the Webpack output folder where the merged translation bundles will be written.<br>

### Example Usage in Webpack Config
```javascript
const { MergeI18nPlugin } = require('./plugins/MergeI18nPlugin');

module.exports = {
  // Other Webpack configurations...
  plugins: [
    new MergeI18nPlugin({
      startDirectory: 'packages',
      outputDirectory: 'assets/i18n',
    }),
  ],
};
```

### How to Add new Translations
1. Add your language in the `availableLanguages` array in [language-config.json](packages/root-config/src/assets/i18n/language-config.json).
2. Add translation files for the new language in every `src/assets/i18n` folder, where there are translations.
   The `key` in `availableLanguages`, should be the name of the new file translation, e.g. `${key}.json`.
   Avoid conflicting keys in your new bundle, as it will cause an error.
3. Build the application
4. Check merged output: After building the application, check the `${webpack.outputFolder}/${mergeI18nPlugin.outputDirectory}`
   (currently `dist/assets/i18n`) folder to verify that all translations are included and correctly merged.
5. Listen for bundle changes in the new module, using [language-context.service.ts#onLanguageBundleChanged](packages/api/src/services/language/language-context.service.ts)
6. Use the new bundle for module translation (may be different, depending on the module).

### Translation Validation
To validate translations locally:

```bash
npm run validate
```

If the project structure differs or the script is placed elsewhere, provide the project root manually:

```bash
SCRIPT_ROOT=/absolute/path/to/repo-root npm run validate
```

The script will generate a file:

```
translation-report.json
```

If issues are found, the script will exit with code `1`.

---
### Running in Translation Vaidation CI
On Jenkins, the script runs automatically in the `Validate` stage.

If issues are found:
- The pipeline will fail
- The full validation report will be saved as a build artifact

Look for this file under **"Build Artifacts"**:
```
translation-report.json
```


# CI

## Jenkins Pipeline Documentation

The `graphdb-workbench` project uses a Jenkins pipeline to automate installation, testing, building, validation, and SonarQube analysis.

### Overview

The pipeline is configured to execute the following steps:
- Install dependencies
- Build the project
- Run linting, validating and tests
- Perform SonarQube analysis
- Execute Cypress tests for shared components and the Workbench

---

### Important

If new static folders are created in the `dist` folder to be published (or old ones are renamed), they must be added to the BE Spring Security configuration. Failure to do so will prevent the server from serving these resources, causing the Workbench to malfunction.

---

### Pipeline Details

#### Tools and Environment
- **Node.js**: `18.9.0` (configured tool), uses `node:20-alpine` image in most stages
- **SonarQube**: Configured via `SONAR_ENVIRONMENT=SonarCloud`
- **Docker Compose**: Used to run Cypress tests
- **Cloud agent**: All stages run on `aws-large` nodes

#### Stages

1. **Install**
  - Uses Docker to run `npm run install:ci`

2. **Build**
  - Runs `npm run build` in the same Dockerized environment

3. **Lint**
  - Runs `npm run lint`

4. **Validate**
  - Executes translation validation via `npm run validate`
  - Archives `translation-report.json` regardless of outcome

5. **Sonar**
  - Conditional analysis depending on branch:
    - For `master`: regular scan
    - For PRs: branch/target/ID passed as args

6. **Test**
  - Executes unit/integration tests via `npm run test`

7. **Shared-components Cypress Test**
  - Runs in `packages/shared-components`
  - Uses Docker Compose (`docker-compose.yaml`)
  - Archives Cypress screenshots and videos
  - Cleans up containers, volumes, and images post-run

8. **Workbench Cypress Test**
  - Skipped on `master` branch
  - Pulls a license file using Keeper Secrets Manager (KSM)
  - Copies license into `e2e-tests/fixtures`
  - Runs Workbench E2E Cypress tests via `docker-compose-test.yaml`
  - Cleans up Docker artifacts after run

---

### Post Actions

- **Always**: Executes a workspace cleanup script managed by `configFileProvider`
- **On Failure**: Sends email notification to the triggering user


### Notes

- Test runners use the current user’s UID/GID for correct permissions
- KSM is used securely for pulling sensitive files like licenses

---

# Release

## Jenkins Release Pipeline Documentation

This Jenkins pipeline facilitates the release process for the `graphdb-workbench` project. It automates versioning, building, and publishing to npm, ensuring a smooth release workflow.

---

### Key Features

- Cloud-based execution using `aws-small` agents
- Publishes both the main project and Cypress E2E tests to npm
- Uses Keeper Secrets Manager (KSM) for secure credentials
- Slack integration for release notifications (optional)
- Git tagging and pushing included
- Automatically cleans up after both success and failure

---

### Tools and Environment

- **Node.js**: Runs using Docker image `node:20-bullseye`
- **Keeper Secrets Manager (KSM)**: Used for npm and Git credentials
- **Git**: Auto-tags the release and pushes changes to GitHub

---

### Pipeline Parameters Details

- `GIT_BRANCH`: Git branch to release from (default: `master`)
- `RELEASE_VERSION`: Required version to release
- `NOTIFY_SLACK`: Whether to send a Slack notification
- `SLACK_CHANNEL`: Slack channel to notify (if enabled)

---

### Pipeline Stages

#### 1. **Prepare & Publish**
- Checks out the selected Git branch
- Runs:
  ```bash
  npm run install:ci
  npm run build
  ```
- Runs the same preparation in `e2e-tests/`
- Uses KSM to set up the `.npmrc` auth token
- Publishes both main and E2E packages to npm
- Logs current npm user with `npm whoami`

---

### Post Actions

#### On Success:
- Commits and tags the release:
  ```bash
  git commit -a -m 'Release ${RELEASE_VERSION}'
  git tag -a v${RELEASE_VERSION} -m 'Release v${RELEASE_VERSION}'
  ```
- Uses KSM for Git credentials and pushes changes + tags
- Optionally sends Slack notification if enabled

#### On Failure:
- Sends an email to the build user
- Restores `.npmrc` and removes any local tokens

---

### Notes

- Builds have a timeout of 15 minutes and cannot run concurrently
- `.npmrc` is mounted into the container and cleaned afterward
- Slack integration is optional and safely wrapped with fallback

---

# Known Issues

## Silent Basic Auth Header Injection by Chrome

If you've ever filled in a **browser-native Basic Auth popup** in Chrome for the workbench login, **Chrome will silently remember and auto-send** those credentials in every subsequent request to that domain — *even across sessions and after logout*.

### Symptom:
You will see an `Authorization` header automatically added to requests like:

```
Authorization: Basic <base64-encoded-user:password>
```

This can be confirmed in the **Network** tab of DevTools, particularly in requests like:

```
GET /rest/security/authenticated-user
```

### Why it's a problem:
- It bypasses token-based authentication (e.g. JWT, OpenID).
- It breaks logout and user switching — Chrome keeps sending old credentials.
- It leads to inconsistent security state and misleading login behavior.

### How to fix it (Chrome):

To remove the cached Basic Auth credentials:

1. Open :
   ```
   chrome://settings/clearBrowserData
   ```
   and clear:
  - **Cookies and other site data**
  - **Cached images and files**

Note: Simply logging out will **not** remove Basic Auth credentials remembered by Chrome — **they are not managed by the code**.
