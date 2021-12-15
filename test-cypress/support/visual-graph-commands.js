Cypress.Commands.add('searchEasyVisualGraph', (searchGraph) => {
    cy.get('.search-rdf-resources > #search-resource-box > .form-control')
        .invoke('val', searchGraph)
        .trigger('change', {force: true})
        .should('have.value', searchGraph)
        .then((searchInput) => {
            cy.waitUntil(() =>
                cy.get('#auto-complete-results-wrapper')
                    .then((el) => el))
                .then(() => {
                    cy.get('.result-item.active')
                        .then((activeEl) => {
                            cy.wrap(activeEl).click();
                        });
                });
        });
});
