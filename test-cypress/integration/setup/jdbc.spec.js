describe('JDBC configuration', () => {

    let repositoryId;

    context('No repository selected', () => {
        it('Initial error state', () => {
            cy.visit('/jdbc');
            // Repository not selected warning should be visible
            cy.get('.repository-errors').should('be.visible');
        });
    });

    context('Creating JDBC configuration', () => {
        beforeEach(() => {
            initRepositoryAndVisitJdbcView();
        });

        afterEach(() => {
            cy.deleteRepository(repositoryId);
        });

        it('Configuration table preview', () => {
            cy.visit('/jdbc');
            // SQL configuration table should be visible
            cy.get('.jdbc-list-configurations').should('be.visible');
        });
    });


    function initRepositoryAndVisitJdbcView() {
        repositoryId = 'similarity-repo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepositoryCookie(repositoryId);
    }
});
