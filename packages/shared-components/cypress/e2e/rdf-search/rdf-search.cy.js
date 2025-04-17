import {RdfSearchSteps} from "../../steps/rdf-search/rdf-search-steps";

describe('RDF Search', () => {
  beforeEach(() => {
    cy.on('window:before:load', (win) => {
      win.open = cy.stub().as('windowOpen');
      win.crypto.randomUUID = () => new Date().toISOString();
    })
  })

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
    RdfSearchSteps.getRedirectUrl().should('have.text', `redirect to /autocomplete`);

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
    // And, window.open shouldn't have been called on the prefix click.
    // It should simply expand in the input field
    cy.get('@windowOpen').should('not.be.called');

    // When, I click on a non-prefixed suggestion
    RdfSearchSteps.clickSuggestion(1);
    // Then, I expect to be redirected to the view resource page in a new tab. Because the `TABLE` button is
    // selected by default.
    const encodedSuggestionUri = 'http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23li';
    cy.get('@windowOpen').should('be.calledWith', `resource?uri=${encodedSuggestionUri}`, "_blank");

    // When, I click on the Visual view button
    RdfSearchSteps.clickButton('Visual');
    // And I select the same suggestion
    RdfSearchSteps.clickSuggestion(1);
    // Then, I expect to be redirected to the graphs-visualizations page in a new tab.
    cy.get('@windowOpen').should('be.calledWith', `graphs-visualizations?uri=${encodedSuggestionUri}`, "_blank");
  });
});
