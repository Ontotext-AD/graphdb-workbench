import {BaseSteps} from "../base-steps";

export class LanguageSelectorSteps extends BaseSteps {
  static visit() {
    super.visit('language-selector');
  }

  static getLanguageSelector() {
    return cy.get('.onto-language-selector');
  }

  static getLanguageSelectorDropdownToggleButton() {
    return this.getLanguageSelector().find('.onto-dropdown-button');
  }

  static openLanguageSelectorDropdown() {
    this.getLanguageSelector().find('.onto-dropdown.closed').click();
  }

  static closeLanguageSelectorDropdown() {
    cy.get('.onto-language-selector.open').click();
  }

  static selectLanguage(index) {
    this.getLanguageSelectorDropdownItem(index).click();
  }

  static getLanguageSelectorDropdownItem(index) {
    return this.getLanguageSelectorOptions().eq(index);
  }

  static getLanguageSelectorOptions() {
    return this.getLanguageSelector().find('.onto-dropdown-menu-item');
  }
}
