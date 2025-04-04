import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {ApplicationSteps} from "../../steps/application-steps";
import {GraphqlPlaygroundSteps} from "../../steps/graphql/graphql-playground-steps";

describe('Graphql: set default endpoint', () => {
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

    it('should be able to change the default endpoint', () => {
        // Given I have a repository with active GraphQL endpoint
        // And I have visited the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        GraphqlEndpointManagementSteps.getView().should('be.visible');
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 2);
        // And there is a default endpoint
        GraphqlEndpointManagementSteps.getEndpointDefaultStatusRadio(0).should('be.checked');
        // When I click on the second endpoint to set it as default
        GraphqlEndpointManagementSteps.setEndpointAsDefault(1);
        // Then I should see a success toast
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        // And the default endpoint should be changed
        GraphqlEndpointManagementSteps.getEndpointDefaultStatusRadio(1).should('be.checked');
        GraphqlEndpointManagementSteps.getEndpointDefaultStatusRadio(0).should('not.be.checked');
        // When I open the GraphQL Playground
        GraphqlEndpointManagementSteps.exploreEndpoint(1);
        // Then the default endpoint should be selected by default in the playground
        GraphqlPlaygroundSteps.getView().should('be.visible');
        GraphqlPlaygroundSteps.getSelectedEndpoint().should('contain', 'film-restricted');
    });
});
