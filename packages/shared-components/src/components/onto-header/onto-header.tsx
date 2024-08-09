import { Component, Host, h } from '@stencil/core';
import {ServiceProvider, LanguageService} from '../../../../api/src/ontotext-workbench-api';

@Component({
  tag: 'onto-header',
  styleUrl: 'onto-header.scss',
  shadow: false,
})
export class OntoHeader {

  private languageService: LanguageService;

  // TODO remove this when implement language selector
  private locale = 'en'

  constructor() {
    this.languageService = ServiceProvider.get(LanguageService);
  }

  // TODO remove this when implement language selector
  private onLanguageChanged(): void {
    if (this.locale === 'en') {
      this.locale = 'fr';
    } else {
      this.locale = 'en';
    }
    this.languageService.changeLanguage(this.locale);
  }

  render() {
    return (
      <Host>
        <div class="header-component">
          <div class="search-component">&#x1F50D;</div>
          <div class="repository-selector-component">TestRepo &#8964;</div>
          <div class="language-selector-component" onClick={this.onLanguageChanged}>EN &#8964;</div>
        </div>
      </Host>
    );
  }
}
