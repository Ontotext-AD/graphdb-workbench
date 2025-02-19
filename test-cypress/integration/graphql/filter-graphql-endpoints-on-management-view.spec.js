import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";

describe('GraphQL endpoints filtering', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'graphql-endpoint-filtering-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema-planets.yaml', 'swapi-planets');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema-species.yaml', 'swapi-species');
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
        GraphqlEndpointManagementSteps.filterEndpoints('planets');
        // Then I should see only one endpoint
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 1);
        GraphqlEndpointManagementSteps.verifyEndpointInfo([
            {
                id: 'swapi-planets',
                label: 'Star Wars planets API',
                description: '',
                default: false,
                active: true,
                modified: new Date().toISOString().split('T')[0],
                types: 1,
                properties: 10
            }
        ]);
        // When I clear the filter
        GraphqlEndpointManagementSteps.clearFilter();
        // Then I should see all endpoints
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 3);
    });

    it.only('should render no results banner when all endpoints are filtered', () => {
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
