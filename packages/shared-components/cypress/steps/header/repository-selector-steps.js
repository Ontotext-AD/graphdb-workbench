import {BaseSteps} from "../base-steps";

export class RepositorySelectorSteps extends BaseSteps {

  static visit() {
    super.visit('repository-selector');
  }

  static triggerRepositoriesLoading() {
    cy.get('#loadRepositories').click();
  }

  static getRepositorySelector() {
    return cy.get('.onto-repository-selector');
  }

  static getRepositorySelectorToggleButton() {
    return RepositorySelectorSteps.getRepositorySelector().find('.selector-button');
  }

  static toggleRepositorySelector() {
    RepositorySelectorSteps.getRepositorySelectorToggleButton().click();
  }

  static getRepositorySelectorItemMenu() {
    return RepositorySelectorSteps.getRepositorySelector().find('.onto-dropdown-menu');
  }

  static getRepositorySelectorItem(index) {
    return RepositorySelectorSteps.getRepositorySelectorItemMenu().find('.onto-dropdown-menu-item').eq(index);
  }

  static selectRepositorySelectorItem(index) {
    RepositorySelectorSteps.getRepositorySelectorItem(index).click();
  }
}
