import {Component, Host, h, Prop, State} from '@stencil/core';
import {TranslationParameter} from '../../models/translation/translation-parameter';
import {TranslationService} from '../../services/translation.service';

/**
 * The purpose of this component is to display translated literals in the DOM. A Stencil component re-renders when a prop or state changes,
 * but it may not re-render when the language changes. In such cases, this component should be used. It handles language change events
 * and re-translates the passed language and translation parameters.
 * Example of usage:
 * <code>
 *    <translate-label labelKey={item.labelKey} translationParameter={item.translationParameter}></translate-label>
 *    <translate-label labelKey="example.label></translate-label>
 * </code>
 */
@Component({
  tag: 'translate-label',
  styleUrl: 'translate-label.scss',
  shadow: true,
})
export class TranslateLabel {

  private readonly unsubscribeTranslationChanged: Function;

  @Prop() labelKey: string;
  @Prop() translationParameters: TranslationParameter[] = [];

  @State() translatedLabel: string;

  constructor() {
    this.unsubscribeTranslationChanged = TranslationService.onTranslate(this.labelKey, this.translationParameters, (translatedLabel) => this.translatedLabel = translatedLabel);
  }

  disconnectedCallback(): void {
    this.unsubscribeTranslationChanged && this.unsubscribeTranslationChanged();
  }

  render() {
    return (
      <Host>
        {this.translatedLabel}
      </Host>
    );
  }
}
