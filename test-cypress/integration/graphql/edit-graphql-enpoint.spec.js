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
        // TODO: remove stubs and enable next imports when REST API is ready
        // cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        // cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
        GraphqlStubs.stubGetEndpointsInfo(repositoryId);
        GraphqlStubs.stubGetEndpoints(repositoryId, 'graphql-swapi-endpoints.json');
        GraphqlStubs.stubGetEndpointConfiguration(repositoryId, 'swapi', undefined, 1000);

        // Visit the endpoint management view
        GraphqlEndpointManagementSteps.visit();
        // Ensure the endpoints list is loaded
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length.at.least', 1);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should display and edit different types dynamic form fields', () => {
        GraphqlStubs.stubGetEndpointConfiguration(repositoryId, 'swapi', 'graphql-endpoint-configuration-types.json');
        GraphqlEndpointManagementSteps.editEndpointConfiguration(0);
        EditGraphqlEndpointSteps.getDialog().should('be.visible');

        EditGraphqlEndpointSteps.getInputField(0).should('have.value', 'strValue');
        EditGraphqlEndpointSteps.fillInputField(0, 'Foo')

        EditGraphqlEndpointSteps.getBooleanField(0).should('not.be.checked');
        EditGraphqlEndpointSteps.toggleBooleanField(0);

        EditGraphqlEndpointSteps.getSelectField(0).should('have.value', 'Two');
        EditGraphqlEndpointSteps.selectOption(0, 'One');

        EditGraphqlEndpointSteps.verifyMultiSelectOptionSelected(0, 'Angular', 'JavaScript');
        EditGraphqlEndpointSteps.toggleMultiSelectOption(0, 'Angular');
        EditGraphqlEndpointSteps.verifyMultiSelectOptionSelected(0, 'JavaScript');

        EditGraphqlEndpointSteps.getJsonField(0).should('have.value', '{"foo": "bar"}');
        EditGraphqlEndpointSteps.clearJsonField(0);
    });

    it('should allow saving the configuration changes successfully', () => {
        GraphqlStubs.stubSaveEndpointConfiguration(repositoryId, 'swapi', 1000);
        // Open the modal
        GraphqlEndpointManagementSteps.editEndpointConfiguration(0);
        EditGraphqlEndpointSteps.getDialog().should('be.visible');

        // Then the save button is disabled
        EditGraphqlEndpointSteps.getOKButton().should('be.disabled');

        // When I change some fields
        EditGraphqlEndpointSteps.fillInputField(0, 'ANY');
        EditGraphqlEndpointSteps.fillInputField(2, 'bg');
        EditGraphqlEndpointSteps.toggleBooleanField(0);
        EditGraphqlEndpointSteps.toggleBooleanField(1);

        // Then the save button is enabled
        EditGraphqlEndpointSteps.getOKButton().should('be.enabled');

        // Submit the form
        EditGraphqlEndpointSteps.clickOKButton();
        EditGraphqlEndpointSteps.getSavingLoader().should('be.visible');
        cy.wait('@save-endpoint-configuration').then((interception) => {
            expect(interception.request.body).to.deep.equal([
                {
                    "key": "enable_mutations",
                    "value": true
                },
                {
                    "key": "lang.fetch",
                    "value": "ANY"
                },
                {
                    "key": "lang.validate",
                    "value": "UNIQ"
                },
                {
                    "key": "lang.implicit",
                    "value": "bg"
                },
                {
                    "key": "lang.defaultNameFetch",
                    "value": "ANY"
                },
                {
                    "key": "lang.appendDefaultNameFetch",
                    "value": false
                },
                {
                    "key": "queryPfx",
                    "value": null
                },
                {
                    "key": "mutationPfx",
                    "value": null
                },
                {
                    "key": "search",
                    "value": null
                },
                {
                    "key": "repository",
                    "value": null
                },
                {
                    "key": "includeInferred",
                    "value": true
                },
                {
                    "key": "expandOwlSameAs",
                    "value": true
                },
                {
                    "key": "disabledChecks",
                    "value": []
                },
                {
                    "key": "defaultRole",
                    "value": "defaultRole"
                },
                {
                    "key": "defaultIntegrationRole",
                    "value": "Federation_SystemRole"
                },
                {
                    "key": "exposeSomlInGraphQL",
                    "value": false
                },
                {
                    "key": "enableCollectionCount",
                    "value": false
                },
                {
                    "key": "enableTypeCount",
                    "value": false
                },
                {
                    "key": "compactErrorMessages",
                    "value": false
                },
                {
                    "key": "enableGraphQlExplain",
                    "value": true
                }
            ]);
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

    it.only('should close the modal when cancel is clicked', () => {
        GraphqlEndpointManagementSteps.editEndpointConfiguration(0);
        EditGraphqlEndpointSteps.getDialog().should('be.visible');

        // Click cancel
        EditGraphqlEndpointSteps.cancel();

        // Verify that the modal is dismissed
        EditGraphqlEndpointSteps.getDialog().should('not.exist');
    });
});
