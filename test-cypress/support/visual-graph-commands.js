Cypress.Commands.add('searchEasyVisualGraph', (searchGraph) => {
    cy.get('.search-rdf-resources > #search-resource-box > .form-control')
        .invoke('val', searchGraph)
        .trigger('change')
        .should('have.value', searchGraph)
        .then((searchInput) => {
            cy.waitUntil(() =>
                cy.get('#auto-complete-results-wrapper')
                    .each((el) => el && el.text().indexOf(searchGraph) > -1));
            cy.wrap(searchInput).type('{enter}');
        });
});
