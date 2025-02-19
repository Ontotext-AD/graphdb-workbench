import {GraphqlStubs} from "../../stubs/graphql/graphql-stubs";
import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {EditGraphqlEndpointSteps} from "../../steps/graphql/edit-graphql-endpoint-steps";
import {ApplicationSteps} from "../../steps/application-steps";

describe('Graphql: edit endpoint settings', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'create-graphql-endpoint-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
        // Visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // Ensure the endpoints list is loaded
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length.at.least', 1);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should display and edit different types dynamic form fields', () => {
        GraphqlEndpointManagementSteps.editEndpointConfiguration(0);
        EditGraphqlEndpointSteps.getDialog().should('be.visible');

        EditGraphqlEndpointSteps.getInputField(3).should('have.value', 'ANY');
        EditGraphqlEndpointSteps.fillInputField(3, 'NONE')

        EditGraphqlEndpointSteps.getBooleanField(0).should('not.be.checked');
        EditGraphqlEndpointSteps.toggleBooleanField(0);

        // There is no select field in the data
        // EditGraphqlEndpointSteps.getSelectField(0).should('have.value', 'Two');
        // EditGraphqlEndpointSteps.selectOption(0, 'One');

        // There is no multi select field in the data
        // EditGraphqlEndpointSteps.verifyMultiSelectOptionSelected(0, 'Angular', 'JavaScript');
        // EditGraphqlEndpointSteps.toggleMultiSelectOption(0, 'Angular');
        // EditGraphqlEndpointSteps.verifyMultiSelectOptionSelected(0, 'JavaScript');

        // There is no json field in the data
        // EditGraphqlEndpointSteps.getJsonField(0).should('have.value', '{"foo": "bar"}');
        // EditGraphqlEndpointSteps.clearJsonField(0);
    });

    it('should allow saving the configuration changes successfully', () => {
        GraphqlStubs.spySaveEndpointConfiguration(repositoryId, 'swapi');
        // Open the modal
        GraphqlEndpointManagementSteps.editEndpointConfiguration(0);
        EditGraphqlEndpointSteps.getDialog().should('be.visible');

        // Then the save button is disabled
        EditGraphqlEndpointSteps.getOKButton().should('be.disabled');

        // When I change some fields
        EditGraphqlEndpointSteps.fillInputField(3, 'NONE');
        EditGraphqlEndpointSteps.toggleBooleanField(0);

        // Then the save button is enabled
        EditGraphqlEndpointSteps.getOKButton().should('be.enabled');

        // Submit the form
        EditGraphqlEndpointSteps.clickOKButton();
        EditGraphqlEndpointSteps.getSavingLoader().should('be.visible');
        cy.wait('@save-endpoint-configuration').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                "options": {
                    "enableTypeCount": true,
                    "enableCollectionCount": false,
                    "compactErrorMessages": false,
                    "langFetch": null,
                    "langValidate": null,
                    "langImplicit": null,
                    "langDefaultNameFetch": "NONE",
                    "langAppendDefaultNameFetch": "true",
                    "includeInferred": true,
                    "expandOwlSameAs": true,
                    "enableMutations": null,
                    "defaultRole": "defaultRole",
                    "enableGraphQLExplain": true,
                    "exposeSomlInGraphQL": false,
                    "disabledChecks": null,
                    "defaultIntegrationRole": "Federation_SystemRole",
                    "queryPrefix": null,
                    "mutationPrefix": null
                }
            });
        });

        // Modal should close after successful save
        EditGraphqlEndpointSteps.getDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
    });

    it('should show an error message if saving configuration fails', () => {
        // Force the stub for save configuration to fail
        GraphqlStubs.stubSaveEndpointConfiguration(repositoryId, 'swapi', 1000, true);

        // Open the modal
        GraphqlEndpointManagementSteps.editEndpointConfiguration(0);
        EditGraphqlEndpointSteps.getDialog().should('be.visible');

        // Fill in a field to allow form submission
        EditGraphqlEndpointSteps.fillInputField(0, 'ANY');

        // Submit the form
        EditGraphqlEndpointSteps.clickOKButton();
        EditGraphqlEndpointSteps.getSavingLoader().should('be.visible');

        // I see a toast error
        ApplicationSteps.getErrorNotifications().should('be.visible');

        // The modal remains open after failure
        EditGraphqlEndpointSteps.getSavingLoader().should('not.exist');
        EditGraphqlEndpointSteps.getDialog().should('be.visible');
    });

    it('should close the modal when cancel is clicked', () => {
        GraphqlEndpointManagementSteps.editEndpointConfiguration(0);
        EditGraphqlEndpointSteps.getDialog().should('be.visible');

        // Click cancel
        EditGraphqlEndpointSteps.cancel();

        // Verify that the modal is dismissed
        EditGraphqlEndpointSteps.getDialog().should('not.exist');
    });
});
