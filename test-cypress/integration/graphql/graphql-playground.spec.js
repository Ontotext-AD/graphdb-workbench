import {GraphqlPlaygroundSteps} from "../../steps/graphql/graphql-playground-steps";

describe('GraphQL Playground', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'graphql-playground-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should load GraphQL Playground', () => {
        // Given I have opened the workbench
        // When I visit the GraphQL Playground page
        GraphqlPlaygroundSteps.visitGraphqlPlaygroundPage();
        // Then I should see the GraphQL Playground component
        GraphqlPlaygroundSteps.getPlayground().should('exist').and('be.visible');
    });
});
