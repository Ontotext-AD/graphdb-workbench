# onto-test-context



<!-- Auto Generated Below -->


## Overview

A component for managing test context in the application. Used only for testing

## Methods

### `changeLanguage(language: string) => Promise<void>`

Changes the application's language by updating the language bundle.

This method uses the LanguageContextService to update the language bundle
based on the provided language code. It retrieves the corresponding bundle
from the predefined bundles object and updates the context.

#### Parameters

| Name       | Type     | Description                                                                                                     |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `language` | `string` | - The language code (e.g., 'en' for English, 'fr' for French)   representing the desired language to switch to. |

#### Returns

Type: `Promise<void>`

A Promise that resolves when the language update is complete.

### `emitNavigateEndEvent(oldUrl: string, newUrl: string) => Promise<void>`

Emits {@see NavigationEnd} event with <code>oldUrl</code> and <code>newUrl</code>.

#### Parameters

| Name     | Type     | Description                                               |
| -------- | -------- | --------------------------------------------------------- |
| `oldUrl` | `string` | - the value will be used as old url in the event payload. |
| `newUrl` | `string` | - the value will be used as new url in the event payload. |

#### Returns

Type: `Promise<void>`



### `loadRepositories() => Promise<void>`

Loads the repositories in the application.

#### Returns

Type: `Promise<void>`



### `setAuthenticatedUser(user: AuthenticatedUser) => Promise<void>`

Sets the authenticated user in the application context.

#### Parameters

| Name   | Type                | Description                                                                      |
| ------ | ------------------- | -------------------------------------------------------------------------------- |
| `user` | `AuthenticatedUser` | - The AuthenticatedUser object containing the user's authentication information. |

#### Returns

Type: `Promise<void>`

A Promise that resolves when the authenticated user has been successfully updated

### `setSecurityConfig(securityConfig: SecurityConfig) => Promise<void>`

Sets the security configuration in the application context.

#### Parameters

| Name             | Type             | Description                                                                     |
| ---------------- | ---------------- | ------------------------------------------------------------------------------- |
| `securityConfig` | `SecurityConfig` | - The SecurityConfig object containing the new security settings to be applied. |

#### Returns

Type: `Promise<void>`

A Promise that resolves when the security configuration has been successfully updated.

### `updateLicense(license: License) => Promise<void>`

Updates the license information in the context.

This method uses the LicenseContextService to update the license
and returns a resolved Promise once the operation is complete.

#### Parameters

| Name      | Type      | Description                         |
| --------- | --------- | ----------------------------------- |
| `license` | `License` | - The new License object to be set. |

#### Returns

Type: `Promise<void>`

A Promise that resolves when the license update is complete.

### `updateProductInfo(productInfo: ProductInfo) => Promise<void>`

Updates the product information in the context.

This method uses the ProductInfoContextService to update the product information
and returns a resolved Promise once the operation is complete.

#### Parameters

| Name          | Type          | Description                             |
| ------------- | ------------- | --------------------------------------- |
| `productInfo` | `ProductInfo` | - The new ProductInfo object to be set. |

#### Returns

Type: `Promise<void>`

A Promise that resolves when the product information update is complete.

### `updateRestrictedPage(restrictedPages: Record<string, boolean>) => Promise<void>`

Updates the {@see SecurityContextService} map with <code>restrictedPages</code>.

#### Parameters

| Name              | Type                        | Description                                                                |
| ----------------- | --------------------------- | -------------------------------------------------------------------------- |
| `restrictedPages` | `{ [x: string]: boolean; }` | - the map with restricted pages to be set in context service as new value. |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
