import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {GraphqlStubs} from "../../stubs/graphql/graphql-stubs";

describe('GraphQL endpoints filtering', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'graphql-endpoint-filtering-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        // TODO: remove stubs and enable next imports when REST API is ready
        // cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        // cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
        GraphqlStubs.stubGetEndpointsInfo(repositoryId);
        GraphqlStubs.stubGetEndpoints(repositoryId, 'graphql-swapi-endpoints.json');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should be able to filter endpoints', () => {
        // Given I have a repository with active GraphQL endpoints
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // Then I should see all endpoints
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 3);
        // When I filter the endpoints by the term "film"
        GraphqlEndpointManagementSteps.filterEndpoints('film');
        // Then I should see only one endpoint
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 1);
        GraphqlEndpointManagementSteps.verifyEndpointInfo([
            {
                id: 'film-restricted',
                label: 'SWAPI GraphQL endpoint with restricted film relations',
                description: 'SWAPI GraphQL endpoint with restricted film relations description',
                default: true,
                active: true,
                modified: '2025-01-28',
                types: 13,
                properties: 133
            }
        ]);
        // When I clear the filter
        GraphqlEndpointManagementSteps.clearFilter();
        // Then I should see all endpoints
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 3);
    });

    it('should render no results banner when all endpoints are filtered', () => {
        // Given I have a repository with active GraphQL endpoints
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // Then I should see all endpoints
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 3);
        // And the no results banner should not be visible
        GraphqlEndpointManagementSteps.getNoResultsInTableBanner().should('not.exist');
        // When I filter the endpoints by the term "starship"
        GraphqlEndpointManagementSteps.filterEndpoints('starship');
        // Then I should see the no results banner
        GraphqlEndpointManagementSteps.getNoResultsInTableBanner().should('be.visible');
        // When I clear the filter
        GraphqlEndpointManagementSteps.clearFilter();
        // Then I should see all endpoints
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 3);
        // And the no results banner should not be visible
        GraphqlEndpointManagementSteps.getNoResultsInTableBanner().should('not.exist');
    });
});
