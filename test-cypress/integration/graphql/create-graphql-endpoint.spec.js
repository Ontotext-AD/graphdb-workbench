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
        cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        // cy.importServerFile(repositoryId, 'ontology-and-shapes.ttl');
        // cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
        // GraphqlStubs.stubGetNoEndpointsInfo(repositoryId);
        // GraphqlStubs.stubGetEndpoints(repositoryId, 'graphql-swapi-endpoints.json');
        RepositoriesStubs.spyGetRepositories();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should be able to start graphql endpoint creation wizard - no source data', () => {
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
        // And there must be no graphql schema shapes in the source repository
        CreateGraphqlEndpointSteps.getGraphqlSchemaShapesNotFound().should('be.visible');

        // When I switch to the second schema source option
        CreateGraphqlEndpointSteps.selectOntologiesAndShaclShapesOption();
        // Then I expect the schema source to be switched to ontologies and SHACL shapes
        CreateGraphqlEndpointSteps.getOntologiesAndShaclShapesView().should('be.visible');
        CreateGraphqlEndpointSteps.getEndpointParamsForm().should('be.visible');
        // And endpoint params form should be empty
        CreateGraphqlEndpointSteps.getEndpointIdFieldInput().should('have.value', '');
        CreateGraphqlEndpointSteps.getEndpointLabelFieldInput().should('have.value', '');
        CreateGraphqlEndpointSteps.getVocabularyPrefixSelectSelectedOption().should('be.empty');

        // And Use all graphs option should be selected by default
        CreateGraphqlEndpointSteps.getSelectedGraphSource().parent().should('contain', 'Use all graphs');
        // And No graphs should be found
        CreateGraphqlEndpointSteps.getGraphsNotFound().should('be.visible');

        // When I switch to shacl shape graphs option
        CreateGraphqlEndpointSteps.selectUseShaclShapeGraphsOption();
        CreateGraphqlEndpointSteps.getShaclShapeGraphsNotFound().should('be.visible');

        // When I switch to pick graphs option
        CreateGraphqlEndpointSteps.selectPickGraphsOption();
        CreateGraphqlEndpointSteps.getPickGraphsNoGraphsFound().should('be.visible');

        // And the next button should be disabled
        CreateGraphqlEndpointSteps.getNextStepButton().should('be.disabled');
    });

    it('should be able to select graphql schema shapes and open next step', () => {
        // Given I have a repository with graphql shapes in it
        cy.importServerFile(repositoryId, 'ontology-and-shapes.ttl');
        // When I start the endpoint creation wizard
        GraphqlEndpointManagementSteps.visit();
        cy.wait('@getRepositories');
        GraphqlEndpointManagementSteps.createEndpoint();
        CreateGraphqlEndpointSteps.getView().should('be.visible');
        CreateGraphqlEndpointSteps.getSelectedSourceRepository().should('have.text', repositoryId);
        // Then the select schema source view is visible
        CreateGraphqlEndpointSteps.getActiveStep().should('contain', 'Select schema source');
        CreateGraphqlEndpointSteps.getSelectSchemaSourceView().should('be.visible');
        // And the graphql schema selector is visible
        CreateGraphqlEndpointSteps.getGraphqlSchemaSelector().should('be.visible');
        // And the graphql schema shapes are found
        CreateGraphqlEndpointSteps.getAvailableGraphqlShapes().should('have.length', 2);
        CreateGraphqlEndpointSteps.getSelectedGraphqlShapes().should('have.length', 0);
        CreateGraphqlEndpointSteps.getSelectedGraphqlShapesCountBanner().should('not.exist');
        // And I can select or deselect the graphql shapes
        CreateGraphqlEndpointSteps.selectAllGraphqlShapes();
        CreateGraphqlEndpointSteps.getAvailableGraphqlShapes().should('have.length', 0);
        CreateGraphqlEndpointSteps.getSelectedGraphqlShapes().should('have.length', 2);
        CreateGraphqlEndpointSteps.getSelectedGraphqlShapesCountBanner().should('contain', '2 GraphQL schema shapes included');
        // And the next button should be enabled because I have selected the shapes
        CreateGraphqlEndpointSteps.getNextStepButton().should('be.enabled');

        CreateGraphqlEndpointSteps.deselectAllGraphqlShapes();
        CreateGraphqlEndpointSteps.getAvailableGraphqlShapes().should('have.length', 2);
        CreateGraphqlEndpointSteps.getSelectedGraphqlShapes().should('have.length', 0);
        CreateGraphqlEndpointSteps.getSelectedGraphqlShapesCountBanner().should('not.exist');
        // And the next button should be disabled because I have not selected any shapes
        CreateGraphqlEndpointSteps.getNextStepButton().should('be.disabled');

        CreateGraphqlEndpointSteps.selectGraphqlShape(0);
        CreateGraphqlEndpointSteps.getAvailableGraphqlShapes().should('have.length', 1);
        CreateGraphqlEndpointSteps.getAvailableGraphqlShape(0).should('contain', 'Swapi GraphQL Schema');
        CreateGraphqlEndpointSteps.getSelectedGraphqlShapes().should('have.length', 1);
        CreateGraphqlEndpointSteps.getSelectedGraphqlShape(0).should('contain', 'Character GraphQL Schema');
        CreateGraphqlEndpointSteps.getSelectedGraphqlShapesCountBanner().should('contain', '1 GraphQL schema shapes included');
        CreateGraphqlEndpointSteps.deselectAllGraphqlShape(0);
        CreateGraphqlEndpointSteps.getAvailableGraphqlShapes().should('have.length', 2);
        CreateGraphqlEndpointSteps.getSelectedGraphqlShapes().should('have.length', 0);
        CreateGraphqlEndpointSteps.getSelectedGraphqlShapesCountBanner().should('not.exist');

        // And I can filter the graphql shapes
        CreateGraphqlEndpointSteps.filterSelectedGraphqlShapes('swapi');
        CreateGraphqlEndpointSteps.getAvailableGraphqlShapes().should('have.length', 1);
        CreateGraphqlEndpointSteps.getAvailableGraphqlShape(0).should('contain', 'Swapi GraphQL Schema');
        CreateGraphqlEndpointSteps.filterSelectedGraphqlShapes('non-existing');
        CreateGraphqlEndpointSteps.getAvailableGraphqlShapes().should('have.length', 0);
        CreateGraphqlEndpointSteps.clearSelectedGraphqlShapesFilter();
        CreateGraphqlEndpointSteps.getAvailableGraphqlShapes().should('have.length', 2);

        // When I select a graphql shacl shape
        CreateGraphqlEndpointSteps.selectGraphqlShape(1);
        // And I proceed to the next step
        CreateGraphqlEndpointSteps.next();
        // Then I should be on the next step
        CreateGraphqlEndpointSteps.getActiveStep().should('contain', 'Configure endpoint');
        CreateGraphqlEndpointSteps.getConfigureEndpointView().should('be.visible');
        // And I should see the cancel button
        CreateGraphqlEndpointSteps.getCancelButton().should('be.visible');
        // And I should see the back button
        CreateGraphqlEndpointSteps.getBackButton().should('be.visible');

        // When I click on the back button
        CreateGraphqlEndpointSteps.back();
        // Then I should be back on the previous step
        CreateGraphqlEndpointSteps.getActiveStep().should('contain', 'Select schema source');
        // And the graphql schema shapes should be selected as before
        CreateGraphqlEndpointSteps.getAvailableGraphqlShapes().should('have.length', 1);
        CreateGraphqlEndpointSteps.getAvailableGraphqlShape(0).should('contain', 'Character GraphQL Schema');
        CreateGraphqlEndpointSteps.getSelectedGraphqlShapes().should('have.length', 1);
        CreateGraphqlEndpointSteps.getSelectedGraphqlShape(0).should('contain', 'Swapi GraphQL Schema');
    });

    it('should be able to select graphs and endpoint properties and open next step', () => {
        // Given I have a repository with graphql shapes in it
        cy.importServerFile(repositoryId, 'ontology-and-shapes.ttl');
        // When we upload a SOML schema, two graphs are created, and we can use this to test the behavior for graphs selection
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
        // When I start the endpoint creation wizard
        GraphqlEndpointManagementSteps.visit();
        cy.wait('@getRepositories');
        GraphqlEndpointManagementSteps.createEndpoint();
        CreateGraphqlEndpointSteps.getView().should('be.visible');
        CreateGraphqlEndpointSteps.getSelectedSourceRepository().should('have.text', repositoryId);

        // When I switch to the second schema source option
        CreateGraphqlEndpointSteps.selectOntologiesAndShaclShapesOption();
        CreateGraphqlEndpointSteps.getOntologiesAndShaclShapesView().should('be.visible');
        CreateGraphqlEndpointSteps.getSelectedGraphSource().parent().should('contain', 'Use all graphs');
        // Then I should see the message that all graphs will be used
        CreateGraphqlEndpointSteps.getAllGraphsWillBeUsedMessage().should('be.visible');
        // And the next button should be disabled until endpoint params are filled
        CreateGraphqlEndpointSteps.getNextStepButton().should('be.disabled');

        // When I fill in the endpoint params
        CreateGraphqlEndpointSteps.typeEndpointId('swapi-endpoint');
        // The next button should still be disabled because there are more required fields
        CreateGraphqlEndpointSteps.getNextStepButton().should('be.disabled');
        // When I fill in the endpoint label which is optional
        CreateGraphqlEndpointSteps.typeEndpointLabel('Swapi endpoint');
        // The next button should still be disabled because there are more required fields
        CreateGraphqlEndpointSteps.getNextStepButton().should('be.disabled');
        // When I select the vocabulary prefix
        CreateGraphqlEndpointSteps.selectVocabularyPrefix('voc');
        // Then the next button should be enabled
        CreateGraphqlEndpointSteps.getNextStepButton().should('be.enabled');

        // When I switch to SHACL shape graphs option
        CreateGraphqlEndpointSteps.selectUseShaclShapeGraphsOption();
        CreateGraphqlEndpointSteps.getShaclShapeGraphsNotFound().should('be.visible');
        // And the next button should be disabled because there are no graphs to select
        CreateGraphqlEndpointSteps.getNextStepButton().should('be.disabled');

        // When I switch to pick graphs option
        CreateGraphqlEndpointSteps.selectPickGraphsOption();
        // And the next button should be disabled because no graphs are still selected
        CreateGraphqlEndpointSteps.getNextStepButton().should('be.disabled');
        // And I can select graphs
        CreateGraphqlEndpointSteps.getGraphsSelector().should('be.visible');
        CreateGraphqlEndpointSteps.getAvailableGraphs().should('have.length', 2);
        CreateGraphqlEndpointSteps.getSelectedGraphs().should('have.length', 0);
        CreateGraphqlEndpointSteps.getSelectedGraphsCountBanner().should('not.exist');
        CreateGraphqlEndpointSteps.selectAllGraphs();
        CreateGraphqlEndpointSteps.getAvailableGraphs().should('have.length', 0);
        CreateGraphqlEndpointSteps.getSelectedGraphs().should('have.length', 2);
        CreateGraphqlEndpointSteps.getSelectedGraphsCountBanner().should('contain', '2 SHACL shape graphs are included');
        CreateGraphqlEndpointSteps.getNextStepButton().should('be.enabled');

        // When I click next
        CreateGraphqlEndpointSteps.next();
        // Then I should be on the next step
        CreateGraphqlEndpointSteps.getActiveStep().should('contain', 'Configure endpoint');
        CreateGraphqlEndpointSteps.getConfigureEndpointView().should('be.visible');
        // And I should see the cancel button
        CreateGraphqlEndpointSteps.getCancelButton().should('be.visible');
        // And I should see the back button
        CreateGraphqlEndpointSteps.getBackButton().should('be.visible');
        // When I click on the back button
        CreateGraphqlEndpointSteps.back();
        // Then I should be back on the previous step
        CreateGraphqlEndpointSteps.getActiveStep().should('contain', 'Select schema source');
        CreateGraphqlEndpointSteps.getSelectedSchemaSource().parent().should('contain', 'OWL ontologies/SHACL shapes');
        CreateGraphqlEndpointSteps.getSelectedGraphSource().parent().should('contain', 'Select one or more graphs');
        CreateGraphqlEndpointSteps.getSelectedGraphs().should('have.length', 2);
        CreateGraphqlEndpointSteps.getEndpointIdFieldInput().should('have.value', 'swapi-endpoint');
        CreateGraphqlEndpointSteps.getEndpointLabelFieldInput().should('have.value', 'Swapi endpoint');
        CreateGraphqlEndpointSteps.getVocabularyPrefixSelectSelectedOption().should('have.text', 'voc');
    });

    it('should be able to configure generation settings (the second step)', () => {
        // Given I have a repository with graphql shapes in it
        cy.importServerFile(repositoryId, 'ontology-and-shapes.ttl');
        // And I started the endpoint creation wizard
        GraphqlEndpointManagementSteps.visit();
        cy.wait('@getRepositories');
        GraphqlEndpointManagementSteps.createEndpoint();
        CreateGraphqlEndpointSteps.getView().should('be.visible');
        CreateGraphqlEndpointSteps.getSelectSchemaSourceView().should('be.visible');
        CreateGraphqlEndpointSteps.getAvailableGraphqlShapes().should('have.length', 2);
        // When I select a graphql schema shape
        CreateGraphqlEndpointSteps.selectGraphqlShape(1);
        // Then I should be able to proceed to the next step
        CreateGraphqlEndpointSteps.next();
        CreateGraphqlEndpointSteps.getGenerationSettingsForm().should('be.visible');
        // And the next button should be enabled because all settings fields are available and valid initially
        CreateGraphqlEndpointSteps.getNextStepButton().should('be.enabled');
        // When I click next
        CreateGraphqlEndpointSteps.next();
        // Then I should be on the generate endpoint step
        CreateGraphqlEndpointSteps.getActiveStep().should('contain', 'Create');
        CreateGraphqlEndpointSteps.getGenerateEndpointView().should('be.visible');

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
