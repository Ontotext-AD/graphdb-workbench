import {Component, Host, h, Prop, State} from '@stencil/core';
import {
  TranslationParameter,
  HtmlUtil,
} from '@ontotext/workbench-api';
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
})
export class TranslateLabel {
  private unsubscribeTranslationChanged: (() => void) | null = null;

  /**
   * The translation label key.
   */
  @Prop() labelKey: string;

  /**
   * The parameters passed to the translation.
   */
  @Prop() translationParameters: TranslationParameter[] = [];

  @State() translatedLabel: string;

  connectedCallback(): void {
    this.unsubscribeTranslationChanged = TranslationService.onTranslate(
      this.labelKey,
      this.translationParameters,
      (translatedLabel) => {
        this.translatedLabel = HtmlUtil.sanitize(translatedLabel);
      }
    );
  }

  disconnectedCallback(): void {
    if (this.unsubscribeTranslationChanged) {
      this.unsubscribeTranslationChanged();
      this.unsubscribeTranslationChanged = null;
    }
  }

  render() {
    return <Host innerHTML={this.translatedLabel}></Host>;
  }
}
