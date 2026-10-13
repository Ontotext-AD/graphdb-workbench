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
    return HeaderSteps.getHeader().find('.onto-rdf-search');
  }

  static getSearchIcon() {
    return this.getSearch().find('.ri-search-line');
  }

  static clickSearchIcon() {
    return this.getSearchIcon().click();
  }

  static getSearchArea() {
    return this.getSearch().find('.search-area');
  }

  static closeSearchArea() {
    return HeaderSteps.getSearchArea().find('.close-btn').click();
  }

  static setMarvelRepo() {
    cy.get('#set-marvel-repo').click();
  }

  static setActiveLocationLoading() {
    cy.get('#set-is-loading').click();
  }

  static setActiveLocationNotLoading() {
    cy.get('#set-is-not-loading').click();
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

  static enableSecurity() {
    cy.get('#enable-security').click();
  }

  static setAuthenticatedUser() {
    cy.get('#set-authenticated-user').click();
  }

  static disableSecurity() {
    return cy.get('#disable-security').click();
  }

  static activateFreeAccess() {
    cy.get('#activate-free-access').click();
  }

  static deactivateFreeAccess() {
    cy.get('#deactivate-free-access').click();
  }

  static activateFreeAccessAndBeLoggedIn() {
    cy.get('#activate-free-access-and-be-logged-in').click()
  }

  static getLoginButton() {
    return HeaderSteps.getHeader().find('.onto-user-login');
  }

  static clickLoginButton() {
    return HeaderSteps.getLoginButton().click();
  }

}
