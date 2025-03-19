# onto-layout



<!-- Auto Generated Below -->


## Dependencies

### Depends on

- [onto-header](../onto-header)
- [onto-navbar](../onto-navbar)
- [onto-permission-banner](../onto-permission-banner)
- [onto-footer](../onto-footer)
- [onto-tooltip](../onto-tooltip)
- [onto-toastr](../onto-toastr)

### Graph
```mermaid
graph TD;
  onto-layout --> onto-header
  onto-layout --> onto-navbar
  onto-layout --> onto-permission-banner
  onto-layout --> onto-footer
  onto-layout --> onto-tooltip
  onto-layout --> onto-toastr
  onto-header --> onto-operations-notification
  onto-header --> onto-license-alert
  onto-header --> onto-repository-selector
  onto-header --> onto-language-selector
  onto-operations-notification --> translate-label
  onto-license-alert --> translate-label
  onto-repository-selector --> onto-dropdown
  onto-language-selector --> onto-dropdown
  onto-navbar --> translate-label
  onto-permission-banner --> translate-label
  onto-footer --> translate-label
  onto-footer --> onto-cookie-consent
  onto-cookie-consent --> translate-label
  onto-cookie-consent --> onto-cookie-policy-dialog
  onto-cookie-policy-dialog --> onto-dialog
  onto-cookie-policy-dialog --> translate-label
  onto-cookie-policy-dialog --> onto-toggle-switch
  onto-dialog --> translate-label
  onto-toggle-switch --> translate-label
  style onto-layout fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
