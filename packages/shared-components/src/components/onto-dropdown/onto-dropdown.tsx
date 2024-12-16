import {Component, Event, h, State, Prop, EventEmitter, Element, Listen} from '@stencil/core';
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {TranslationService} from '../../services/translation.service';
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';
import {Awaitable} from '@ontotext/workbench-api';

/**
 * A reusable dropdown component built using StencilJS. This component supports configurable labels, tooltips, icons,
 * and items, making it versatile for various use cases. It also integrates with a translation service to handle
 * internationalization.
 */
@Component({
  tag: 'onto-dropdown',
  styleUrl: 'onto-dropdown.scss',
  shadow: false,
})
export class OntoDropdown {

  @Element() hostElement: HTMLOntoDropdownElement;

  /**
   * Indicates whether the dropdown menu is open.
   */
  @State() open = false;

  /**
   * The name for the dropdown button. This can either be a string (used directly as the button label)
   * or a Stencil component (used to render the button content). It will be used if present;
   * otherwise, the {@link OntoDropdown#dropdownButtonNameLabelKey} will be used.
   */
  @Prop() dropdownButtonName: string;

  /**
   * The translation label key for the dropdown button name. It will be used if {@link OntoDropdown#dropdownButtonName} is not present.
   */
  @Prop() dropdownButtonNameLabelKey: string;

  /**
   * The dropdown button tooltip. It will be used if present; otherwise, the {@link OntoDropdown#dropdownButtonTooltipLabelKey} will be used.
   */
  @Prop() dropdownButtonTooltip: string | Awaitable<string>;

  /**
   * The translation label key for the dropdown button tooltip. It will be used if {@link OntoDropdown#dropdownButtonTooltip} is not present.
   */
  @Prop() dropdownButtonTooltipLabelKey: string;

  /**
   * Specifies the events that trigger the dropdown button tooltip to appear. Multiple event names should be separated by spaces.
   */
  @Prop() dropdownTooltipTrigger = 'manual';

  /**
   * Icon class for the main dropdown button.
   */
  @Prop() iconClass = '';

  /**
   * Array of dropdown options.
   */
  @Prop() items: DropdownItem<any>[];

  /**
   *  The tooltip theme to be used. For more information {@link OntoTooltipConfiguration#theme}.
   */
  @Prop() tooltipTheme: string;

  /**
   * Specifies the dropdown items' alignment. If not provided, the items and the dropdown button will be aligned to the left.
   *
   */
  @Prop() dropdownAlignment: DropdownItemAlignment = DropdownItemAlignment.LEFT;

  /**
   * Event emitted when a dropdown item is selected.
   * The event payload contains the value of the selected item.
   */
  @Event() valueChanged: EventEmitter;

  /**
   * Listens for the Escape key keydown event globally.
   * Closes the dropdown menu if the Escape key is pressed.
   *
   * @param ev The keyboard event triggered by the Escape key.
   */
  @Listen('keydown', {target: 'window'})
  keydownListener(ev: KeyboardEvent): void {
    if (ev.key === 'Escape') {
      this.closeMenu();
    }
  }

  /**
   * Listens for mouse click events globally.
   * Closes the dropdown menu if the click occurs outside the dropdown.
   *
   * @param ev The mouse event triggered by a click.
   */
  @Listen('click', {target: 'window'})
  mouseClickListener(ev: PointerEvent): void {
    const target: HTMLElement = ev.target as HTMLElement;
    if (!this.hostElement.contains(target)) {
      this.closeMenu();
    }
  }

  render() {
    return (
      <div class={`onto-dropdown ${this.open ? 'open' : 'closed'}`}>
        <button class="onto-dropdown-button"
                tooltip-placement='left'
                tooltip-trigger={this.dropdownTooltipTrigger}
                {...(this.tooltipTheme ? { 'tooltip-theme': this.tooltipTheme } : {})}
                onMouseEnter={this.setDropdownButtonTooltip()}
                onClick={this.toggleButtonClickHandler()}>
          {this.iconClass ? <span class={'button-icon ' + this.iconClass}></span> : ''}
          <span class='button-name'>
                      {this.dropdownButtonName ?? this.translate(this.dropdownButtonNameLabelKey)}
                    </span>
          {/* TODO: Add dropdown toggle button. This depends on GDB-10490 */}
        </button>

        <div
          class={'onto-dropdown-menu ' + (DropdownItemAlignment.RIGHT === this.dropdownAlignment ? 'onto-dropdown-right-item-alignment' : '')}>
          {this.items && this.items.map(item =>
            <button class='onto-dropdown-menu-item'
                    tooltip-placement='left'
                    tooltip-trigger={item.dropdownTooltipTrigger}
                    {...(this.tooltipTheme ? { 'tooltip-theme': this.tooltipTheme } : {})}
                    onMouseEnter={this.setDropdownItemTooltip(item)}
                    onClick={this.itemClickHandler(item.value)}>
              {item.iconClass ? <span class={'onto-dropdown-option-icon ' + item.iconClass}></span> : ''}
              <span>{item.name ?? this.translate(item.nameLabelKey)}</span>
            </button>)}
        </div>
      </div>
    );
  }

  private setDropdownButtonTooltip() {
    return async (event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement;
      if (typeof this.dropdownButtonTooltip === 'function') {
        const tooltipContent = await this.dropdownButtonTooltip();
        target.setAttribute('tooltip-content', tooltipContent);
      } else {
        target.setAttribute(
          'tooltip-content',
          this.dropdownButtonTooltip ?? this.translate(this.dropdownButtonTooltipLabelKey)
        );
      }
    }
  }

  private setDropdownItemTooltip(item) {
    return async (event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement;
      if (typeof item.tooltip === 'function') {
        const tooltipContent = await item.tooltip();
        target.setAttribute('tooltip-content', tooltipContent);
      } else {
        target.setAttribute(
          'tooltip-content',
          item.tooltip ?? this.translate(item.tooltipLabelKey)
        );
      }
    }
  }

  private toggleButtonClickHandler() {
    return () => this.toggleComponent();
  }

  private itemClickHandler(value: any) {
    return () => this.onSelect(value)
  }

  private translate(key) {
    return key ? TranslationService.translate(key) : '';
  }

  private onSelect(value: any): void {
    this.open = false;
    this.valueChanged.emit(value);
  }

  private toggleComponent(): void {
    this.open = !this.open;
  }

  private closeMenu(): void {
    this.open = false;
  }
}
