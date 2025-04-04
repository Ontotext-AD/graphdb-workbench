import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {GraphqlStubs} from "../../stubs/graphql/graphql-stubs";

describe('Graphql: export endpoint definition', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'graphql-endpoint-management-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema-planets.yaml', 'swapi-planets');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should be able to export endpoint definition', () => {
        GraphqlStubs.spyExportEndpointDefinition(repositoryId, 'swapi-planets');
        // Given I have a repository with active GraphQL endpoint
        // And I have visited the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        GraphqlEndpointManagementSteps.getView().should('be.visible');
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 2);

        // When I click on the export button
        GraphqlEndpointManagementSteps.exportEndpointDefinition(1);
        // Then I expect the endpoint definition to be exported
        cy.wait('@export-endpoint-definition').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            cy.readFile('cypress/downloads/swapi-planets.yaml');
        });
    });
});
