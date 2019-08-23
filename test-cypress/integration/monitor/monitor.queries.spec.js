describe('Monitor Queries', () => {

    let repositoryId;

    before(() => {
        repositoryId = 'monitoring-repo' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    beforeEach(() => {
        cy.presetRepositoryCookie(repositoryId);

        cy.visit('/monitor/queries');
    });

    after(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Initial state ', () => {
        cy.get('.no-running-queries-alert')
            .should('be.visible')
            .and('contain', 'No running queries or updates.');
        cy.get('.pause-btn').should('be.visible')
    });
});
