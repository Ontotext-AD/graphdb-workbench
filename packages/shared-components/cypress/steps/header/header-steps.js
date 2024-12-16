import {BaseSteps} from "../base-steps";

export class HeaderSteps extends BaseSteps {
  static visit() {
    super.visit('header');
  }

  static getHeader() {
    return cy.get('.header-component');
  }

  static getLanguageSelector() {
    return HeaderSteps.getHeader().find('.onto-language-selector');
  }

  static getLanguageSelectorDropdownToggleButton() {
    return HeaderSteps.getLanguageSelector().find('.onto-dropdown-button');
  }

  static openLanguageSelectorDropdown() {
    HeaderSteps.getLanguageSelector().find('.onto-dropdown.closed').click();
  }

  static closeLanguageSelectorDropdown() {
    HeaderSteps.getHeader().find('.onto-language-selector.open').click();
  }

  static selectLanguage(index) {
    HeaderSteps.getLanguageSelectorDropdownItem(index).click();
  }

  static getLanguageSelectorDropdownItem(index) {
    return this.getLanguageSelectorOptions().eq(index);
  }

  static getLanguageSelectorOptions() {
    return HeaderSteps.getLanguageSelector().find('.onto-dropdown-menu-item');
  }
}
