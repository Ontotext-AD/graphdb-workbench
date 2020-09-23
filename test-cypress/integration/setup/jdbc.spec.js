describe('JDBC configuration', () => {

    context('No repository selected', () => {
        it('Initial error state', () => {
            cy.visit('/jdbc');
            // Repository not selected warning should be visible
            cy.get('.repository-errors').should('be.visible');
        });
    });
});
