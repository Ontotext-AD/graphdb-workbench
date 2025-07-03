import {RdfSearchSteps} from "../../steps/rdf-search/rdf-search-steps";
import {BaseSteps} from "../../steps/base-steps";
import {NavbarSteps} from "../../steps/navbar/navbar-steps";

describe('RDF Search', () => {

  it('should display RDF search', () => {
    // Given, I visit the RDF search page
    RdfSearchSteps.visit();

    // Then, I expect the RDF search icon to be visible
    RdfSearchSteps.getSearchIcon()
      .should('exist')
      .and('be.visible');
    // And it should not be opened
    RdfSearchSteps.getSearchArea().should('not.be.visible');

    // When, I hover over the search icon
    RdfSearchSteps.hoverSearchIcon();
    // Then, I expect a tooltip to appear
    RdfSearchSteps.getTooltip()
      .should('be.visible')
      .and('have.text', 'Search RDF resources');

    // When, I click on the search icon
    RdfSearchSteps.clickSearchIcon();
    // Then, I expect the RDF search area to be visible
    RdfSearchSteps.getSearchArea().should('be.visible');
    // And the search icon should not be visible
    RdfSearchSteps.getSearchIcon().should('not.exist');
    // And I should see 2 radio buttons for Table and Visual display
    const buttons = ['Table', 'Visual'];
    // And the Table button should be selected
    const classes = ['selected', ''];
    RdfSearchSteps.getSearchAreaButtons().each(($button, index) => {
      cy.wrap($button)
        .should('have.text', buttons[index])
        .and('have.class', classes[index]);
    });

    // When, I close the search area
    RdfSearchSteps.closeSearchArea();
    // Then, I expect the RDF search area to be hidden
    RdfSearchSteps.getSearchArea().should('not.be.visible');
    // And the search icon should be visible
    RdfSearchSteps.getSearchIcon().should('be.visible');
  });

  it('should search RDF resources, when autocomplete is enabled', () => {
    // Given, I visit the RDF search page
    RdfSearchSteps.visit();
    // And, I have disabled autocomplete
    RdfSearchSteps.disableAutocomplete();
    // And, load namespaces
    RdfSearchSteps.loadNamespaces();

    // When, I open the search area and type something in the input field
    RdfSearchSteps.hoverSearchIcon();
    RdfSearchSteps.clickSearchIcon();
    RdfSearchSteps.getSearchArea().should('be.visible');
    RdfSearchSteps.typeInSearchInput('test');
    // Then, I expect to see a toast notification, warning me that autocomplete is disabled
    RdfSearchSteps.getToastNotification()
      .should('be.visible')
      .and('have.text', 'Autocomplete is OFFGo to Setup -> Autocomplete');

    // When, I click on the toast notification
    RdfSearchSteps.clickToastNotification();
    // Then, I expect to not see the notification anymore
    RdfSearchSteps.getToastNotification().should('not.exist');
    // And, I expect to have been redirected to the setup page
    RdfSearchSteps.getRedirectUrl().should('have.text', `redirect to autocomplete`);

    // When, I enable autocomplete
    RdfSearchSteps.enableAutocomplete();
    // And, I open the search area and type something in the input field
    RdfSearchSteps.hoverSearchIcon();
    RdfSearchSteps.clickSearchIcon();
    RdfSearchSteps.getSearchArea().should('be.visible');
    RdfSearchSteps.typeInSearchInput('li');
    // Then, I expect to see the search results
    RdfSearchSteps.getAutocompleteResultsWrapper().should('be.visible');
    // And, the first suggestion should be prefixed
    RdfSearchSteps.getSuggestion(0).should('contain', 'PREFIX');

    // When, I click on the prefixed suggestion
    RdfSearchSteps.clickSuggestion(0);
    // Then, I expect to see the prefix expanded in the input field
    RdfSearchSteps.getInputField().should('have.value', 'http://jena.apache.org/ARQ/list#');
  });

  it('Should validate and search RDF resources with keyboard events', () => {
    // Given, I visit the RDF search page
    RdfSearchSteps.visit();
    // And, I have disabled autocomplete
    RdfSearchSteps.disableAutocomplete();
    // And, load namespaces
    RdfSearchSteps.loadNamespaces();

    // When, I open the search area and press enter on the empty input field
    RdfSearchSteps.hoverSearchIcon();
    RdfSearchSteps.clickSearchIcon();
    RdfSearchSteps.pressEnter();
    // Then, I expect to see a toast error notification, because I haven't entered anything
    RdfSearchSteps.getToastNotification()
      .should('be.visible')
      .and('contain', 'Please fill the input field!');

    // When, I type an invalid URI in the input field and press enter
    RdfSearchSteps.typeInSearchInput('invalid_uri');
    RdfSearchSteps.pressEnter();
    // Then, I expect to see a toast error notification, because the URI is not in valid format
    RdfSearchSteps.getToastNotification()
      .should('be.visible')
      .and('contain', 'Invalid IRI');

    // When, I press escape to close the search area
    RdfSearchSteps.pressEscape();
    RdfSearchSteps.getSearchArea().should('not.be.visible');
    // And the search icon should be visible
    RdfSearchSteps.getSearchIcon().should('be.visible');
  });

  it('Should load state from local storage, when search is preserved', () => {
    // Given, I visit the RDF search page
    RdfSearchSteps.visit();
    // And, I have enabled autocomplete
    RdfSearchSteps.enableAutocomplete();
    // And, load namespaces
    RdfSearchSteps.loadNamespaces();

    // When, I open the search area
    RdfSearchSteps.hoverSearchIcon();
    RdfSearchSteps.clickSearchIcon();
    // And type something in the input field
    const text = 'test';
    RdfSearchSteps.typeInSearchInput(text);
    // And, I reload the page
    RdfSearchSteps.reloadPage();
    RdfSearchSteps.loadNamespaces();

    // And, I reopen the search area
    RdfSearchSteps.hoverSearchIcon();
    RdfSearchSteps.clickSearchIcon();
    // Then, I expect to see the input field with the previously entered text
    RdfSearchSteps.getInputField().should('have.value', text);
  });
});
