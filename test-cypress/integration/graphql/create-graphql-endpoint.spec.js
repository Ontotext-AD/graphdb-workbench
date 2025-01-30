import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {GraphqlStubs} from "../../stubs/graphql/graphql-stubs";
import {CreateGraphqlEndpointSteps} from "../../steps/graphql/create-graphql-endpoint-steps";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";

describe('Graphql: create endpoint', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'create-graphql-endpoint-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        // TODO: remove stubs and enable next imports when REST API is ready
        // cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        // cy.uploadGraphqlSchema(repositoryId, 'graphql/schema/swapi-schema.yaml', 'swapi');
        GraphqlStubs.stubGetNoEndpointsInfo(repositoryId);
        GraphqlStubs.stubGetEndpoints(repositoryId, 'graphql-swapi-endpoints.json');
        RepositoriesStubs.spyGetRepositories();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should be able to start graphql endpoint creation wizard', () => {
        // Given I have a repository with no active GraphQL endpoints
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        cy.wait('@getRepositories');
        // Then I should see no endpoints
        GraphqlEndpointManagementSteps.getEndpointTable().should('not.exist');
        // When I click on the create endpoint button
        GraphqlEndpointManagementSteps.createEndpoint();
        // Then I should see the create endpoint wizard
        CreateGraphqlEndpointSteps.getView().should('be.visible');
        cy.url().should('include', '/graphql/endpoint/create');
        CreateGraphqlEndpointSteps.getSourceRepositorySelector().should('be.visible');
        // And the source repository should be preselected to the active repository
        CreateGraphqlEndpointSteps.getSelectedSourceRepository().should('have.text', repositoryId);
        // And the active step should be the first step
        CreateGraphqlEndpointSteps.getActiveStep().should('contain', 'Select schema source');
        CreateGraphqlEndpointSteps.getSelectSchemaSourceView().should('be.visible');
        // And the schema source should be preselected to the first option
        CreateGraphqlEndpointSteps.getSchemaSourceTypes().should('have.length', 2);
        CreateGraphqlEndpointSteps.getSelectedSchemaSource().parent().should('contain', 'GraphQL schema shapes');
    });

    it('should be able to cancel the endpoint creation wizard', () => {
        // Given I have a repository with no active GraphQL endpoints
        // When I visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        cy.wait('@getRepositories');
        // Then I should see no endpoints
        GraphqlEndpointManagementSteps.getEndpointTable().should('not.exist');
        // When I click on the create endpoint button
        GraphqlEndpointManagementSteps.createEndpoint();
        // Then I should see the create endpoint wizard
        CreateGraphqlEndpointSteps.getView().should('be.visible');
        CreateGraphqlEndpointSteps.getSelectSchemaSourceView().should('be.visible');
        CreateGraphqlEndpointSteps.getSchemaSourceTypes().should('have.length', 2);
        // When I click on the cancel button
        CreateGraphqlEndpointSteps.cancelEndpointCreation();
        // Then I should see a confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I click on the cancel button in the dialog
        ModalDialogSteps.clickOnCancelButton();
        // Then I should stay on the same page
        ModalDialogSteps.getDialog().should('not.exist');
        cy.url().should('include', '/graphql/endpoint/create');
        // When I click on the cancel button again and confirm
        CreateGraphqlEndpointSteps.cancelEndpointCreation();
        ModalDialogSteps.confirm();
        // Then I should be redirected back to the endpoint management view
        ModalDialogSteps.getDialog().should('not.exist');
        cy.url().should('include', '/graphql/endpoints');
    });
});
