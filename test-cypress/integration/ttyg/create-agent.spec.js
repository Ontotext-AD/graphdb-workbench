import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {TtygAgentSettingsModalSteps} from "../../steps/ttyg/ttyg-agent-settings-modal.steps";
import {SimilarityIndexStubs} from "../../stubs/similarity-index-stubs";
import {ConnectorStubs} from "../../stubs/connector-stubs";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {RepositoriesStub} from "../../stubs/repositories-stub";
import {AlertDialogSteps} from "../../steps/alert-dialog-steps";

describe('TTYG create new agent', () => {
    const repositoryId = 'starwars';

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStub.stubBaseEndpoints(repositoryId);
        cy.presetRepository(repositoryId);
        TTYGStubs.stubAgentDefaultsGet();
    });

    it('Should be able to cancel the new agent creation on the no agents view', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When I click on the create agent button
        TTYGViewSteps.createFirstAgent();
        // Then I should see the create agent modal
        TtygAgentSettingsModalSteps.getDialog().should('be.visible');
        // When I cancel the agent creation
        TtygAgentSettingsModalSteps.cancel();
        // Then the modal should be closed and I should see the no agents view again
        TtygAgentSettingsModalSteps.getDialog().should('not.exist');
        TTYGViewSteps.getNoAgentsView().should('be.visible');
    });

    it('Should be able to create a new agent with SPARQL extraction method on the no agents view', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json', 1000);
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When I click on the create agent button
        TTYGViewSteps.createFirstAgent();
        // Then I should see the create agent modal
        TtygAgentSettingsModalSteps.getDialog().should('be.visible');
        // And the save button should be disabled because the form is not configured yet
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
        // Validate agent settings for SPARQL extraction method

        // agent name
        fillAgentName('Test Agent');

        // SPARQL extraction method settings

        // At least one extraction method must be selected
        // enable SPARQL extraction method and disable it again to check the error message for the extraction methods
        TtygAgentSettingsModalSteps.enableSparqlExtractionMethod();
        // The component here is the bootstrap collapse component, so we need to wait for the animation to finish, otherwise the test might fail randomly
        cy.wait(1000);
        TtygAgentSettingsModalSteps.getSparqlExtractionMethodPanel().should('be.visible');
        TtygAgentSettingsModalSteps.disableSparqlExtractionMethod();
        // The component here is the bootstrap collapse component, so we need to wait for the animation to finish, otherwise the test might fail randomly
        cy.wait(1000);
        TtygAgentSettingsModalSteps.getSparqlExtractionMethodPanel().should('not.exist');
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
        TtygAgentSettingsModalSteps.getExtractionMethodError().should('be.visible').and('contain', 'At least one query method must be selected');
        TtygAgentSettingsModalSteps.enableSparqlExtractionMethod();
        TtygAgentSettingsModalSteps.getExtractionMethodError().should('not.exist');
        // the save button should be disabled because the SPARQL method options are not configured yet
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
        // and there should be an error message for the SPARQL extraction method
        TtygAgentSettingsModalSteps.getSparqlExtractionMethodError().should('be.visible').and('contain', 'Select how an ontology should be fetched');
        // select the ontology graph SPARQL extraction method option
        TtygAgentSettingsModalSteps.selectSparqlMethodOntologyGraph();
        // the ontology graph default value should be visible
        TtygAgentSettingsModalSteps.getSparqlMethodOntologyGraphField().should('have.value', 'http://example.com');
        // if the value is removed, the save button should be disabled because these fields are required if the option is selected
        TtygAgentSettingsModalSteps.clearSparqlMethodOntologyGraphField();
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
        TtygAgentSettingsModalSteps.typeSparqlMethodOntologyGraphField('http://example.com/swgraph');
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.enabled');
        // select the sparql query SPARQL extraction method option
        TtygAgentSettingsModalSteps.selectSparqlMethodSparqlQuery();
        TtygAgentSettingsModalSteps.getSparqlMethodSparqlQueryField().should('have.value', 'CONSTRUCT {?s ?p ?o} WHERE {GRAPH <http://example.org/ontology> {?s ?p ?o .}}');
        // if the value is removed, the save button should be disabled because these fields are required if the option is selected
        TtygAgentSettingsModalSteps.clearSparqlMethodSparqlQueryField();
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
        TtygAgentSettingsModalSteps.typeSparqlMethodSparqlQueryField('select ?s ?p ?o where {?s ?p ?o .}');
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.enabled');
        // check the add missing namespaces checkbox
        TtygAgentSettingsModalSteps.getAddMissingNamespacesCheckbox().should('not.be.checked');
        TtygAgentSettingsModalSteps.toggleAddMissingNamespacesCheckbox();

        // Validate the other agent settings

        // gpt model
        TtygAgentSettingsModalSteps.getGptModelField().should('have.value', 'gpt-4o');
        TtygAgentSettingsModalSteps.clearGptModel();
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
        TtygAgentSettingsModalSteps.getGptModelError().should('be.visible').and('contain', 'This field is required');
        TtygAgentSettingsModalSteps.typeGptModel('gpt-4o');

        // temperature
        TtygAgentSettingsModalSteps.setTemperature('0.2');
        TtygAgentSettingsModalSteps.getTemperatureSliderField().should('have.value', '0.2');

        // Top P
        TtygAgentSettingsModalSteps.getTopPField().should('have.value', '1');
        TtygAgentSettingsModalSteps.setTopP('0.2');
        TtygAgentSettingsModalSteps.getTopPField().should('have.value', '0.2');

        // Seed
        // TODO: The seed field is currently removed until backend decides to use it
        // TtygAgentSettingsModalSteps.getSeedField().should('have.value', '0');
        // // The seed field is optional, so the save button should be enabled
        // TtygAgentSettingsModalSteps.clearSeed();
        // TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.enabled');
        // TtygAgentSettingsModalSteps.typeSeed('2');

        // Validate the advanced settings

        // System instructions
        TtygAgentSettingsModalSteps.getSystemInstructionsField().should('have.value', '');

        // User instructions
        TtygAgentSettingsModalSteps.getUserInstructionsField().should('have.value', 'If you need to write a SPARQL query, use only the classes and properties provided in the schema and don\'t invent or guess any. Always try to return human-readable names or labels and not only the IRIs. If SPARQL fails to provide the necessary information you can try another tool too.');

        // Save the agent
        TTYGStubs.stubAgentCreate(1000);
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-new-agent.json', 1000);
        TtygAgentSettingsModalSteps.saveAgent();
        TtygAgentSettingsModalSteps.getCreatingAgentLoader().should('be.visible');
        cy.wait('@create-agent').then((interception) => {
            assert.deepEqual(interception.request.body, {
                "id": "id",
                "name": "Test Agent",
                "repositoryId": "starwars",
                "model": "gpt-4o",
                "temperature": "0.2",
                "topP": "0.2",
                "seed": 0,
                "assistantsInstructions": {
                    "systemInstruction": "",
                    "userInstruction": "If you need to write a SPARQL query, use only the classes and properties provided in the schema and don't invent or guess any. Always try to return human-readable names or labels and not only the IRIs. If SPARQL fails to provide the necessary information you can try another tool too."
                },
                "assistantExtractionMethods": [
                    {
                        "method": "sparql_search",
                        "sparqlQuery": "select ?s ?p ?o where {?s ?p ?o .}",
                        "addMissingNamespaces": true
                    }
                ],
                "additionalExtractionMethods": [
                ]
            });
        });
        // the modal should be closed
        TtygAgentSettingsModalSteps.getDialog().should('not.exist');
        cy.wait('@get-agent-list');
        TTYGViewSteps.getNoAgentsView().should('not.exist');
        // agent list should be reloaded to show the new agent and the loading indicator should be visible
        // TODO: this doesn't work for some reason. During the agent list loading the view remains blank and then the agent list is shown
        // TTYGViewSteps.getAgentsLoadingIndicator().should('be.visible');
        // the agent should be created
        // the new agent should be visible in the agent list (there were 0 agents before, so now there should be 1)
        TTYGViewSteps.getAgents().should('have.length', 1);
        TTYGViewSteps.getAgent(0).should('contain', 'Test Agent').and('contain', 'starwars');
    });

    it('Should require FTS to be enabled for selected repository when creating agent with FTS extraction method', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        RepositoriesStubs.stubGetRepositoryConfig(repositoryId, '/repositories/get-repository-config-starwars-disabled-fts.json');
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');
        // When I click on the create agent button
        TTYGViewSteps.createFirstAgent();
        // And I select a repository
        TtygAgentSettingsModalSteps.selectRepository(repositoryId);
        // When I open the full text search extraction method panel
        TtygAgentSettingsModalSteps.toggleFTSExtractionMethodPanel();
        // Then I should see a help message for FTS not enabled
        TtygAgentSettingsModalSteps.getFtsDisabledHelp().should('be.visible');
    });

    it('Should be able to create agent with FTS extraction method', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        RepositoriesStubs.stubGetRepositoryConfig(repositoryId, '/repositories/get-repository-config-starwars-enabled-fts.json');
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When I click on the create agent button
        TTYGViewSteps.createFirstAgent();
        // And I fill in the agent name
        TtygAgentSettingsModalSteps.typeAgentName('Test Agent');
        // And I select a repository
        TtygAgentSettingsModalSteps.selectRepository(repositoryId);
        // When I open the full text search extraction method panel
        // The save button should be disabled because the FTS extraction method is not enabled
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
        // And I enable the FTS extraction method
        TtygAgentSettingsModalSteps.enableFtsExtractionMethod();
        // The save button should be enabled
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.enabled');
        // When I save the agent
        TTYGStubs.stubAgentCreate();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-new-agent.json');
        TtygAgentSettingsModalSteps.saveAgent();
        cy.wait('@create-agent');
        // the modal should be closed
        TtygAgentSettingsModalSteps.getDialog().should('not.exist');
        cy.wait('@get-agent-list');
        // and the agent should be created
        TTYGViewSteps.getNoAgentsView().should('not.exist');
        // the new agent should be visible in the agent list (there were 0 agents before, so now there should be 1)
        TTYGViewSteps.getAgents().should('have.length', 1);
        TTYGViewSteps.getAgent(0).should('contain', 'Test Agent').and('contain', 'starwars');
    });

    it('Should require similarity index in order to create agent with similarity search method', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        SimilarityIndexStubs.stubGetSimilarityIndexes('/similarity/get-similarity-indexes-0.json');
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When I click on the create agent button
        TTYGViewSteps.createFirstAgent();
        // When I select the similarity search extraction method
        TtygAgentSettingsModalSteps.enableSimilaritySearchMethodPanel();
        // Then I should see a help message for similarity index missing
        TtygAgentSettingsModalSteps.getSimilaritySearchIndexMissingHelp().should('be.visible');
        // And the agent save button should be disabled because the similarity index method is not configured yet
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
    });

    it('Should be able to configure and create agent with similarity index search method', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        SimilarityIndexStubs.stubGetSimilarityIndexes();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When I click on the create agent button
        TTYGViewSteps.createFirstAgent();
        TtygAgentSettingsModalSteps.getDialog().should('be.visible');
        TtygAgentSettingsModalSteps.typeAgentName('Test Agent');
        TtygAgentSettingsModalSteps.selectRepository(repositoryId);
        // And I enable the similarity search extraction method
        TtygAgentSettingsModalSteps.enableSimilaritySearchMethodPanel();
        // Then I expect similarity index to be selected
        TtygAgentSettingsModalSteps.getSimilarityIndexField().should('have.value', '0');
        // Then agent save button should be enabled
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.enabled');
        // When I set the similarity index threshold
        TtygAgentSettingsModalSteps.getSimilarityIndexThresholdField().should('have.value', '0.6');
        TtygAgentSettingsModalSteps.setSimilarityIndexThreshold('0.8');
        // And I set the max triples per call
        TtygAgentSettingsModalSteps.getSimilarityIndexMaxTriplesField().should('have.value', '');
        TtygAgentSettingsModalSteps.setSimilarityIndexMaxTriples('100');
        // When I save the agent
        TTYGStubs.stubAgentCreate();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-new-agent.json');
        TtygAgentSettingsModalSteps.saveAgent();
        cy.wait('@create-agent');
        // the modal should be closed
        TtygAgentSettingsModalSteps.getDialog().should('not.exist');
        cy.wait('@get-agent-list');
        // and the agent should be created
        TTYGViewSteps.getNoAgentsView().should('not.exist');
        // the new agent should be visible in the agent list (there were 0 agents before, so now there should be 1)
        TTYGViewSteps.getAgents().should('have.length', 1);
        TTYGViewSteps.getAgent(0).should('contain', 'Test Agent').and('contain', 'starwars');
    });

    it('Should require retrieval connector in order to create an agent with GPT retrieval connector method', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        ConnectorStubs.stubGetConnectors();
        ConnectorStubs.stubGetRetrievalConnector('/connectors/get-retrieval-connector-0.json');
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When I click on the create agent button
        TTYGViewSteps.createFirstAgent();
        TtygAgentSettingsModalSteps.getDialog().should('be.visible');
        TtygAgentSettingsModalSteps.typeAgentName('Test Agent');
        TtygAgentSettingsModalSteps.selectRepository(repositoryId);
        // When I select and open the GPT retrieval connector method panel
        TtygAgentSettingsModalSteps.enableRetrievalMethodPanel();
        // Then I should see the missing connector help message
        TtygAgentSettingsModalSteps.getMissingRetrievalConnectorHelp().should('be.visible');
        // And the save button should be disabled
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
    });

    it('Should be able to configure and create an agent with retrieval connector method', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        ConnectorStubs.stubGetConnectors();
        ConnectorStubs.stubGetRetrievalConnector();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When I click on the create agent button
        TTYGViewSteps.createFirstAgent();
        TtygAgentSettingsModalSteps.getDialog().should('be.visible');
        TtygAgentSettingsModalSteps.typeAgentName('Test Agent');
        TtygAgentSettingsModalSteps.selectRepository(repositoryId);
        // When I select and open the GPT retrieval connector method panel
        TtygAgentSettingsModalSteps.enableRetrievalMethodPanel();
        // Then I expect retrieval connector to be selected
        TtygAgentSettingsModalSteps.getRetrievalConnectorField().should('have.value', '0');
        // Then the save button should be enabled
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.enabled');
        // When I remove the query template
        TtygAgentSettingsModalSteps.getQueryTemplateField().should('have.value', '{"query": "string"}');
        TtygAgentSettingsModalSteps.clearQueryTemplate();
        // Then the save button should be disabled
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
        // And I set the query template
        TtygAgentSettingsModalSteps.typeQueryTemplate('{"query": "string"}');
        // Then the save button should be enabled
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.enabled');
        // When I set the max triples per call
        TtygAgentSettingsModalSteps.getRetrievalMaxTriplesField().should('have.value', '');
        TtygAgentSettingsModalSteps.setRetrievalMaxTriples('100');
        // When I save the agent
        TTYGStubs.stubAgentCreate();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-new-agent.json');
        TtygAgentSettingsModalSteps.saveAgent();
        cy.wait('@create-agent');
        // the modal should be closed
        TtygAgentSettingsModalSteps.getDialog().should('not.exist');
        cy.wait('@get-agent-list');
        // and the agent should be created
        TTYGViewSteps.getNoAgentsView().should('not.exist');
        // the new agent should be visible in the agent list (there were 0 agents before, so now there should be 1)
        TTYGViewSteps.getAgents().should('have.length', 1);
        TTYGViewSteps.getAgent(0).should('contain', 'Test Agent').and('contain', 'starwars');
    });

    it('Should updates the ChatGPT form field when the repository is changed', () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        ConnectorStubs.stubGetConnectors();
        ConnectorStubs.stubTTYGChatGPTConnectors();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');

        // When I click on the create agent button
        TTYGViewSteps.createFirstAgent();
        // Then I expect the selected repository to be set as the repository ID in the form.
        TtygAgentSettingsModalSteps.verifyRepositorySelected('starwars');
        // and all options are exclusively for GraphDB repositories.
        TtygAgentSettingsModalSteps.verifyRepositoryOptionNotExist('Fedx_repository');
        TtygAgentSettingsModalSteps.verifyRepositoryOptionNotExist('Ontop_repository');

        // When I open ChatGPT retrieval connector panel
        TtygAgentSettingsModalSteps.enableRetrievalMethodPanel();
        // Then I expect to see the first connector selected.
        TtygAgentSettingsModalSteps.verifyRetrievalConnectorSelected('ChatGPT_starwars_one');

        // When I select another repository that have retrieval connectors
        TtygAgentSettingsModalSteps.selectRepository('biomarkers');
        // Then I expect to see the first connector from new repository selected.
        TtygAgentSettingsModalSteps.verifyRetrievalConnectorSelected('ChatGPT_biomarkers_one');

        // When I select a repository that not have retrieval connectors
        TtygAgentSettingsModalSteps.selectRepository('ttyg-repo-1725518186812');
        // Then I expect help message to be open
        TtygAgentSettingsModalSteps.getMissingRetrievalConnectorHelp().should('be.visible');

        // When I click on help menu
        TtygAgentSettingsModalSteps.clickOnMissingRetrievalConnectorHelp();
        // Then I expect a confirm dialog displayed.
        ModalDialogSteps.getDialogBody().contains('If you proceed with creating the ChatGPT Retrieval connector, GraphDB will open in a new tab and switch to the ttyg-repo-1725518186812 repository.');
    });

    it('Should updates the similarity form field when the repository is changed', () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        ConnectorStubs.stubGetConnectors();
        SimilarityIndexStubs.stubTTYGSimilarityIndexes();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');

        // When I click on the create agent button
        TTYGViewSteps.createFirstAgent();
        // Then I expect the selected repository to be set as the repository ID in the form.
        TtygAgentSettingsModalSteps.verifyRepositorySelected('starwars');

        // When I open Similarity index name panel
        TtygAgentSettingsModalSteps.enableSimilaritySearchMethodPanel();
        // Then I expect to see the first index selected.
        TtygAgentSettingsModalSteps.verifySimilarityIndexSelected('similarity_index_starwars_one');

        // When I select another repository that have similarity connectors
        TtygAgentSettingsModalSteps.selectRepository('biomarkers');
        // Then I expect to see the first similarity index from new repository selected.
        TtygAgentSettingsModalSteps.verifySimilarityIndexSelected('similarity_index_biomarkers_one');

        // When I select a repository that not have similarity indexes
        TtygAgentSettingsModalSteps.selectRepository('ttyg-repo-1725518186812');
        // Then I expect help message to be open
        TtygAgentSettingsModalSteps.getSimilaritySearchIndexMissingHelp().should('be.visible');

        // When I click on help menu
        TtygAgentSettingsModalSteps.clickOnSimilaritySearchIndexMissingHelp();
        // Then I expect a confirm dialog displayed.
        ModalDialogSteps.getDialogBody().contains('If you proceed with creating the similarity index, GraphDB will open in a new tab and switch to the ttyg-repo-1725518186812 repository.');
    });

    it('Should warn the user when temperature is set above given treshold', () => {
        RepositoriesStubs.stubGetRepositoryConfig(repositoryId, '/repositories/get-repository-config-starwars-enabled-fts.json');
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When I open the agent settings dialog
        TTYGViewSteps.createFirstAgent();
        TtygAgentSettingsModalSteps.typeAgentName('Test Agent');
        // Then I expect that the high temperature warning is not visible
        TtygAgentSettingsModalSteps.getTemperatureWarning().should('not.exist');
        TtygAgentSettingsModalSteps.getTemperatureField().should('not.have.class', 'has-warning');
        // And I change the temperature to value above 1.0
        TtygAgentSettingsModalSteps.setTemperature('1.2');
        TtygAgentSettingsModalSteps.getTemperatureSliderField().should('have.value', '1.2');
        // Then I should see a warning message
        TtygAgentSettingsModalSteps.getTemperatureWarning().should('be.visible');
        TtygAgentSettingsModalSteps.getTemperatureField().should('have.class', 'has-warning');
        // When I change the temperature to value below 1.0
        TtygAgentSettingsModalSteps.setTemperature('0.9');
        TtygAgentSettingsModalSteps.getTemperatureSliderField().should('have.value', '0.9');
        // Then The high temperature warning should be hidden
        TtygAgentSettingsModalSteps.getTemperatureWarning().should('not.exist');
        TtygAgentSettingsModalSteps.getTemperatureField().should('not.have.class', 'has-warning');
    });

    it('Should warn the user when he changes the default value of the base instruction', () => {
        RepositoriesStubs.stubGetRepositoryConfig(repositoryId, '/repositories/get-repository-config-starwars-enabled-fts.json');
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When I open the agent settings dialog
        TTYGViewSteps.createFirstAgent();
        TtygAgentSettingsModalSteps.typeAgentName('Test Agent');
        // Then I expect that the overriding base instruction warning is not visible
        TtygAgentSettingsModalSteps.toggleAdvancedSettings();
        TtygAgentSettingsModalSteps.getSystemInstructionsWarning().should('not.exist');
        // When I change the base instruction
        TtygAgentSettingsModalSteps.typeSystemInstructions('New');
        // Then I should see a warning alert
        AlertDialogSteps.getDialog().should('be.visible');
        AlertDialogSteps.acceptAlert();
        // And the warning should be visible
        TtygAgentSettingsModalSteps.getSystemInstructionsWarning().should('be.visible');
        // When I revert the base instruction to the default value
        TtygAgentSettingsModalSteps.clearSystemInstructions();
        // Then the warning should be hidden
        TtygAgentSettingsModalSteps.getSystemInstructionsWarning().should('not.exist');
    });
});

function fillAgentName(name) {
    TtygAgentSettingsModalSteps.clearAgentName();
    TtygAgentSettingsModalSteps.typeAgentName(name);
    // the save button should be disabled because there are other required fields that are not filled in yet
    TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
    TtygAgentSettingsModalSteps.clearAgentName();
    TtygAgentSettingsModalSteps.getAgentNameError().should('be.visible').and('contain', 'This field is required');
    TtygAgentSettingsModalSteps.typeAgentName(name);
}
