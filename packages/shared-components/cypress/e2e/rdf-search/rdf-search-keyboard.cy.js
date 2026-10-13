import {RdfSearchSteps} from "../../steps/rdf-search/rdf-search-steps";
import {BaseSteps} from "../../steps/base-steps";

describe('RDF Search keyboard access', () => {
  beforeEach(() => {
    // Given, I visit the RDF search page
    RdfSearchSteps.visit();
    RdfSearchSteps.getSearchIconButton().should('be.visible');
  });

  it('should open the search area with the keyboard and focus the input', () => {
    // Then, the search icon should be a named button
    RdfSearchSteps.getSearchIconButton().should('have.attr', 'aria-label', 'Search RDF resources');
    // And, the closed search area should be out of the tab order
    RdfSearchSteps.getSearchArea().should('have.attr', 'inert');

    // When, I activate the search icon with the keyboard
    RdfSearchSteps.focusSearchIconButton();
    BaseSteps.pressEnter();

    // Then, the search area should be open
    RdfSearchSteps.getSearchArea().should('be.visible').and('not.have.attr', 'inert');
    // And, the focus should be in the search input
    RdfSearchSteps.getInputField().should('be.focused');
  });

  it('should close the search area with the close button and return the focus to the search icon', () => {
    // Given, I opened the search area with the keyboard
    RdfSearchSteps.focusSearchIconButton();
    BaseSteps.pressEnter();
    RdfSearchSteps.getInputField().should('be.focused');

    // Then, the close button should be a named button
    RdfSearchSteps.getCloseButton().should('have.attr', 'aria-label', 'Close search');

    // When, I activate the close button with the keyboard
    RdfSearchSteps.focusCloseButton();
    BaseSteps.pressEnter();

    // Then, the search area should be closed
    RdfSearchSteps.getSearchArea().should('have.attr', 'inert');
    // And, the focus should be back on the search icon
    RdfSearchSteps.getSearchIconButton().should('be.focused');
  });

  it('should close the search area on Escape and return the focus to the search icon', () => {
    // Given, I opened the search area with the keyboard
    RdfSearchSteps.focusSearchIconButton();
    BaseSteps.pressEnter();
    RdfSearchSteps.getInputField().should('be.focused');

    // When, I press Escape
    BaseSteps.pressEscape();

    // Then, the search area should be closed
    RdfSearchSteps.getSearchArea().should('have.attr', 'inert');
    // And, the focus should be back on the search icon
    RdfSearchSteps.getSearchIconButton().should('be.focused');
  });

  it('should clear the input with the keyboard', () => {
    // Given, I opened the search area and typed something
    RdfSearchSteps.disableAutocomplete();
    RdfSearchSteps.focusSearchIconButton();
    BaseSteps.pressEnter();
    RdfSearchSteps.typeInSearchInput('test');

    // Then, the clear button should be a named button
    RdfSearchSteps.getClearInputButton().should('have.attr', 'aria-label', 'Clear');

    // When, I activate the clear button with the keyboard
    RdfSearchSteps.focusClearInputButton();
    BaseSteps.pressEnter();

    // Then, the input should be empty and focused
    RdfSearchSteps.getInputField()
      .should('have.value', '')
      .and('be.focused');
  });

  it('should announce the autocomplete suggestions as a combobox', () => {
    // Given, autocomplete is enabled and the namespaces are loaded
    RdfSearchSteps.enableAutocomplete();
    RdfSearchSteps.loadNamespaces();
    RdfSearchSteps.focusSearchIconButton();
    BaseSteps.pressEnter();

    // Then, the input should be a named, collapsed combobox
    RdfSearchSteps.getInputField()
      .should('have.attr', 'role', 'combobox')
      .and('have.attr', 'aria-label', 'Search RDF resources')
      .and('have.attr', 'aria-autocomplete', 'list')
      .and('have.attr', 'aria-expanded', 'false');

    // When, I type something that has suggestions
    RdfSearchSteps.typeInSearchInput('li');

    // Then, the combobox should be expanded and control the listbox of suggestions
    RdfSearchSteps.getSuggestionsListbox().should('have.attr', 'role', 'listbox');
    RdfSearchSteps.getSuggestionsListbox().invoke('attr', 'id').then((listboxId) => {
      RdfSearchSteps.getInputField()
        .should('have.attr', 'aria-expanded', 'true')
        .and('have.attr', 'aria-controls', listboxId);
    });
    RdfSearchSteps.getSuggestion(0).should('have.attr', 'role', 'option');
    // And, the highlighted suggestion should be the active descendant
    RdfSearchSteps.getSuggestion(0)
      .should('have.attr', 'aria-selected', 'true')
      .invoke('attr', 'id')
      .then((optionId) => RdfSearchSteps.getInputField().should('have.attr', 'aria-activedescendant', optionId));

    // When, I move to the next suggestion
    RdfSearchSteps.pressArrowDown();

    // Then, the next suggestion should be the active descendant
    RdfSearchSteps.getSuggestion(0).should('have.attr', 'aria-selected', 'false');
    RdfSearchSteps.getSuggestion(1)
      .should('have.attr', 'aria-selected', 'true')
      .invoke('attr', 'id')
      .then((optionId) => RdfSearchSteps.getInputField().should('have.attr', 'aria-activedescendant', optionId));
  });

  it('should keep the suggestions list out of the tab order', () => {
    // Given, I typed something that has suggestions
    RdfSearchSteps.enableAutocomplete();
    RdfSearchSteps.loadNamespaces();
    RdfSearchSteps.focusSearchIconButton();
    BaseSteps.pressEnter();
    RdfSearchSteps.typeInSearchInput('li');
    RdfSearchSteps.getSuggestion(0).should('be.visible');

    // When, I tab away from the last button in the search area
    RdfSearchSteps.focusLastSearchAreaButton();
    BaseSteps.pressTab();

    // Then, the suggestions list should not get the focus, because the input navigates it with the arrow keys
    RdfSearchSteps.getSuggestionsListbox().should('not.be.focused');
  });

  it('should move the focus from the last element to the close button with Tab', () => {
    // Given, I opened the search area with the keyboard
    RdfSearchSteps.disableAutocomplete();
    RdfSearchSteps.focusSearchIconButton();
    BaseSteps.pressEnter();
    RdfSearchSteps.getInputField().should('be.focused');

    // When, I tab away from the last button in the search area
    RdfSearchSteps.focusLastSearchAreaButton();
    BaseSteps.pressTab();

    // Then, the focus should move to the close button, so the search area does not cover the focused element
    RdfSearchSteps.getCloseButton().should('be.focused');
    // And, the search area should stay open
    RdfSearchSteps.getSearchArea().should('not.have.attr', 'inert');
  });

  it('should move the focus from the close button to the last element with Shift+Tab', () => {
    // Given, I opened the search area with the keyboard
    RdfSearchSteps.disableAutocomplete();
    RdfSearchSteps.focusSearchIconButton();
    BaseSteps.pressEnter();
    RdfSearchSteps.getInputField().should('be.focused');

    // When, I tab backwards from the close button, which is the first element in the search area
    RdfSearchSteps.focusCloseButton();
    BaseSteps.pressShiftTab();

    // Then, the focus should move to the last button in the search area
    RdfSearchSteps.getSearchAreaButtons().last().should('be.focused');
    // And, the search area should stay open
    RdfSearchSteps.getSearchArea().should('not.have.attr', 'inert');
  });
});
