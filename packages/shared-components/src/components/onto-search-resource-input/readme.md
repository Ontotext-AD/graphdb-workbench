# onto-search-resource-input



<!-- Auto Generated Below -->


## Overview

A component for rendering RDF search resource input with configurable buttons.
This component provides a text input for search queries and a set of configurable buttons.

## Properties

| Property         | Attribute         | Description                                                                                                                                                                                                                                                 | Type                 | Default     |
| ---------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| `buttonConfig`   | --                | Button configuration for the search resource input. Holds buttons to be displayed, as well as additional configuration, such as whether the buttons should be treated as radio buttons.                                                                     | `SearchButtonConfig` | `undefined` |
| `context`        | `context`         | The search resource component can appear more than once per page. This context is used to differentiate them. When a suggestion is selected different parents may need to do different things. The context is emitted alongside the suggestion upon select. | `string`             | `undefined` |
| `skipValidation` | `skip-validation` | Whether the rdf resource pre-search validation should be skipped.                                                                                                                                                                                           | `boolean`            | `false`     |


## Dependencies

### Used by

 - [onto-rdf-search](../onto-rdf-search)

### Graph
```mermaid
graph TD;
  onto-rdf-search --> onto-search-resource-input
  style onto-search-resource-input fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
