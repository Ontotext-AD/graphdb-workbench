# onto-cookie-dialog



<!-- Auto Generated Below -->


## Properties

| Property                     | Attribute        | Description                                            | Type            | Default     |
| ---------------------------- | ---------------- | ------------------------------------------------------ | --------------- | ----------- |
| `dialogHandler` _(required)_ | `dialog-handler` | The dialog handler for managing the dialog's behavior. | `DialogHandler` | `undefined` |


## Dependencies

### Used by

 - [onto-cookie-consent](../../onto-cookie-consent)

### Depends on

- [onto-dialog](..)
- [translate-label](../../translate-label)
- [onto-toggle-switch](../../onto-toggle-switch)

### Graph
```mermaid
graph TD;
  onto-cookie-policy-dialog --> onto-dialog
  onto-cookie-policy-dialog --> translate-label
  onto-cookie-policy-dialog --> onto-toggle-switch
  onto-dialog --> translate-label
  onto-toggle-switch --> translate-label
  onto-cookie-consent --> onto-cookie-policy-dialog
  style onto-cookie-policy-dialog fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
