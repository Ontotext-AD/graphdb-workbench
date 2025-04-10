# onto-dialog



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                          | Type                                                                            | Default     |
| -------- | --------- | ------------------------------------ | ------------------------------------------------------------------------------- | ----------- |
| `config` | `config`  | Configuration object for the dialog. | `{ dialogTitle: string; onClose: (evt: KeyboardEvent \| MouseEvent) => void; }` | `undefined` |


## Dependencies

### Used by

 - [onto-cookie-policy-dialog](onto-cookie-policy-dialog)

### Depends on

- [translate-label](../translate-label)

### Graph
```mermaid
graph TD;
  onto-dialog --> translate-label
  onto-cookie-policy-dialog --> onto-dialog
  style onto-dialog fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
