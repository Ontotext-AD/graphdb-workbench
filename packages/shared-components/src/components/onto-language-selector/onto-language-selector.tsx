import {Component, Host, h, State, Prop} from '@stencil/core';
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {
  ServiceProvider,
  LanguageService,
  LanguageContextService,
} from "@ontotext/workbench-api";
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';

@Component({
  tag: 'onto-language-selector',
  styleUrl: 'onto-language-selector.scss',
  shadow: false,
})
export class OntoLanguageSelector {
  private readonly languageService = ServiceProvider.get(LanguageService);
  private readonly languageContextService = ServiceProvider.get(LanguageContextService);
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

  connectedCallback() {
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
          dropdownTooltipTrigger={'mouseenter focus'}
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
    let selectedLanguage = newLanguage;
    if (!selectedLanguage) {
      selectedLanguage = this.languageService.getDefaultLanguage();
    }

    this.currentLanguage = selectedLanguage;
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
        .setCssClass(locale)
        .setValue(locale)
        .setDropdownTooltipTrigger('mouseenter focus');
    });
  }
}
