import {Component, h, Prop, Event, EventEmitter} from '@stencil/core';
import {TranslationService} from '../../services/translation.service';
import {ToggleEventPayload} from '../../models/toggle-switch/toggle-event-payload';

@Component({
  tag: 'onto-toggle-switch',
  styleUrl: 'onto-toggle-switch.scss'
})
/**
 * OntoToggleSwitch component
 *
 * This component renders a toggle switch with a label and tooltip.
 * It also supports translation of the label and tooltip.
 * Handles the checked status change and emits the new status as an event.
 */
export class OntoToggleSwitch {
  private readonly id = window.crypto.randomUUID();
  private tooltipLabel: string;

  /**
   * Determines whether the toggle switch is checked or not.
   */
  @Prop({ mutable: true }) checked = false;

  /**
   * The key used for translating the label text, if supplied.
   */
  @Prop() labelKey?: string;

  /**
   * The translation label key for the tooltip message, if supplied.
   */
  @Prop() tooltipTranslationKey?: string;

  /**
   * The context for the tooltip, if supplied. This is useful if you have multiple toggle switches, to know which one
   * is being toggled.
   */
  @Prop() context?: string;

  /**
   * Event emitted when the toggle switch is clicked, carrying the new checked status.
   */
  @Event() toggleChanged: EventEmitter<ToggleEventPayload>;

  private toggle = () => {
    this.checked = !this.checked;
    this.toggleChanged.emit({checked: this.checked, context: this.context});
  };

  private onLanguageChange() {
    if(this.tooltipTranslationKey) {
      TranslationService.onTranslate(this.tooltipTranslationKey, [], (translation) => {
        this.tooltipLabel = translation;
      });
    }
  }

  componentWillLoad() {
    this.onLanguageChange();
  }

  render() {
    return (
      <section id={this.id} key={this.id}>
        {this.labelKey &&
          <label>
            <strong>
              <translate-label labelKey={this.labelKey}></translate-label>&nbsp;
            </strong>
          </label>
        }
        <span class="toggle-switch" onClick={this.toggle} tooltip-content={this.tooltipLabel} tooltip-placement="top">
          <input type="checkbox" checked={this.checked}/>
          <label htmlFor={this.id}></label>
        </span>
      </section>
    );
  }
}
