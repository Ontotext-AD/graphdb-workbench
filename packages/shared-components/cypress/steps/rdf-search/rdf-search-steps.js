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

  static getButton(text) {
    return this.getSearchAreaButtons().contains(text);
  }

  static clickButton(text) {
    return this.getButton(text).click();
  }

  static disableAutocomplete() {
    return cy.get('#disable-autocomplete').click();
  }

  static enableAutocomplete() {
    return cy.get('#enable-autocomplete').click();
  }

  static typeInSearchInput(text) {
    return this.getInputField().type(text);
  }

  static getInputField() {
    return this.getSearchArea().find('input');
  }

  static getToastNotification() {
    return cy.get('.onto-toast');
  }

  static clickToastNotification() {
    return this.getToastNotification().click();
  }

  static getAutocompleteResultsWrapper() {
    return this.getSearchArea().find('.autocomplete-results-wrapper');
  }

  static getSuggestion(index) {
    return this.getAutocompleteResultsWrapper().find('p').eq(index);
  }

  static clickSuggestion(index, options = {}) {
    return this.getSuggestion(index).click(options);
  }

  static ctrlClickSuggestion(index) {
    return this.clickSuggestion(index, {ctrlKey: true});
  }

  static pressEnter() {
    return this.getInputField().type('{enter}');
  }

  static ctrlPressEnter() {
    return this.getInputField().type('{ctrl}{enter}');
  }

  static getClearInputIcon() {
    return this.getSearchArea().find('.clear-input');
  }

  static clearSearchInput() {
    return this.getClearInputIcon().click();
  }

  static pressEscape() {
    return this.getInputField().type('{esc}');
  }

  static loadNamespaces() {
    return cy.get('#load-namespaces-id').click();
  }
}
