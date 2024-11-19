/**
 * Model that holds a dropdown item configuration.
 */
export class DropdownItem {
  /**
   * The dropdown item name. It will be used if present; otherwise, the {@link DropdownItem._nameLabelKey} will be used.
   */
  private _name: string;

  /**
   * The translation label key for the dropdown item name. It will be used if {@link DropdownItem._name} is not present.
   */
  private _nameLabelKey: string;

  /**
   * The dropdown item tooltip. It will be used if present; otherwise, the {@link DropdownItem._tooltipLabelKey} will be used.
   */
  private _tooltip: string = '';

  /**
   * The translation label key for the dropdown item tooltip. It will be used if {@link DropdownItem._tooltipLabelKey} is not present.
   */
  private _tooltipLabelKey: string;

  /**
   * Icon class for the main dropdown button.
   */
  private _iconClass: string;

  /**
   * The value of dropdown item. It will be emitted when the item is selected.
   * @private
   */
  private _value: string;

  get name(): string {
    return this._name;
  }

  setName(value: string): DropdownItem {
    this._name = value;
    return this;
  }

  get nameLabelKey(): string {
    return this._nameLabelKey;
  }

  setNameLabelKey(value: string): DropdownItem {
    this._nameLabelKey = value;
    return this;
  }

  get tooltip(): string {
    return this._tooltip;
  }

  setTooltip(value: string): DropdownItem {
    this._tooltip = value;
    return this;
  }

  get tooltipLabelKey(): string {
    return this._tooltipLabelKey;
  }

  setTooltipLabelKey(value: string): DropdownItem {
    this._tooltipLabelKey = value;
    return this;
  }

  get iconClass(): string {
    return this._iconClass;
  }

  setIconClass(value: string): DropdownItem {
    this._iconClass = value;
    return this;
  }

  get value(): string {
    return this._value;
  }

  setValue(value: string): DropdownItem {
    this._value = value;
    return this;
  }
}
