import {Component, Event, EventEmitter, h, Listen, Prop, State} from '@stencil/core';
import {DropdownOption} from '../../../models/components/dropdown-option';
import {TranslationService} from '../../../services/translation.service';

@Component({
  tag: 'onto-dropdown',
  styleUrl: 'onto-dropdown.scss',
  shadow: false,
})
export class OntoDropdown {

  @State() open;
  // @State() showTooltip = false;

  @Prop() nameLabelKey: string;
  @Prop() tooltipLabelKey: string;
  @Prop() items: DropdownOption[];
  @Prop() iconClass = '';

  @Event() valueChanged: EventEmitter;

  /**
   * Handles the Escape key keydown event and closes the dialog.
   * @param ev The keyboard event.
   */
  @Listen('keydown', {target: "window"})
  keydownListener(ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      this.closeMenu();
    }
  }

  /**
   * Handles the mouse click events and closes the menu when target is outside the menu.
   * @param ev The mouse event.
   */
  @Listen('click', {target: 'window'})
  mouseClickListener(ev: PointerEvent): void {
    const target: HTMLElement = ev.target as HTMLElement;
    if (!target.closest('.ontotext-dropdown')) {
      this.closeMenu();
    }
  }

  render() {
    console.log('This open when render: ', this.open)
    // const showToolbar = this.tooltipLabelKey && window.innerWidth < 768;
    const dropdownButtonClass = `ontotext-dropdown-button ${this.open ? 'icon-caret-up-after' : ' icon-caret-down-after'}
    ${this.iconClass ? `ontotext-dropdown-icon ${this.iconClass}` : ''}`;
    return (
      // <yasgui-tooltip
      //   data-tooltip={showToolbar ? this.translate(this.nameLabelKey) : ''}>
        <div class='ontotext-dropdown'>
          <button class={dropdownButtonClass}
                  onClick={() => this.toggleComponent()}>
            <span class='button-name'>{this.translate(this.nameLabelKey)}</span>
          </button>
          <div class={`ontotext-dropdown-menu ${this.open ? 'open' : 'closed'}`}>
            {this.items && this.items.map(item =>
              <a href="#" class='ontotext-dropdown-menu-item' onClick={() => this.onSelect(item.value)}>
                {this.translate(item.labelKey)}
              </a>)}
          </div>
        </div>
      // </yasgui-tooltip>
    );
  }

  private onSelect(value: any) {
    console.log('onSelect menu setting to false')
    // this.open = false;
    this.valueChanged.emit(value);
  }

  private toggleComponent(): void {
    console.log("Change state")
    this.open = !this.open;
    console.log(this.open)
  }

  private translate(labelKey: string): string {
      return TranslationService.translate(labelKey);
  }

  private closeMenu(): void {
    console.log('Close menu setting to false')
    // this.open = false;
  }
}
