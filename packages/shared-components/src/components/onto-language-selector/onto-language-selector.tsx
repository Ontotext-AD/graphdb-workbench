import { Component, h } from '@stencil/core';
import {LanguageService, ServiceProvider} from '@ontotext/workbench-api';

@Component({
  tag: 'onto-language-selector',
  styleUrl: 'onto-language-selector.scss',
  shadow: true,
})
export class OntoLanguageSelector {

  private languageService: LanguageService;

  private items = [
    {
      labelKey: 'English',
      value: 'en',
    },
    {
      labelKey: 'French',
      value: 'fr',
    }
  ];

  constructor() {
    this.languageService = ServiceProvider.get(LanguageService);
  }

  onLanguageChange(ev): void {
    this.languageService.changeLanguage(ev.detail)
  }


  render() {
    return (
      <onto-dropdown
        class='ontotext-download-as'
        onValueChanged={ev => this.onLanguageChange(ev)}
        tooltipLabelKey="test.com"
        nameLabelKey="en"
        iconClass='icon-download'
        items={this.items}>
      </onto-dropdown>
    );
  }
}
