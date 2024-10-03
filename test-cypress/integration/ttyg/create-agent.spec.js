import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {TtygAgentSettingsModalSteps} from "../../steps/ttyg/ttyg-agent-settings-modal.steps";
import {NamespaceStubs} from "../../stubs/namespace-stubs";
import {SimilarityIndexStubs} from "../../stubs/similarity-index-stubs";
import {ConnectorStubs} from "../../stubs/connector-stubs";

describe('TTYG create new agent', () => {
    const repositoryId = 'starwars';

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        cy.presetRepository(repositoryId);
        NamespaceStubs.stubNameSpaceResponse(repositoryId, '/namespaces/get-repository-starwars-namespaces.json');
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
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');
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
        TtygAgentSettingsModalSteps.getSparqlExtractionMethodPanel().should('not.be.visible');
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

        // Validate the other agent settings

        // gpt model
        TtygAgentSettingsModalSteps.getGptModelField().should('have.value', 'gpt-4o');
        TtygAgentSettingsModalSteps.clearGptModel();
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
        TtygAgentSettingsModalSteps.getGptModelError().should('be.visible').and('contain', 'This field is required');
        TtygAgentSettingsModalSteps.typeGptModel('gpt-4o');

        // temperature
        TtygAgentSettingsModalSteps.getTemperatureField().should('have.value', '0.7');
        TtygAgentSettingsModalSteps.setTemperature('0.2');
        TtygAgentSettingsModalSteps.getTemperatureField().should('have.value', '0.2');

        // Top P
        TtygAgentSettingsModalSteps.getTopPField().should('have.value', '1');
        TtygAgentSettingsModalSteps.setTopP('0.2');
        TtygAgentSettingsModalSteps.getTopPField().should('have.value', '0.2');

        // Seed
        TtygAgentSettingsModalSteps.getSeedField().should('have.value', '0');
        // The seed field is optional, so the save button should be enabled
        TtygAgentSettingsModalSteps.clearSeed();
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.enabled');
        TtygAgentSettingsModalSteps.typeSeed('2');

        // Validate the advanced settings

        // System instructions
        TtygAgentSettingsModalSteps.getSystemInstructionsField().should('have.value', 'You are a helpful, knowledgeable, and friendly assistant. Your goal is to provide clear and accurate information while being polite, respectful, and professional.');

        // User instructions
        TtygAgentSettingsModalSteps.getUserInstructionsField().should('have.value', 'If you need to write a SPARQL query, use only the classes and properties provided in the schema and don\'t invent or guess any. Always try to return human-readable names or labels and not only the IRIs. If SPARQL fails to provide the necessary information you can try another tool too.');

        // Save the agent
        // stub the agent create request
        TTYGStubs.stubAgentCreate();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-new-agent.json');
        TtygAgentSettingsModalSteps.saveAgent();
        // the modal should be closed and the agent should be created
        TtygAgentSettingsModalSteps.getDialog().should('not.exist');
        TTYGViewSteps.getNoAgentsView().should('not.exist');
        // the new agent should be visible in the agent list (there were 4 agents before, so now there should be 5)
        TTYGViewSteps.getAgents().should('have.length', 5);
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
        // the modal should be closed and the agent should be created
        TtygAgentSettingsModalSteps.getDialog().should('not.exist');
        TTYGViewSteps.getNoAgentsView().should('not.exist');
        // the new agent should be visible in the agent list (there were 4 agents before, so now there should be 5)
        TTYGViewSteps.getAgents().should('have.length', 5);
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
        TtygAgentSettingsModalSteps.getSimilarityIndexMaxTriplesField().should('have.value', '0');
        TtygAgentSettingsModalSteps.setSimilarityIndexMaxTriples('100');
        // When I save the agent
        TTYGStubs.stubAgentCreate();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-new-agent.json');
        TtygAgentSettingsModalSteps.saveAgent();
        // the modal should be closed and the agent should be created
        TtygAgentSettingsModalSteps.getDialog().should('not.exist');
        TTYGViewSteps.getNoAgentsView().should('not.exist');
        // the new agent should be visible in the agent list (there were 4 agents before, so now there should be 5)
        TTYGViewSteps.getAgents().should('have.length', 5);
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
        TtygAgentSettingsModalSteps.getRetrievalMaxTriplesField().should('have.value', '0');
        TtygAgentSettingsModalSteps.setRetrievalMaxTriples('100');
        // When I save the agent
        TTYGStubs.stubAgentCreate();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-new-agent.json');
        TtygAgentSettingsModalSteps.saveAgent();
        // the modal should be closed and the agent should be created
        TtygAgentSettingsModalSteps.getDialog().should('not.exist');
        TTYGViewSteps.getNoAgentsView().should('not.exist');
        // the new agent should be visible in the agent list (there were 4 agents before, so now there should be 5)
        TTYGViewSteps.getAgents().should('have.length', 5);
        TTYGViewSteps.getAgent(0).should('contain', 'Test Agent').and('contain', 'starwars');
    });
});

function fillAgentName(name) {
    TtygAgentSettingsModalSteps.typeAgentName(name);
    // the save button should be disabled because there are other required fields that are not filled in yet
    TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.disabled');
    TtygAgentSettingsModalSteps.clearAgentName();
    TtygAgentSettingsModalSteps.getAgentNameError().should('be.visible').and('contain', 'This field is required');
    TtygAgentSettingsModalSteps.typeAgentName(name);
}
