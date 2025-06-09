# onto-dropdown



<!-- Auto Generated Below -->


## Overview

A reusable dropdown component built using StencilJS. This component supports configurable labels, tooltips, icons,
and items, making it versatile for various use cases. It also integrates with a translation service to handle
internationalization.

## Properties

| Property                        | Attribute                           | Description                                                                                                                                                                                                                                                             | Type                                                                                                                                                                                             | Default                      |
| ------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `autoClose`                     | `auto-close`                        | Flag to determine if the dropdown should close automatically when a click occurs outside the dropdown.                                                                                                                                                                  | `boolean`                                                                                                                                                                                        | `true`                       |
| `dropdownAlignment`             | `dropdown-alignment`                | Specifies the dropdown items' alignment. If not provided, the items and the dropdown button will be aligned to the left.                                                                                                                                                | `DropdownItemAlignment.LEFT \| DropdownItemAlignment.RIGHT`                                                                                                                                      | `DropdownItemAlignment.LEFT` |
| `dropdownButtonGuideSelector`   | `dropdown-button-guide-selector`    | Defines the value of the `guide-selector` attribute for the dropdown trigger button.                                                                                                                                                                                    | `string`                                                                                                                                                                                         | `undefined`                  |
| `dropdownButtonName`            | `dropdown-button-name`              | The name for the dropdown button. This can either be a string (used directly as the button label) or a Stencil component (used to render the button content). It will be used if present; otherwise, the {@link OntoDropdown#dropdownButtonNameLabelKey } will be used. | `string`                                                                                                                                                                                         | `undefined`                  |
| `dropdownButtonNameLabelKey`    | `dropdown-button-name-label-key`    | The translation label key for the dropdown button name. It will be used if {@link OntoDropdown#dropdownButtonName } is not present.                                                                                                                                     | `string`                                                                                                                                                                                         | `undefined`                  |
| `dropdownButtonTooltip`         | `dropdown-button-tooltip`           | The dropdown button tooltip. It will be used if present; otherwise, the {@link OntoDropdown#dropdownButtonTooltipLabelKey } will be used.                                                                                                                               | `(() => Promise<string>) \| string`                                                                                                                                                              | `undefined`                  |
| `dropdownButtonTooltipLabelKey` | `dropdown-button-tooltip-label-key` | The translation label key for the dropdown button tooltip. It will be used if {@link OntoDropdown#dropdownButtonTooltip } is not present.                                                                                                                               | `string`                                                                                                                                                                                         | `undefined`                  |
| `dropdownTooltipTrigger`        | `dropdown-tooltip-trigger`          | Specifies the events that trigger the dropdown button tooltip to appear. Multiple event names should be separated by spaces.                                                                                                                                            | `string`                                                                                                                                                                                         | `'manual'`                   |
| `iconClass`                     | `icon-class`                        | Icon class for the main dropdown button.                                                                                                                                                                                                                                | `string`                                                                                                                                                                                         | `''`                         |
| `items`                         | `items`                             | Array of dropdown options.                                                                                                                                                                                                                                              | `DropdownItem<any>[]`                                                                                                                                                                            | `undefined`                  |
| `tooltipPlacement`              | `tooltip-placement`                 | Specifies the items tooltip placement. Accepts a string of the placement or a function that returns the placement. The function takes the isOpen parameter as a boolean and returns the placement as a string. If not provided, the tooltip will be placed to the left. | `((isOpen: boolean) => OntoTooltipPlacement) \| OntoTooltipPlacement.AUTO \| OntoTooltipPlacement.BOTTOM \| OntoTooltipPlacement.LEFT \| OntoTooltipPlacement.RIGHT \| OntoTooltipPlacement.TOP` | `OntoTooltipPlacement.LEFT`  |
| `tooltipTheme`                  | `tooltip-theme`                     | The tooltip theme to be used. For more information {@link OntoTooltipConfiguration#theme }.                                                                                                                                                                             | `string`                                                                                                                                                                                         | `undefined`                  |


## Events

| Event          | Description                                                                                                | Type               |
| -------------- | ---------------------------------------------------------------------------------------------------------- | ------------------ |
| `valueChanged` | Event emitted when a dropdown item is selected. The event payload contains the value of the selected item. | `CustomEvent<any>` |


## Dependencies

### Used by

 - [onto-language-selector](../onto-language-selector)
 - [onto-repository-selector](../onto-repository-selector)

### Graph
```mermaid
graph TD;
  onto-language-selector --> onto-dropdown
  onto-repository-selector --> onto-dropdown
  style onto-dropdown fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
