import {Awaitable} from '@ontotext/workbench-api';

/**
 * Model that holds a dropdown item configuration.
 */
export class DropdownItem<T> {
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
  private _tooltip: string | Awaitable<string>;

  /**
   * The translation label key for the dropdown item tooltip. It will be used if {@link DropdownItem._tooltipLabelKey} is not present.
   */
  private _tooltipLabelKey: string;

  /**
   * Specifies the events that trigger the dropdown item tooltip to appear. Multiple event names should be separated by spaces.
   */
  private _dropdownTooltipTrigger = 'manual';

  /**
   * Icon class for the main dropdown button.
   */
  private _iconClass: string;

  /**
   * Path or URL to the image used as icon an item of dropdown button.
   */
  private _iconImage: string;

  /**
   * The value of dropdown item. It will be emitted when the item is selected.
   * @private
   */
  private _value: T;

  /**
   * Custom css classes for the dropdown item.
   * @private
   */
  private _cssClass: string;

  /**
   * The value of the `guide-selector` attribute for a dropdown item.
   * @private
   */
  private _guideSelector: string;

  get name(): string {
    return this._name;
  }

  setName(value: string): this {
    this._name = value;
    return this;
  }

  get nameLabelKey(): string {
    return this._nameLabelKey;
  }

  setNameLabelKey(value: string): this {
    this._nameLabelKey = value;
    return this;
  }

  get tooltip(): string | Awaitable<string> {
    return this._tooltip;
  }

  setTooltip(value: string | Awaitable<string>): this {
    this._tooltip = value;
    return this;
  }

  get tooltipLabelKey(): string {
    return this._tooltipLabelKey;
  }

  setTooltipLabelKey(value: string): this {
    this._tooltipLabelKey = value;
    return this;
  }

  get iconClass(): string {
    return this._iconClass;
  }

  setIconClass(value: string): this {
    this._iconClass = value;
    return this;
  }

  get iconImage(): string {
    return this._iconImage;
  }

  setIconImage(value: string): this {
    this._iconImage = value;
    return this;
  }

  get value(): T {
    return this._value;
  }

  setValue(value: T): this {
    this._value = value;
    return this;
  }

  get dropdownTooltipTrigger(): string {
    return this._dropdownTooltipTrigger;
  }

  setDropdownTooltipTrigger(value: string) : this {
    this._dropdownTooltipTrigger = value;
    return this;
  }

  get cssClass(): string {
    return this._cssClass;
  }

  setCssClass(value: string): this {
    this._cssClass = value;
    return this;
  }

  get guideSelector(): string {
    return this._guideSelector;
  }

  setGuideSelector(value: string) {
    this._guideSelector = value;
    return this;
  }
}
