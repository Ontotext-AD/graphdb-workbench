# onto-header



<!-- Auto Generated Below -->


## Overview

OntoHeader component for rendering the header of the application.
This component includes a search component, license alert (if applicable),
repository selector, and language selector.

## Dependencies

### Used by

 - [onto-layout](../onto-layout)

### Depends on

- [onto-search-icon](../onto-search-icon)
- [onto-rdf-search](../onto-rdf-search)
- [onto-operations-notification](../onto-operations-notification)
- [onto-license-alert](../onto-license-alert)
- [onto-repository-selector](../onto-repository-selector)
- [onto-user-menu](../onto-user-menu)
- [onto-user-login](../onto-user-login)
- [onto-language-selector](../onto-language-selector)

### Graph
```mermaid
graph TD;
  onto-header --> onto-search-icon
  onto-header --> onto-rdf-search
  onto-header --> onto-operations-notification
  onto-header --> onto-license-alert
  onto-header --> onto-repository-selector
  onto-header --> onto-user-menu
  onto-header --> onto-user-login
  onto-header --> onto-language-selector
  onto-rdf-search --> onto-search-resource-input
  onto-rdf-search --> onto-search-icon
  onto-operations-notification --> translate-label
  onto-license-alert --> translate-label
  onto-repository-selector --> onto-dropdown
  onto-user-menu --> translate-label
  onto-user-login --> translate-label
  onto-language-selector --> onto-dropdown
  onto-layout --> onto-header
  style onto-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
