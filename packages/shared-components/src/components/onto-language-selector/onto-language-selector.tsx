import {Component, Host, h, State, Prop} from '@stencil/core';
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {
  ServiceProvider,
  LanguageService,
  LanguageContextService,
  LanguageStorageService
} from "@ontotext/workbench-api";
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';

@Component({
  tag: 'onto-language-selector',
  styleUrl: 'onto-language-selector.scss',
  shadow: false,
})
export class OntoLanguageSelector {
  private languageService: LanguageService;
  private languageContextService: LanguageContextService;
  private items: DropdownItem<string>[] = [];
  private onLanguageChangeSubscription: () => void;

  /**
   * Specifies the dropdown items' alignment. If not provided, the items and the dropdown button will be aligned to the left.
   *
   */
  @Prop() dropdownAlignment: DropdownItemAlignment = DropdownItemAlignment.LEFT;

  /**
   * Holds the currently selected language, such as 'en' or 'fr'.
   */
  @State() currentLanguage: string;

  constructor() {
    this.languageService = ServiceProvider.get(LanguageService);
    this.languageContextService = ServiceProvider.get(LanguageContextService);
    const selectedLanguage = ServiceProvider.get(LanguageStorageService).get(this.languageContextService.SELECTED_LANGUAGE);
    this.changeLanguage(selectedLanguage?.getValueOrDefault(LanguageService.DEFAULT_LANGUAGE));
    this.onLanguageChangeSubscription = this.languageContextService.onSelectedLanguageChanged((newLanguage) => this.changeLanguage(newLanguage));
    this.items = this.getLanguageDropdownOptions();
  }

  disconnectedCallback(): void {
    if (this.onLanguageChangeSubscription) {
      this.onLanguageChangeSubscription();
    }
  }

  render() {
    return (
      <Host>
        <onto-dropdown
          class='onto-language-selector'
          onValueChanged={this.valueChangeHandler()}
          dropdownButtonNameLabelKey={!this.currentLanguage ? 'language_selector.toggle_menu.label' : undefined}
          dropdownButtonName={this.currentLanguage ?? undefined}
          dropdownButtonTooltipLabelKey={this.currentLanguage ? 'language_selector.toggle_menu.tooltip' : 'language_selector.toggle_menu.label'}
          dropdownAlignment={this.dropdownAlignment ?? DropdownItemAlignment.RIGHT}
          iconClass='icon-translation'
          items={this.items}>
        </onto-dropdown>
      </Host>
    );
  }

  private valueChangeHandler() {
    return (newLanguage: any) => this.onSelectedLanguageChanged(newLanguage);
  }

  private changeLanguage(newLanguage: string): void {
    this.currentLanguage = newLanguage;
    this.items = this.getLanguageDropdownOptions();
  }

  private onSelectedLanguageChanged(newLanguageEvent: CustomEvent): void {
    this.languageContextService.updateSelectedLanguage(newLanguageEvent.detail);
  }

  private getLanguageDropdownOptions(): DropdownItem<string>[] {
    return this.languageService.getSupportedLanguages().map((locale) => {
      const iconClass = this.currentLanguage === locale ? 'icon-tick' : '';
      return new DropdownItem<string>()
        .setNameLabelKey(`language_selector.language.${locale}.label`)
        .setTooltipLabelKey(`language_selector.language.${locale}.tooltip.` + (this.currentLanguage === locale ? 'selected' : 'not_selected'))
        .setIconClass(iconClass)
        .setValue(locale);
    });
  }
}
