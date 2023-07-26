export const EXPLORE_GRAPH_URL = '/rest/explore-graph';
export const GRAPH_CONFIG_URL = `${EXPLORE_GRAPH_URL}/config`;

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

Cypress.Commands.add('deleteGraphConfig', (name) => {
    cy.request({
        method: 'GET',
        url: GRAPH_CONFIG_URL
    }).then((response) => {
        const config = response.body.find((config) => config.name === name);
        if (!config) {
            return false;
        }
        return cy.request({
            method: 'DELETE',
            url: `${GRAPH_CONFIG_URL}/${config.id}`,
            // Prevent Cypress from failing the test on non-2xx status codes
            failOnStatusCode: false
        });
    }).then((response) => {
        if (response) {
            cy.waitUntil(() => response && response.status === 200);
        }
    });
});
