import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {ApplicationSteps} from "../../steps/application-steps";

describe('Graphql: delete endpoint', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'graphql-endpoint-management-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should be able to delete graphql endpoint', () => {
        // Given I have a repository with active GraphQL endpoint
        // And I have visited the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        GraphqlEndpointManagementSteps.getView().should('be.visible');
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 1);
        // When I click on the delete endpoint button
        GraphqlEndpointManagementSteps.deleteEndpoint(0);
        // Then I should see the confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I reject the confirmation dialog
        ModalDialogSteps.cancel();
        // Then Confirmation dialog should be closed
        ModalDialogSteps.getDialog().should('not.exist');
        // And the endpoint should not be deleted
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 1);

        // When I click on the delete endpoint button again and confirm the deletion
        GraphqlEndpointManagementSteps.deleteEndpoint(0);
        ModalDialogSteps.confirm();
        // Then I should see a success toast
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        // And the endpoint should be deleted and the no results row should be visible
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 1);
        GraphqlEndpointManagementSteps.getNoResultsRow().should('be.visible');
    });
});
