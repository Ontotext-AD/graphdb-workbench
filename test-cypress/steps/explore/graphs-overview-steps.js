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
        cy.get('.export-repo-format-JSON-LD-row').contains('JSON-LD').click();
    }

    static getExportRepositoryButton() {
        return cy.get('.export-repository-btn');
    }

    static exportRepository() {
        this.getExportRepositoryButton().click();
    }

    static selectJSONLDOption() {
        cy.get('.export-repo-format-JSON-LD').eq(0).click();
    }

    static selectJSONLDMode(option) {
        cy.get('[id=wb-JSONLD-mode]').select(option);
    }

    static getTopPaginationLinks() {
        return cy.get('.top-pagination ul li a');
    }

    static getPaginations() {
        return cy.get('[paginations]');
    }

    static verifyFileExists(fileName) {
        cy.readFile('cypress/downloads/' + fileName);
    }

    static getDownloadAllButtons() {
        return cy.get('.download-all-graphs-btn');
    }

    static clickOnDownloadAllButton() {
        this.getDownloadAllButtons().click();
    }
}
