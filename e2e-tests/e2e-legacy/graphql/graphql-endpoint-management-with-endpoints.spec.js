import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import HomeSteps from "../../steps/home-steps";

describe('GraphQL endpoint management with endpoints', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'graphql-endpoint-management-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema-film-restricted.yaml', 'swapi');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should render GraphQL endpoint management with endpoints via URL', () => {
        // Given, I visit the GraphQL endpoint management page via URL and I have endpoints
        GraphqlEndpointManagementSteps.visit();
        // Then, I expect to see the GraphQL endpoint management page
        validateGraphQlEndpointManagementPageWithEndpoints();
    });

    it('Should render GraphQL endpoint management with endpoints via navigation menu', () => {
        // Given, I visit the GraphQL endpoint management page via navigation menu and I have endpoints
        HomeSteps.visit();
        MainMenuSteps.clickOnEndpointManagement();
        // Then, I expect to see the GraphQL endpoint management page
        validateGraphQlEndpointManagementPageWithEndpoints();
    });
});

function validateGraphQlEndpointManagementPageWithEndpoints() {
    GraphqlEndpointManagementSteps.getCreateEndpointButton().should('be.visible');
    GraphqlEndpointManagementSteps.getImportEndpointSchemaDefinitionButton().should('be.visible');
    GraphqlEndpointManagementSteps.getEndpointFilterField().should('be.visible');
    GraphqlEndpointManagementSteps.getEndpointTable().should('be.visible');
    GraphqlEndpointManagementSteps.getNoEndpointsInRepositoryBanner().should('not.exist');
}
