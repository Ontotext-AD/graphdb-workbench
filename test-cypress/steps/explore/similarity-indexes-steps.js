export class SimilarityIndexesSteps {

    static visit() {
        cy.visit('/similarity');
    }

    static verifyUrl() {
        cy.url().should('eq', `${Cypress.config('baseUrl')}/similarity`);
    }
}
