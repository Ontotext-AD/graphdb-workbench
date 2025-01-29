import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {GraphqlStubs} from "../../stubs/graphql/graphql-stubs";
import {GraphqlPlaygroundSteps} from "../../steps/graphql/graphql-playground-steps";
import {ApplicationSteps} from "../../steps/application-steps";

describe('GraphQL endpoints management', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'graphql-endpoint-management-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        // TODO: remove stubs and enable next imports when REST API is ready
        // cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        // cy.uploadGraphqlSchema(repositoryId, 'graphql/schema/swapi-schema.yaml', 'swapi');
        GraphqlStubs.stubGetEndpointsInfo(repositoryId);
        GraphqlStubs.stubGetEndpoints(repositoryId, 'graphql-swapi-endpoints.json');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should render endpoint management view', () => {
        // Given I have a repository with active GraphQL endpoints
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // Then I should see the endpoint management view
        GraphqlEndpointManagementSteps.getView().should('be.visible');
        // And I should see the page info tooltip
        // TODO: not ready yet
        // And I should see the documentation link
        // TODO: not ready yet
        // And I should see the endpoints filter field
        GraphqlEndpointManagementSteps.getEndpointFilterField().should('be.visible');
        // And I should see the create endpoint button
        GraphqlEndpointManagementSteps.getCreateEndpointButton().should('be.visible');
        // And I should see the import endpoint schema definition button
        GraphqlEndpointManagementSteps.getImportEndpointSchemaDefinitionButton().should('be.visible');
        // And I should see the endpoint list
        GraphqlEndpointManagementSteps.getEndpointTable().should('be.visible');
    });

    it('should render no results banner when no endpoints are found for the current repository', () => {
        // Given I have a repository with no active GraphQL endpoints
        GraphqlStubs.stubGetEndpointsInfo(repositoryId, 'no-graphql-endpoints-info.json');
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // Then I should see the no results banner
        GraphqlEndpointManagementSteps.getNoResultsBanner().should('be.visible');
    });

    it('should render no results banner when endpoints are not loaded due to some error', () => {
        // Given I have a repository with active GraphQL endpoints
        // And the endpoints info cannot be loaded due to some error
        GraphqlStubs.stubGetEndpointsInfoError(repositoryId);
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // Then I should see a toast with the error message
        ApplicationSteps.getErrorNotifications().should('be.visible');
        // Then I should see the no results banner
        GraphqlEndpointManagementSteps.getNoResultsBanner().should('be.visible');
    });

    it('should render endpoints info', () => {
        // Given I have a repository with active GraphQL endpoints
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // Then I should see the endpoints info
        GraphqlEndpointManagementSteps.getEndpointTable().within(() => {
            cy.get('thead th').should('have.length', 9);
            cy.get('thead th').eq(1).should('contain', 'Id');
            cy.get('thead th').eq(2).should('contain', 'Label');
            cy.get('thead th').eq(3).should('contain', 'Default');
            cy.get('thead th').eq(4).should('contain', 'Active');
            cy.get('thead th').eq(5).should('contain', 'Modified');
            cy.get('thead th').eq(6).should('contain', 'Types');
            cy.get('thead th').eq(7).should('contain', 'Properties');
            cy.get('thead th').eq(8).should('contain', 'Actions');
        });
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 3);
        GraphqlEndpointManagementSteps.verifyEndpointInfo([
            {
                id: 'swapi',
                label: 'SWAPI GraphQL endpoint',
                description: 'SWAPI GraphQL endpoint description',
                default: false,
                active: true,
                modified: '2025-01-28',
                types: 10,
                properties: 120
            },
            {
                id: 'film-restricted',
                label: 'SWAPI GraphQL endpoint with restricted film relations',
                description: 'SWAPI GraphQL endpoint with restricted film relations description',
                default: true,
                active: true,
                modified: '2025-01-28',
                types: 13,
                properties: 133
            },
            {
                id: 'swapi-characters',
                label: 'SWAPI GraphQL endpoint for swapi characters',
                description: 'SWAPI GraphQL endpoint for swapi characters description',
                default: false,
                active: false,
                modified: '2025-01-28',
                types: 3,
                properties: 20
            }
        ]);
    });

    it('should be able to explore graphql endpoints which are active', () => {
        // Given I have a repository with active GraphQL endpoints
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // Then I expect that inactive endpoints should not be clickable
        GraphqlEndpointManagementSteps.getEndpointLink(0).should('have.prop', 'tagName', 'A');
        GraphqlEndpointManagementSteps.getEndpointLink(1).should('have.prop', 'tagName', 'A');
        GraphqlEndpointManagementSteps.getEndpointLink(2).should('have.prop', 'tagName', 'SPAN');
        // And I click on some endpoint
        GraphqlEndpointManagementSteps.exploreEndpoint(1);
        // Then I should be redirected to the GraphQL playground view
        cy.url().should('include', '/graphql/playground');
        // And the selected endpoint should be the one I clicked
        GraphqlPlaygroundSteps.getSelectedEndpoint().should('contain', 'film-restricted');
    });
});
