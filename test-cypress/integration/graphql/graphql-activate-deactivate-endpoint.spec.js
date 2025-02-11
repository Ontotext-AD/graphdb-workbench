import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {ApplicationSteps} from "../../steps/application-steps";

describe('GraphQL: activate and deactivate endpoint', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'graphql-endpoint-management-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema-planets.yaml', 'swapi-planets');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    // TODO: until the backend is implemented
    it.skip('should be able to activate or deactivate an endpoint', () => {
        // Given I have a repository with active GraphQL endpoints
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // And I have an active endpoint
        GraphqlEndpointManagementSteps.getEndpointActiveStateToggleCheckbox(0).should('be.checked');
        // When I deactivate the endpoint
        GraphqlEndpointManagementSteps.toggleEndpointActiveState(0);
        // Then I should see a toast with the success message
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        // And the endpoint should be deactivated
        GraphqlEndpointManagementSteps.getEndpointActiveStateToggleCheckbox(0).should('not.be.checked');

        // When I activate the endpoint
        GraphqlEndpointManagementSteps.toggleEndpointActiveState(0);
        // Then I should see a toast with the success message
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        // And the endpoint should be activated
        GraphqlEndpointManagementSteps.getEndpointActiveStateToggleCheckbox(0).should('be.checked');
    });
});
