import {Component, Event, h, State, Prop, EventEmitter, Listen} from '@stencil/core';
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {TranslationService} from '../../services/translation.service';
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';

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

    /**
     * Indicates whether the dropdown menu is open.
     */
    @State() open = false;

    /**
     * The dropdown button name. It will be used if present; otherwise, the {@link OntoDropdown#dropdownButtonNameLabelKey} will be used.
     */
    @Prop() dropdownButtonName: string;

    /**
     * The translation label key for the dropdown button name. It will be used if {@link OntoDropdown#dropdownButtonName} is not present.
     */
    @Prop() dropdownButtonNameLabelKey: string;

    /**
     * The dropdown button tooltip. It will be used if present; otherwise, the {@link OntoDropdown#dropdownButtonTooltipLabelKey} will be used.
     */
    @Prop() dropdownButtonTooltip: string;

    /**
     * The translation label key for the dropdown button tooltip. It will be used if {@link OntoDropdown#dropdownButtonTooltip} is not present.
     */
    @Prop() dropdownButtonTooltipLabelKey: string;

    /**
     * Icon class for the main dropdown button.
     */
    @Prop() iconClass = '';

    /**
     * Array of dropdown options.
     */
    @Prop() items: DropdownItem[];

    /**
     * Specifies the dropdown items' alignment. If not provided, the items and the dropdown button will be aligned to the left.
     *
     */
    @Prop() dropdownAlignment: DropdownItemAlignment = DropdownItemAlignment.LEFT;

    /**
     * Event emitted when a dropdown item is selected.
     * The event payload contains the value of the selected item.
     */
    @Event() valueChanged: EventEmitter<string>;

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
        if (!target.closest('.onto-dropdown')) {
            this.closeMenu();
        }
    }

    render() {
        return (
            <div class={`onto-dropdown ${this.open ? 'open' : 'closed'}`}>
                <button class="onto-dropdown-button"
                        tooltip-content={this.dropdownButtonTooltip ? this.dropdownButtonTooltip : TranslationService.translate(this.dropdownButtonTooltipLabelKey)}
                        tooltip-placement='left'
                        onClick={() => this.toggleComponent()}>
                    <span class={'button-icon ' + this.iconClass}></span>
                    <span class='button-name'>
                      {this.dropdownButtonName ? this.dropdownButtonName : TranslationService.translate(this.dropdownButtonNameLabelKey)}
                    </span>
                </button>

                <div class={'onto-dropdown-menu ' + (DropdownItemAlignment.RIGHT === this.dropdownAlignment ? 'onto-dropdown-right-item-alignment' : '')}>
                    {this.items && this.items.map(item =>
                        <button class='onto-dropdown-menu-item'
                                tooltip-content={item.tooltip ? item.tooltip : TranslationService.translate(item.tooltipLabelKey)}
                                tooltip-placement='left'
                                onClick={() => this.onSelect(item.value)}>
                            <span class={'onto-dropdown-option-icon ' + item.iconClass}></span>
                            <span innerHTML={item.name ? item.name : TranslationService.translate(item.nameLabelKey)}></span>
                        </button>)}
                </div>
            </div>
        );
    }

    private onSelect(value: string): void {
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
