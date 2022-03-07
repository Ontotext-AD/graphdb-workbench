describe('Monitor Queries', () => {

    let repositoryId;

    before(() => {
        repositoryId = 'monitoring-repo' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    beforeEach(() => {
        cy.presetRepository(repositoryId);

        cy.visit('/monitor/queries');
        cy.window();

        // Wait for loaders to disappear
        cy.get('.ot-splash').should('not.be.visible');
        cy.get('.ot-loader').should('not.be.visible');
    });

    after(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Initial state ', () => {
        cy.get('.no-running-queries-alert')
            .should('be.visible')
            .and('contain', 'No running queries or updates.');
        cy.get('.pause-btn').should('be.visible');
    });
});
