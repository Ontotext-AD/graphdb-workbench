# translate-label



<!-- Auto Generated Below -->


## Overview

The purpose of this component is to display translated literals in the DOM. A Stencil component re-renders when a prop or state changes,
but it may not re-render when the language changes. In such cases, this component should be used. It handles language change events
and re-translates the passed language and translation parameters.
Example of usage:
<code>
   <translate-label labelKey={item.labelKey} translationParameter={item.translationParameter}></translate-label>
   <translate-label labelKey="example.label></translate-label>
</code>

## Properties

| Property                | Attribute   | Description | Type                     | Default     |
| ----------------------- | ----------- | ----------- | ------------------------ | ----------- |
| `labelKey`              | `label-key` |             | `string`                 | `undefined` |
| `translationParameters` | --          |             | `TranslationParameter[]` | `[]`        |


## Dependencies

### Used by

 - [onto-navbar](../onto-navbar)

### Graph
```mermaid
graph TD;
  onto-navbar --> translate-label
  style translate-label fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
