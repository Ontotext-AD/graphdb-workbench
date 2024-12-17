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

  static getSearch() {
    return HeaderSteps.getHeader().find('.search-component');
  }
}
