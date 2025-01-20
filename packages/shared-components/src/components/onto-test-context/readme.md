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

### `loadRepositories() => Promise<void>`

Loads the repositories in the application.

#### Returns

Type: `Promise<void>`



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


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
