import HomeSteps from '../../steps/home-steps';

describe('Create repository', () => {

    beforeEach(() => {
        cy.viewport(1280, 1000);
        HomeSteps.visitAndWaitLoader();
    });

    /**
     * TODO: Fix me. Broken due to migration (Repository selector is changed)
     */
    it.skip('Test create and select new repository via home page', () => {
        HomeSteps.verifyCreateRepositoryLink();

        const repositoryId = HomeSteps.createRepo();
        // Initializing the repository to speed up retrieving repository info
        cy.initializeRepository(repositoryId);

        HomeSteps.selectRepo(repositoryId);
        HomeSteps.verifyRepositoryIsSelected(repositoryId);
        HomeSteps.hasRepositoryInfo(repositoryId);

        cy.deleteRepository(repositoryId);
    });

    // TODO: Fix me. Broken due to migration (Error: unknown)
    it.skip('Test saved SPARQL queries links on home page and confirm dialog appearance', () => {
        const repositoryId = HomeSteps.createRepo();
        HomeSteps.selectRepo(repositoryId);

        HomeSteps.verifyQueryLink('Add statements', true);
        HomeSteps.verifyQueryLink('Clear graph', true);
        HomeSteps.verifyQueryLink('Remove statements', true);
        HomeSteps.verifyQueryLink('SPARQL Select template', false);

        cy.deleteRepository(repositoryId);
    });
});
