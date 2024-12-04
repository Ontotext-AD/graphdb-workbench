import {BaseSteps} from "../base-steps";
import {RepositoriesStubs} from "../../stubs/repositories-stubs";

export class RepositorySelectorSteps extends BaseSteps {

  static visit() {
    super.visit('repository-selector');
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
