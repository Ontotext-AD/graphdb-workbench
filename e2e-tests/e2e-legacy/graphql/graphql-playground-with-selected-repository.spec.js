import HomeSteps from "../../steps/home-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import {GraphqlPlaygroundSteps} from "../../steps/graphql/graphql-playground-steps";

describe('GraphQL playground with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'graphql-playground-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should render GraphQL playground with selected repository via URL', () => {
        // Given, I visit the GraphQL playground page via URL and I have a selected repository
        GraphqlPlaygroundSteps.visit();
        // Then, I expect to see the GraphQL no schemas alert, because I don't have any endpoints
        validateSelectedRepository();
    });

    it('Should render GraphQL playground with selected repository via navigation menu', () => {
        // Given, I visit the GraphQL playground page via navigation menu and I have a selected repository'
        HomeSteps.visit();
        MainMenuSteps.clickOnGraphQLPlayground();
        // Then, I expect to see the GraphQL no schemas alert, because I don't have any endpoints
        validateSelectedRepository();
    });
});

function validateSelectedRepository() {
    GraphqlPlaygroundSteps.getNoSchemasAlert()
        .should('be.visible')
        .and('contain', 'No active endpoints found in the current repository. Manage the GraphQL schemas here');
}
