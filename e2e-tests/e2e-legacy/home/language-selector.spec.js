import HomeSteps from '../../steps/home-steps';

/**
 * TODO: Fix me. Broken due to migration (The language selector is changed)
 */
describe.skip('Language selector', () => {

    beforeEach(() => {
        cy.viewport(1280, 1000);
        HomeSteps.visitAndWaitLoader();
    });

    it('Should be able to change the language', () => {
        cy.get('#languageGroupDrop')
            .should('be.visible')
            .click()
            .then(() => {
                cy.get('.dropdown-menu .dropdown-item')
                    .should('have.length.at.least', 1);
            });
    });
});
