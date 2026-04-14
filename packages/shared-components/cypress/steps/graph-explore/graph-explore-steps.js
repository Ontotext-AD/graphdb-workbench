import {BaseSteps} from '../base-steps';

export class GraphExploreSteps extends BaseSteps {
  static visit() {
    super.visit('graph-explore');
  }

  static configureEmptyGraphConfigs() {
    cy.get('#configureEmptyGraphConfigs').click();
  }

  static getGraphExploreSplitButton() {
    return cy.get('#onto-graph-explore-split-button-id');
  }

  static getMainButton() {
    return GraphExploreSteps.getGraphExploreSplitButton().find('.explore-visual-graph-button');
  }

  static clickMainButton() {
    GraphExploreSteps.getMainButton().click();
  }

  static getDropdownToggleButton() {
    return GraphExploreSteps.getGraphExploreSplitButton().find('.onto-dropdown-button');
  }

  static toggleDropdown() {
    GraphExploreSteps.getDropdownToggleButton().click();
  }

  static getGraphConfigs() {
    return GraphExploreSteps.getGraphExploreSplitButton().find('.onto-dropdown-menu-item');
  }

  static getGraphConfig(index = 0) {
    return GraphExploreSteps.getGraphConfigs().eq(index);
  }

  static selectGraphConfig(index = 0) {
    GraphExploreSteps.getGraphConfig(index).click();
  }

  static getEventConsole() {
    return cy.get('#event-console');
  }

  static getCreateGraphConfigLink() {
    return GraphExploreSteps.getGraphExploreSplitButton().find('.graph-create-link');
  }

  static clickCreateGraphConfigLink() {
    GraphExploreSteps.getCreateGraphConfigLink().click();
  }

  static getNoConfigurationsMessage() {
    return GraphExploreSteps.getGraphExploreSplitButton().find('.no-configurations-message');
  }
}
