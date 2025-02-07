# onto-footer



<!-- Auto Generated Below -->


## Overview

OntoFooter component for rendering the footer of the application.
This component displays information about GraphDB, RDF4J, Connectors, and Workbench versions,
as well as copyright information.

## Dependencies

### Used by

 - [onto-layout](../onto-layout)

### Depends on

- [translate-label](../translate-label)
- [onto-cookie-consent](../onto-cookie-consent)

### Graph
```mermaid
graph TD;
  onto-footer --> translate-label
  onto-footer --> onto-cookie-consent
  onto-cookie-consent --> translate-label
  onto-cookie-consent --> onto-cookie-policy-dialog
  onto-cookie-policy-dialog --> onto-dialog
  onto-cookie-policy-dialog --> translate-label
  onto-cookie-policy-dialog --> onto-toggle-switch
  onto-dialog --> translate-label
  onto-toggle-switch --> translate-label
  onto-layout --> onto-footer
  style onto-footer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
