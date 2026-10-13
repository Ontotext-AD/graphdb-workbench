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

  static getSearchIconButton() {
    return this.getSearchIcon().find('button');
  }

  static focusSearchIconButton() {
    return this.getSearchIconButton().focus();
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

  static getCloseButton() {
    return this.getSearchArea().find('.close-btn');
  }

  static focusCloseButton() {
    return this.getCloseButton().focus();
  }

  static closeSearchArea() {
    return this.getCloseButton().click();
  }

  static getClearInputButton() {
    return this.getSearchArea().find('.clear-input');
  }

  static focusClearInputButton() {
    return this.getClearInputButton().focus();
  }

  static getTooltip() {
    return cy.get('.onto-tooltip-box');
  }

  static getSearchAreaButtons() {
    return this.getSearchArea().find('.input-row > button');
  }

  static focusLastSearchAreaButton() {
    return this.getSearchAreaButtons().last().focus();
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

  static hoverSuggestion(index) {
    return this.getSuggestion(index).trigger('mousemove');
  }

  static getAutocompleteResultsWrapper() {
    return this.getSearchArea().find('.autocomplete-results-wrapper');
  }

  static getSuggestionsListbox() {
    return this.getAutocompleteResultsWrapper();
  }

  static getSuggestion(index) {
    return this.getAutocompleteResultsWrapper().find('p').eq(index);
  }

  static clickSuggestion(index, options = {}) {
    return this.getSuggestion(index).click(options);
  }

  static pressEnter() {
    return this.getInputField().type('{enter}');
  }

  static pressArrowDown() {
    return this.getInputField().type('{downArrow}');
  }

  static pressEscape() {
    return this.getInputField().type('{esc}');
  }

  static loadNamespaces() {
    return cy.get('#load-namespaces-id').click();
  }
}
