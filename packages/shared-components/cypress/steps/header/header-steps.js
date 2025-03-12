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

  static getRepositorySelector() {
    return HeaderSteps.getHeader().find('.onto-repository-selector');
  }

  static selectRepository(index) {
    HeaderSteps.getRepositorySelector().find('.onto-dropdown-menu-item').eq(index).click();
  }

  static getSearch() {
    return HeaderSteps.getHeader().find('.search-component');
  }

  static getLicenseAlert() {
    return HeaderSteps.getHeader().find('.onto-license-alert');
  }

  static setLicenseValid(valid) {
    const license = valid ? '#valid-license' : '#invalid-license';
    cy.get(license).click();
  }

  static getOperationsNotification() {
    return HeaderSteps.getHeader().find('onto-operations-notification');
  }

  static loadRepositories() {
    cy.get('#load-repositories').click();
  }
}
