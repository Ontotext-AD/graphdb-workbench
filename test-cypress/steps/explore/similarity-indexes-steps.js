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
}
