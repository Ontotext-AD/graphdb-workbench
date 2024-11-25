import {Component, Host, h, State} from '@stencil/core';
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {ServiceProvider, LanguageService} from "@ontotext/workbench-api";
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';
import {Subscription} from '@reactivex/rxjs/dist/package';

@Component({
  tag: 'onto-language-selector',
  styleUrl: 'onto-language-selector.scss',
  shadow: false,
})
export class OntoLanguageSelector {
  private languageService: LanguageService;
  private items: DropdownItem[] = [];
  private readonly onLanguageChangeSubscription: Subscription;

  @State() currentLanguage: string;

  constructor() {
    this.languageService = ServiceProvider.get(LanguageService);
    this.onLanguageChangeSubscription = this.languageService.onLanguageChanged()
      .subscribe((newLanguage) => this.changeLanguage(newLanguage));
    this.items = this.getLanguagesDropdownOptions();
  }

  disconnectedCallback(): void {
    if (this.onLanguageChangeSubscription) {
      this.onLanguageChangeSubscription.unsubscribe();
    }
  }

  render() {
    return (
      <Host>
        <onto-dropdown
          class='onto-language-selector'
          onValueChanged={(newLanguage: any) => this.onLanguageChanged(newLanguage)}
          dropdownButtonNameLabelKey={!this.currentLanguage ? 'language_selector.toggle_menu.label' : undefined}
          dropdownButtonName={this.currentLanguage ? this.currentLanguage : undefined}
          dropdownButtonTooltipLabelKey={this.currentLanguage ? 'language_selector.toggle_menu.tooltip' : 'language_selector.toggle_menu.label'}
          dropdownAlignment={DropdownItemAlignment.RIGHT}
          iconClass='icon-translation'
          items={this.items}>
        </onto-dropdown>
      </Host>
    );
  }

  private changeLanguage(newLanguage: string): void {
    this.currentLanguage = newLanguage;
    this.items = this.getLanguagesDropdownOptions();
  }

  private onLanguageChanged(newLanguageEvent: CustomEvent): void {
    this.languageService.changeLanguage(newLanguageEvent.detail);
  }

  private getLanguagesDropdownOptions(): DropdownItem[] {
    return this.languageService.getSupportedLanguages().map((locale) => {
      const iconClass = this.currentLanguage === locale ? 'icon-tick' : '';
      return new DropdownItem()
        .setNameLabelKey(`language_selector.language.${locale}.label`)
        .setTooltipLabelKey(`language_selector.language.${locale}.tooltip.` + (this.currentLanguage === locale ? 'selected' : 'not_selected'))
        .setIconClass(iconClass)
        .setValue(locale);
    });
  }
}
