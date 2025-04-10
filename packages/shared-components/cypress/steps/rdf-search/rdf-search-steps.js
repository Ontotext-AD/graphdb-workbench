import {BaseSteps} from "../base-steps";

export class RdfSearchSteps extends BaseSteps {
  static visit() {
    super.visit('rdf-search');
  }

  static getSearch() {
    return cy.get('onto-rdf-search');
  }

  static getSearchIcon() {
    return this.getSearch().find('onto-search-icon');
  }

  static clickSearchIcon() {
    return this.getSearchIcon().click();
  }

  static hoverSearchIcon() {
    return this.getSearchIcon().trigger('mouseover');
  }

  static getSearchArea() {
    return this.getSearch().find('.search-area');
  }

  static closeSearchArea() {
    return this.getSearchArea().find('.close-btn').click();
  }

  static getTooltip() {
    return cy.get('[data-tippy-root]');
  }

  static getSearchAreaButtons() {
    return this.getSearchArea().find('button');
  }
}
