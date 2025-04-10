import {RdfSearchSteps} from "../../steps/rdf-search/rdf-search-steps";

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
});
