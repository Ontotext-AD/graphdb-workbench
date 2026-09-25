import {Component, Element, Event, EventEmitter, h, Listen, Prop, State} from '@stencil/core';
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {TranslationService} from '../../services/translation.service';
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';
import {Awaitable} from '@ontotext/workbench-api';
import {TooltipUtil} from '../../utils/tooltip-util';
import {HTMLElementWithTooltip} from '../onto-tooltip/models/html-element-with-tooltip';
import {OntoTooltipPlacement} from '../onto-tooltip/models/onto-tooltip-placement';
import {LoggerProvider} from '../../services/logger-provider';

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

  private readonly logger = LoggerProvider.logger;
  private readonly GUIDE_SELECTOR_ATTR = 'guide-selector';
  private readonly pendingItemTooltips = new Map<HTMLElementWithTooltip, symbol>();
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
   * Icon class for the main dropdown button.
   */
  @Prop() iconClass = '';

  /**
   * Path or URL to the image used as icon for main dropdown button.
   */
  @Prop() iconImage = '';

  /**
   * Array of dropdown options.
   */
  @Prop() items: DropdownItem<unknown>[];

  /**
   *  The tooltip theme to be used for the trigger. For more information {@link OntoTooltipConfiguration#theme}.
   */
  @Prop() tooltipTheme: string;

  /**
   *  The tooltip theme to be used for the items. For more information {@link OntoTooltipConfiguration#theme}.
   */
  @Prop() itemTooltipTheme: string;

  /**
   *  The tooltip class to be used. For more information {@link OntoTooltipConfiguration#tooltipClass}.
   */
  @Prop() tooltipClass: string;

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
   * Indicates whether the dropdown is disabled.
   */
  @Prop() disabled = false;

  /**
   * Event emitted when a dropdown item is selected.
   * The event payload contains the value of the selected item.
   */
  @Event() valueChanged: EventEmitter;

  /**
   * Event emitted when the dropdown opens or closes.
   * The event detail is true when open and false when closed.
   */
  @Event() toggle: EventEmitter<boolean>;

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
    const menuItemTooltipTheme = this.itemTooltipTheme ?? this.tooltipTheme;

    return (
      <div class={`onto-dropdown ${this.open ? 'open' : 'closed'}`}>
        <button class="onto-dropdown-button"
          ref={(el) => this.dropdownButtonElement = el as unknown as HTMLElementWithTooltip}
          {...(this.dropdownButtonGuideSelector ? { [this.GUIDE_SELECTOR_ATTR]: this.dropdownButtonGuideSelector } : {})}
          tooltip-placement={tooltipPlacement}
          tooltip-content={this.buttonTooltipContent}
          tooltip-class={this.tooltipClass}
          {...(this.tooltipTheme ? {'tooltip-theme': this.tooltipTheme} : {})}
          onMouseEnter={this.setDropdownButtonTooltip()}
          onClick={this.toggleButtonClickHandler}
          disabled={this.disabled}>
          {this.iconClass ? <i class={'button-icon ri-lg ' + this.iconClass}></i> : ''}
          <span class='button-name'>
            {this.dropdownButtonName ?? this.translate(this.dropdownButtonNameLabelKey)}
          </span>
          <i class={`ri-arrow-down-s-line ${this.open ? 'rotate-180' : ''}`}></i>
        </button>

        <div
          class={'onto-dropdown-menu ' + dropdownAlignmentClass}>
          {this.items?.map((item) =>
            <button class={'onto-dropdown-menu-item ' + item.cssClass}
              {...(item.guideSelector ? { [this.GUIDE_SELECTOR_ATTR]: item.guideSelector } : {})}
              tooltip-placement={OntoTooltipPlacement.LEFT}
              tooltip-class={this.tooltipClass}
              {...(menuItemTooltipTheme ? {'tooltip-theme': menuItemTooltipTheme} : {})}
              onMouseEnter={this.setDropdownItemTooltip(item)}
              onMouseLeave={this.clearPendingDropdownItemTooltip}
              onClick={this.itemClickHandler(item.value)}
              disabled={this.disabled}>
              {item.iconClass ? <span class={'onto-dropdown-option-icon ' + item.iconClass}></span> : ''}
              {item.iconImage ? <img class='onto-dropdown-option-image-icon' src={item.iconImage} alt={item.name ?? this.translate(item.nameLabelKey)}></img> : '' }
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
      const target = event.currentTarget as HTMLElementWithTooltip;
      const request = Symbol();
      this.pendingItemTooltips.set(target, request);
      const tooltipContent = typeof item.tooltip === 'function'
        ? await this.getTooltipContent(item.tooltip)
        : (item.tooltip ?? this.translate(item.tooltipLabelKey));

      if (this.pendingItemTooltips.get(target) !== request || !target.isConnected) {
        return;
      }
      this.pendingItemTooltips.delete(target);

      target.setAttribute('tooltip-content', tooltipContent);
      // Push the (possibly asynchronously resolved) content into an already created
      // tooltip instance, since setting the attribute alone does not update it.
      TooltipUtil.updateTooltipContent(target, tooltipContent);

      // Re-dispatch a bubbling 'mouseover' event so the document-level tooltip listener
      // (onto-tooltip) re-evaluates the target and shows the tooltip with the resolved
      // content. This is required because 'mouseenter' does not bubble to that listener,
      // and its handler may already have run (with a stale/empty attribute) before the
      // async tooltip content above was resolved.
      target.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    };
  }

  private readonly clearPendingDropdownItemTooltip = (event: MouseEvent): void => {
    this.pendingItemTooltips.delete(event.currentTarget as HTMLElementWithTooltip);
  };

  private readonly toggleButtonClickHandler = () => {
    TooltipUtil.destroyTooltip(this.dropdownButtonElement);
    this.buttonTooltipContent = '';
    this.clearDropdownItemTooltips();
    this.toggleComponent();
  };

  private clearDropdownItemTooltips(): void {
    this.pendingItemTooltips.clear();
    this.hostElement
      .querySelectorAll<HTMLElement>('.onto-dropdown-menu-item')
      .forEach((el) => {
        TooltipUtil.destroyTooltip(el as HTMLElementWithTooltip);
        el.setAttribute('tooltip-content', '');
      });
  }

  private itemClickHandler<T>(value: T) {
    return () => this.onSelect(value);
  }

  private translate(key) {
    return key ? TranslationService.translate(key) : '';
  }

  private onSelect<T>(value: T): void {
    this.clearDropdownItemTooltips();
    this.open = false;
    this.toggle.emit(this.open);
    this.valueChanged.emit(value);
  }

  private toggleComponent(): void {
    this.open = !this.open;
    this.toggle.emit(this.open);
  }

  private closeMenu(): void {
    this.clearDropdownItemTooltips();
    this.open = false;
    this.toggle.emit(this.open);
  }

  private async getTooltipContent(tooltipFunction: () => Promise<string>): Promise<string> {
    let tooltipContent = '';
    try {
      tooltipContent = await tooltipFunction();
    } catch (error) {
      this.logger.error(error);
    }
    return tooltipContent;
  }
}
