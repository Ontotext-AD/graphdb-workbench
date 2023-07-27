const VIEW_URL = '/graphs';

export class GraphsOverviewSteps {

    static visit() {
        cy.visit(VIEW_URL);
    }

    static verifyUrl() {
        cy.url().should('eq', `${Cypress.config('baseUrl')}${VIEW_URL}`);
    }

    static getResults() {
        return cy.get('#export-graphs').find('tbody tr');
    }

    static getResult(row = 0) {
       return GraphsOverviewSteps.getResults().eq(row);
    }

    static openGraph(row = 0) {
        GraphsOverviewSteps.getResult(row).find('td ').eq(1).find('a').click();
    }
}
