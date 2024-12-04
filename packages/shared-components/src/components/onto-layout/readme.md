# onto-layout



<!-- Auto Generated Below -->


## Dependencies

### Depends on

- [onto-header](../onto-header)
- [onto-navbar](../onto-navbar)
- [onto-footer](../onto-footer)
- [onto-tooltip](../onto-tooltip)

### Graph
```mermaid
graph TD;
  onto-layout --> onto-header
  onto-layout --> onto-navbar
  onto-layout --> onto-footer
  onto-layout --> onto-tooltip
  onto-header --> onto-repository-selector
  onto-header --> onto-language-selector
  onto-repository-selector --> onto-dropdown
  onto-language-selector --> onto-dropdown
  onto-navbar --> translate-label
  style onto-layout fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
