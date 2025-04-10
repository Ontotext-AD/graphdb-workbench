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
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should render no results banner when no endpoints are found for the current repository', () => {
        // Given I have a repository with no active GraphQL endpoints
        GraphqlStubs.stubGetEndpointsInfo(repositoryId, 'no-graphql-endpoints-info.json');
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // Then I should see the no results banner
        GraphqlEndpointManagementSteps.getNoEndpointsInRepositoryBanner().should('be.visible');
    });

    context('with endpoints', () => {
        beforeEach(() => {
            cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
            cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
            cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema-planets.yaml', 'swapi-planets');
            cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema-species.yaml', 'swapi-species');
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

        it('should render no results banner when endpoints are not loaded due to some error', () => {
            // Given I have a repository with active GraphQL endpoints
            // And the endpoints info cannot be loaded due to some error
            GraphqlStubs.stubGetEndpointsInfoError(repositoryId);
            // When I visit the endpoint management view
            GraphqlEndpointManagementSteps.visit();
            // Then I should see a toast with the error message
            ApplicationSteps.getErrorNotifications().should('be.visible');
            // Then I should see the no results banner
            GraphqlEndpointManagementSteps.getNoEndpointsInRepositoryBanner().should('be.visible');
        });

        it('should render endpoints info', () => {
            // Given I have a repository with active GraphQL endpoints
            // When I visit the endpoint management view
            GraphqlEndpointManagementSteps.visit();
            // Then I should see the endpoints info
            GraphqlEndpointManagementSteps.getEndpointTable().within(() => {
                cy.get('thead th').should('have.length', 10);
                // the first column contains the status icon
                cy.get('thead th').eq(2).should('contain', 'Id');
                cy.get('thead th').eq(3).should('contain', 'Label');
                cy.get('thead th').eq(4).should('contain', 'Default');
                cy.get('thead th').eq(5).should('contain', 'Active');
                cy.get('thead th').eq(6).should('contain', 'Modified');
                cy.get('thead th').eq(7).should('contain', 'Types');
                cy.get('thead th').eq(8).should('contain', 'Properties');
                cy.get('thead th').eq(9).should('contain', 'Actions');
            });
            GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 3);
            GraphqlEndpointManagementSteps.verifyEndpointInfo([
                {
                    status: 'deleted',
                    id: 'swapi',
                    label: 'Ontotext Star Wars Ontology',
                    description: '',
                    default: true,
                    active: true,
                    modified: ApplicationSteps.getCurrentDate(),
                    types: 56,
                    properties: 68
                },
                {
                    status: 'deleted',
                    id: 'swapi-planets',
                    label: 'Star Wars planets API',
                    description: '',
                    default: false,
                    active: true,
                    modified: ApplicationSteps.getCurrentDate(),
                    types: 1,
                    properties: 10
                },
                {
                    status: 'deleted',
                    id: 'swapi-species',
                    label: 'Star Wars species API',
                    description: '',
                    default: false,
                    active: true,
                    modified: ApplicationSteps.getCurrentDate(),
                    types: 2,
                    properties: 17
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
            // This is supposed to test for a inactive endpoint, due to some error during generation for example,
            // but we can't simulate it by uploading SOML schemas. We test this in other tests.
            // GraphqlEndpointManagementSteps.getEndpointLink(2).should('have.prop', 'tagName', 'SPAN');
            GraphqlEndpointManagementSteps.getEndpointLink(2).should('have.prop', 'tagName', 'A');
            // And I click on some endpoint
            GraphqlEndpointManagementSteps.exploreEndpoint(1);
            // Then I should be redirected to the GraphQL playground view
            cy.url().should('include', '/graphql/playground');
            // And the selected endpoint should be the one I clicked
            GraphqlPlaygroundSteps.getSelectedEndpoint().should('contain', 'swapi-planets');
        });
    });
});
