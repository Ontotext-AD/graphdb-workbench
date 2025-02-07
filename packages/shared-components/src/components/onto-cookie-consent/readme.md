# onto-cookie-consent



<!-- Auto Generated Below -->


## Overview

OntoCookieConsent component for handling cookie consent functionality.
This component displays a cookie consent modal and manages the visibility of a cookie policy dialog.

## Events

| Event          | Description                             | Type                |
| -------------- | --------------------------------------- | ------------------- |
| `consentGiven` | Event emitter for when consent is given | `CustomEvent<void>` |


## Dependencies

### Used by

 - [onto-footer](../onto-footer)

### Depends on

- [translate-label](../translate-label)
- [onto-cookie-policy-dialog](../dialogs/onto-cookie-policy-dialog)

### Graph
```mermaid
graph TD;
  onto-cookie-consent --> translate-label
  onto-cookie-consent --> onto-cookie-policy-dialog
  onto-cookie-policy-dialog --> onto-dialog
  onto-cookie-policy-dialog --> translate-label
  onto-cookie-policy-dialog --> onto-toggle-switch
  onto-dialog --> translate-label
  onto-toggle-switch --> translate-label
  onto-footer --> onto-cookie-consent
  style onto-cookie-consent fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
