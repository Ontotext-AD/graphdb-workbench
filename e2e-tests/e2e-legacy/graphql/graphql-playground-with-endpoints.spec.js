import {MainMenuSteps} from "../../steps/main-menu-steps";
import HomeSteps from "../../steps/home-steps";
import {GraphqlPlaygroundSteps} from "../../steps/graphql/graphql-playground-steps";

describe('GraphQL playground with endpoints', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'graphql-playground-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema-film-restricted.yaml', 'swapi');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should render GraphQL playground with endpoints via URL', () => {
        // Given, I visit the GraphQL playground page via URL and I have endpoints
        GraphqlPlaygroundSteps.visit();
        // Then, I expect to see the GraphQL playground page
        validateGraphQlPlaygroundWithEndpoints();
    });

    it('Should render GraphQL playground with endpoints via navigation menu', () => {
        // Given, I visit the GraphQL playground page via navigation menu and I have endpoints
        HomeSteps.visit();
        MainMenuSteps.clickOnGraphQLPlayground();
        // Then, I expect to see the GraphQL playground page
        validateGraphQlPlaygroundWithEndpoints();
    });
});

function validateGraphQlPlaygroundWithEndpoints() {
    GraphqlPlaygroundSteps.getEndpointsSelectMenu().should('be.visible');
    GraphqlPlaygroundSteps.getPlayground().should('be.visible');
}
