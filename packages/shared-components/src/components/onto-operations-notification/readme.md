# onto-operations-notification



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute | Description                                                                    | Type                     | Default     |
| ------------------ | --------- | ------------------------------------------------------------------------------ | ------------------------ | ----------- |
| `activeOperations` | --        | The active operations summary. Holds general status and all current operations | `OperationStatusSummary` | `undefined` |


## Dependencies

### Used by

 - [onto-header](../onto-header)

### Depends on

- [translate-label](../translate-label)

### Graph
```mermaid
graph TD;
  onto-operations-notification --> translate-label
  onto-header --> onto-operations-notification
  style onto-operations-notification fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
