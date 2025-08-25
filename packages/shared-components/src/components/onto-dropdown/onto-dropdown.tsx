import {Component, Element, Event, EventEmitter, h, Listen, Prop, State} from '@stencil/core';
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {TranslationService} from '../../services/translation.service';
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';
import {Awaitable} from '@ontotext/workbench-api';
import {TooltipUtil} from '../../utils/tooltip-util';
import {HTMLElementWithTooltip} from '../onto-tooltip/models/html-element-with-tooltip';
import {OntoTooltipPlacement} from '../onto-tooltip/models/onto-tooltip-placement';

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

  private readonly GUIDE_SELECTOR_ATTR = 'guide-selector';
  private dropdownButtonElement: HTMLElementWithTooltip;

  @Element() hostElement: HTMLOntoDropdownElement;

  /**
   * Indicates whether the dropdown menu is open.
   */
  @State() open = false;

  /**
   * Holds the content of the tooltip
   */
  @State() buttonTooltipContent = '';

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
   * Defines the value of the `guide-selector` attribute for the dropdown trigger button.
   */
  @Prop() dropdownButtonGuideSelector: string;

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
  @Prop() items: DropdownItem<unknown>[];

  /**
   *  The tooltip theme to be used. For more information {@link OntoTooltipConfiguration#theme}.
   */
  @Prop() tooltipTheme: string;

  /**
   * Specifies the items tooltip placement. Accepts a string of the placement or a function that returns the placement.
   * The function takes the isOpen parameter as a boolean and returns the placement as a string.
   * If not provided, the tooltip will be placed to the left.
   *
   */
  @Prop() tooltipPlacement: OntoTooltipPlacement | ((isOpen: boolean) => OntoTooltipPlacement) = OntoTooltipPlacement.LEFT;

  /**
   * Specifies the dropdown items' alignment. If not provided, the items and the dropdown button will be aligned to the left.
   *
   */
  @Prop() dropdownAlignment: DropdownItemAlignment = DropdownItemAlignment.LEFT;

  /**
   * Flag to determine if the dropdown should close automatically when a click occurs outside the dropdown.
   */
  @Prop() autoClose = false;

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
    if (this.autoClose && !this.hostElement.contains(target)) {
      this.closeMenu();
    }
  }

  componentDidUpdate() {
    if (this.dropdownButtonElement) {
      if (this.buttonTooltipContent && this.buttonTooltipContent !== '') {
        TooltipUtil.updateTooltipContent(this.dropdownButtonElement, this.buttonTooltipContent);
      } else {
        TooltipUtil.destroyTooltip(this.dropdownButtonElement);
      }
    }
  }

  render() {
    const dropdownAlignmentClass = this.dropdownAlignment === DropdownItemAlignment.RIGHT
      ? 'onto-dropdown-right-item-alignment' : 'onto-dropdown-left-item-alignment';
    const tooltipPlacement = typeof this.tooltipPlacement === 'function' ? this.tooltipPlacement(this.open) : this.tooltipPlacement;

    return (
      <div class={`onto-dropdown ${this.open ? 'open' : 'closed'}`}>
        <button class="onto-dropdown-button"
          ref={(el) => this.dropdownButtonElement = el as HTMLElementWithTooltip}
          {...(this.dropdownButtonGuideSelector ? { [this.GUIDE_SELECTOR_ATTR]: this.dropdownButtonGuideSelector } : {})}
          tooltip-placement={tooltipPlacement}
          tooltip-trigger={this.dropdownTooltipTrigger}
          tooltip-content={this.buttonTooltipContent}
          {...(this.tooltipTheme ? {'tooltip-theme': this.tooltipTheme} : {})}
          onMouseEnter={this.setDropdownButtonTooltip()}
          onClick={this.toggleButtonClickHandler}>
          {this.iconClass ? <i class={'button-icon ' + this.iconClass}></i> : ''}
          <span class='button-name'>
            {this.dropdownButtonName ?? this.translate(this.dropdownButtonNameLabelKey)}
          </span>
          <i class={`fa-light fa-angle-down ${this.open ? 'fa-rotate-180' : ''}`}></i>
        </button>

        <div
          class={'onto-dropdown-menu ' + dropdownAlignmentClass}>
          {this.items?.map((item) =>
            <button class={'onto-dropdown-menu-item ' + item.cssClass}
              {...(item.guideSelector ? { [this.GUIDE_SELECTOR_ATTR]: item.guideSelector } : {})}
              tooltip-placement={OntoTooltipPlacement.LEFT}
              tooltip-trigger={item.dropdownTooltipTrigger}
              {...(this.tooltipTheme ? {'tooltip-theme': this.tooltipTheme} : {})}
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
    return async () => {
      let tooltipContent: string;
      if (typeof this.dropdownButtonTooltip === 'function') {
        tooltipContent = await this.getTooltipContent(this.dropdownButtonTooltip);
      } else {
        tooltipContent =  this.dropdownButtonTooltip ?? this.translate(this.dropdownButtonTooltipLabelKey);
      }
      this.buttonTooltipContent = tooltipContent;
    };
  }

  private setDropdownItemTooltip(item) {
    return async (event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement;
      if (typeof item.tooltip === 'function') {
        let tooltipContent = await this.getTooltipContent(item.tooltip);
        target.setAttribute('tooltip-content', tooltipContent);
      } else {
        target.setAttribute(
          'tooltip-content',
          item.tooltip ?? this.translate(item.tooltipLabelKey)
        );
      }
    };
  }

  private readonly toggleButtonClickHandler = () => {
    TooltipUtil.destroyTooltip(this.dropdownButtonElement);
    this.buttonTooltipContent = '';
    this.toggleComponent();
  };

  private itemClickHandler<T>(value: T) {
    return () => this.onSelect(value);
  }

  private translate(key) {
    return key ? TranslationService.translate(key) : '';
  }

  private onSelect<T>(value: T): void {
    this.open = false;
    this.valueChanged.emit(value);
  }

  private toggleComponent(): void {
    this.open = !this.open;
  }

  private closeMenu(): void {
    this.open = false;
  }

  private async getTooltipContent(tooltipFunction: () => Promise<string>): Promise<string> {
    let tooltipContent = '';
    try {
      tooltipContent = await tooltipFunction();
    } catch (error) {
      console.error(error);
    }
    return tooltipContent;
  }
}
