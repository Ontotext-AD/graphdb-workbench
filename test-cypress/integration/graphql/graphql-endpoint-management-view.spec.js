import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {GraphqlStubs} from "../../stubs/graphql/graphql-stubs";

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

    it('should render endpoints info', () => {
        // Given I have a repository with active GraphQL endpoints
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // Then I should see the endpoints info
        GraphqlEndpointManagementSteps.getEndpointTable().within(() => {
            cy.get('thead th').should('have.length', 8);
            cy.get('thead th').eq(0).should('contain', 'Id');
            cy.get('thead th').eq(1).should('contain', 'Label');
            cy.get('thead th').eq(2).should('contain', 'Default');
            cy.get('thead th').eq(3).should('contain', 'Active');
            cy.get('thead th').eq(4).should('contain', 'Modified');
            cy.get('thead th').eq(5).should('contain', 'Types');
            cy.get('thead th').eq(6).should('contain', 'Properties');
            cy.get('thead th').eq(7).should('contain', 'Actions');
        });
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 3);
        verifyEndpointInfo([
            {
                id: '/swapi',
                label: 'SWAPI GraphQL endpoint',
                default: false,
                active: true,
                modified: '2025-01-28',
                types: 10,
                properties: 120
            },
            {
                id: '/film-restricted',
                label: 'SWAPI GraphQL endpoint with restricted film relations',
                default: true,
                active: false,
                modified: '2025-01-28',
                types: 13,
                properties: 133
            },
            {
                id: '/swapi-charcters',
                label: 'SWAPI GraphQL endpoint for swapi charcters',
                default: false,
                active: true,
                modified: '2025-01-28',
                types: 3,
                properties: 20
            }
        ]);
    });
});

function verifyEndpointInfo(endpointsInfo) {
    GraphqlEndpointManagementSteps.getEndpointsInfo().each(($row, index) => {
        const endpointInfo = endpointsInfo[index];
        cy.wrap($row).within(() => {
            cy.get('td').eq(0).should('contain', endpointInfo.id);
            cy.get('td').eq(1).should('contain', endpointInfo.label);
            cy.get('td').eq(2).should('contain', endpointInfo.default ? 'yes' : 'no');
            cy.get('td').eq(3).should('contain', endpointInfo.active ? 'yes' : 'no');
            cy.get('td').eq(4).should('contain', endpointInfo.modified);
            cy.get('td').eq(5).should('contain', endpointInfo.types);
            cy.get('td').eq(6).should('contain', endpointInfo.properties);
            cy.get('td').eq(7).find('button').should('have.length', 4);
        });
    });
}
