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

- [onto-operations-notification](../onto-operations-notification)
- [onto-license-alert](../onto-license-alert)
- [onto-repository-selector](../onto-repository-selector)
- [onto-language-selector](../onto-language-selector)

### Graph
```mermaid
graph TD;
  onto-header --> onto-operations-notification
  onto-header --> onto-license-alert
  onto-header --> onto-repository-selector
  onto-header --> onto-language-selector
  onto-operations-notification --> translate-label
  onto-license-alert --> translate-label
  onto-repository-selector --> onto-dropdown
  onto-language-selector --> onto-dropdown
  onto-layout --> onto-header
  style onto-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
