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

    static selectRow(row) {
        cy.get('.form-check-input').eq(row).click();
    }

    static getExportRepositoryButtonOnRow(index) {
        return cy.get('.export-graph').eq(index);
    }

    static downloadAsFromRowButton(index) {
        this.getExportRepositoryButtonOnRow(index).click();
    }

    static selectJSONLDFromRowDropdown() {
        cy.get('.dropdown-menu').find('.export-repo-format-JSON-LD').eq(1).click();
    }

    static getExportRepositoryButton() {
        return cy.get('.export-repository-btn');
    }

    static exportRepository() {
        this.getExportRepositoryButton().click();
    }

    static selectJSONLDOption() {
        cy.get('.export-repo-format-JSONLD').click();
    }

    static selectJSONLDMode(option) {
        cy.get('[id=wb-JSONLD-mode]').select(option);
    }
}
