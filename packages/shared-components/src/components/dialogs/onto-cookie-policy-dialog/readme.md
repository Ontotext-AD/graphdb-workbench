# onto-cookie-dialog



<!-- Auto Generated Below -->


## Events

| Event         | Description                                                                               | Type                |
| ------------- | ----------------------------------------------------------------------------------------- | ------------------- |
| `closeDialog` | Event emitted when the dialog is closed, allowing parent components to react accordingly. | `CustomEvent<void>` |


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
