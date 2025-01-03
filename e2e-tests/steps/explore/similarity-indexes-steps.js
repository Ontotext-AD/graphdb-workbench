export class SimilarityIndexesSteps {

    static visit() {
        cy.visit('/similarity');
    }

    static verifyUrl() {
        cy.url().should('eq', `${Cypress.config('baseUrl')}/similarity`);
    }

    static getSimilarityIndexRow(similarityIndexName) {
        return cy.get('.index-row').contains(similarityIndexName).parent().parent();
    }

    static getEditButton(similarityIndexName) {
        return SimilarityIndexesSteps.getSimilarityIndexRow(similarityIndexName).find('.edit-query-btn');
    }

    static getSearchTypeButton() {
        return cy.get('.search-type-btn');
    }

    static getResultTypeButton() {
        return cy.get('.result-type-btn');
    }

    static clickSearchTypeDropdown() {
        this.getSearchTypeButton().click();
    }

    static clickResultTypeDropdown() {
        this.getResultTypeButton().click();
    }

    static selectSearchTypeOption(type) {
        this.clickSearchTypeDropdown();
        cy.get('.dropdown-search-type .dropdown-item').contains(type).click();
    }

    static selectResultTypeOption(type) {
        this.clickResultTypeDropdown();
        cy.get('.dropdown-result-type .dropdown-item').contains(type).click();
    }
}
