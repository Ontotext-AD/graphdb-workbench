const VIEW_URL = '/graphs-visualizations';

export class GraphsVisualizationsSteps {
    static visit() {
        cy.visit(VIEW_URL);
    }

    static verifyUrl() {
        cy.url().should('include', `${Cypress.config('baseUrl')}${VIEW_URL}`);
    }
}
