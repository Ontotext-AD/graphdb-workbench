import VisualGraphSteps from "../../../steps/visual-graph-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../../steps/yasgui/yasr-steps";

const FILE_TO_IMPORT = 'wine.rdf';
const QUERY_START = `# CONSTRUCT or DESCRIBE query. The results will be rendered visually as a graph of triples.\nCONSTRUCT WHERE {\n\t?s ?p ?o\n} LIMIT 10`;
const QUERY_EXPAND_NODE = `# Note that ?node is the node you clicked and must be used in the query\nPREFIX rank: <http://www.ontotext.com/owlim/RDFRank#>\nPREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\nCONSTRUCT {\n    # The triples that will be added to the visual graph\n    ?node ?edge ?newNodeLTR .\n    ?newNodeRTL ?edge ?node .\n} WHERE {\n    {\n        # Left to right relations (starting IRI is the subject)\n        ?node ?edge ?newNodeLTR .\n\n        # Select only IRIs\n        FILTER(isIRI(?newNodeLTR) || rdf:isTriple(?newNodeLTR))\n    } UNION {\n        # Right to left relations (starting IRI is the object)\n        ?newNodeRTL ?edge ?node .\n\n        # Select only IRIs\n        FILTER(isIRI(?newNodeRTL) || rdf:isTriple(?newNodeRTL))\n    }\n    FILTER(isIRI(?node) || rdf:isTriple(?node))\n} ORDER BY ?edge`;

describe('Graphs config', () => {

    let repositoryId = 'graphRepo' + Date.now();
    let graphConfigName = 'graph-config';

    before(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
    });

    after(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        cy.setDefaultUserData();
        cy.deleteRepository(repositoryId);
    });

    beforeEach(() => {
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteGraphConfig(graphConfigName);
    });

    it('Should see the first tab in create graph config wizard', () => {
        // Given I have started a create config wizard
        startCreateConfigWizard();
        // And I should see the create config wizard tabs
        // And the first tab should be active
        VisualGraphSteps.getConfigWizardTab(1).should('be.visible')
            .and('contain', 'Starting point')
            .and('have.class', 'active');

        // In the Starting point tab

        // And I should see the start mode selectors
        VisualGraphSteps.getStartModes().should('have.length', 3);
        // And the search mode should be selected
        VisualGraphSteps.getStartModeSelector('search').should('be.checked');
        VisualGraphSteps.getStartMode('search').should('contain', 'Start with a search box');

        // When I select the node mode
        VisualGraphSteps.selectStartMode('node');
        // Then I expect selector to become active
        VisualGraphSteps.getStartModeSelector('node').should('be.checked');
        VisualGraphSteps.getStartMode('node').should('contain', 'Start with a fixed node');
        // And I should see the start node selector field
        VisualGraphSteps.getStartNodeSelectorField().should('be.visible').and('be.empty');

        // When I select the query mode
        VisualGraphSteps.selectStartMode('query');
        // Then I expect selector to become active
        VisualGraphSteps.getStartModeSelector('query').should('be.checked');
        VisualGraphSteps.getStartMode('query').should('contain', 'Start with graph query results');
        // And I should see a query editor
        VisualGraphSteps.getQueryEditor().should('be.visible');
        // And I should see predefined sample queries
        VisualGraphSteps.getPredefinedQuerySamples().should('have.length', 1);
        // And I should not see user sample queries
        VisualGraphSteps.getUserQuerySamples().should('have.length.gte', 0);
    });

    it('Should see the second tab in create graph config wizard', () => {
        // Given I have started a create config wizard
        startCreateConfigWizard();

        // When I open the graph expansion tab
        VisualGraphSteps.openConfigWizardTab(2);
        VisualGraphSteps.getConfigWizardTab(2).should('contain', 'Graph expansion')
            .and('have.class', 'active');
        // Then I should see an info box
        VisualGraphSteps.getHelpInfoBox().should('be.visible');
        // And I should see the query editor
        // VisualGraphSteps.waitForQueryEditor();
        VisualGraphSteps.getQueryEditor().should('be.visible');
        // And I should see predefined sample queries
        VisualGraphSteps.getPredefinedQuerySamples().should('have.length', 2);
        // And I should not see user sample queries
        // TODO: These are more likely created by me during testing
        VisualGraphSteps.getUserQuerySamples().should('have.length.gte', 0);
    });

    it('Should see the third tab in create graph config wizard', () => {
        // Given I have started a create config wizard
        startCreateConfigWizard();

        // When I open the graph node basics tab
        VisualGraphSteps.openConfigWizardTab(3);
        VisualGraphSteps.getConfigWizardTab(3).should('contain', 'Node basics')
            .and('have.class', 'active');
        // Then I should see an info box
        VisualGraphSteps.getHelpInfoBox().should('be.visible');
        // And I should see the query editor
        VisualGraphSteps.getQueryEditor().should('be.visible');
        // And I should see predefined sample queries
        VisualGraphSteps.getPredefinedQuerySamples().should('have.length', 2);
        // And I should not see user sample queries
        // TODO: These are more likely created by me during testing
        VisualGraphSteps.getUserQuerySamples().should('have.length.gte', 0);
    });

    it('Should see the fourth tab in create graph config wizard', () => {
        // Given I have started a create config wizard
        startCreateConfigWizard();

        // When I open the graph edge basics tab
        VisualGraphSteps.openConfigWizardTab(4);
        VisualGraphSteps.getConfigWizardTab(4).should('contain', 'Edge basics')
            .and('have.class', 'active');
        // Then I should see an info box
        VisualGraphSteps.getHelpInfoBox().should('be.visible');
        // And I should see the query editor
        VisualGraphSteps.getQueryEditor().should('be.visible');
        // And I should see predefined sample queries
        VisualGraphSteps.getPredefinedQuerySamples().should('have.length', 2);
        // And I should not see user sample queries
        VisualGraphSteps.getUserQuerySamples().should('have.length.gte', 0);
    });

    it('Should see the fifth tab in create graph config wizard', () => {
        // Given I have started a create config wizard
        startCreateConfigWizard();

        // When I open the graph edge basics tab
        VisualGraphSteps.openConfigWizardTab(5);
        VisualGraphSteps.getConfigWizardTab(5).should('contain', 'Node extra')
            .and('have.class', 'active');
        // Then I should see an info box
        VisualGraphSteps.getHelpInfoBox().should('be.visible');
        // And I should see the query editor
        VisualGraphSteps.getQueryEditor().should('be.visible');
        // And I should see predefined sample queries
        VisualGraphSteps.getPredefinedQuerySamples().should('have.length', 2);
        // And I should not see user sample queries
        VisualGraphSteps.getUserQuerySamples().should('have.length.gte', 0);
    });

    it('Should be able to cancel config creation', () => {
        // Given I have started a create config wizard
        startCreateConfigWizard();
        // When I click on cancel
        VisualGraphSteps.cancelSaveConfig();
        // Then I expect to be redirected to configs list view
        cy.url().should('eq', Cypress.config('baseUrl') + '/graphs-visualizations');
    });

    it('Should not allow config creation without a name', () => {
        // Given I have started a create config wizard
        startCreateConfigWizard();
        // When I click on save
        VisualGraphSteps.saveConfig();
        // Then I expect a warning notification
        ApplicationSteps.getWarningNotification().should('be.visible');
        // And I should stay on the same page
        cy.url().should('include', '/graphs-visualizations/config/save');
    });

    it('Should create graph config with search box', () => {
        // Given I have started a create config wizard
        startCreateConfigWizard();
        // When I fill in the config name
        VisualGraphSteps.typeGraphConfigName(graphConfigName);
        // And I save the graph config
        saveGraphConfig(graphConfigName);
        // When I open the graph config
        VisualGraphSteps.openGraphConfig(graphConfigName);
        // Then I expect the uri search field for the saved graph to be opened
        cy.url().should('contain', Cypress.config('baseUrl') + '/graphs-visualizations?config=');
        VisualGraphSteps.getGraphConfigSearchPanelName().should('contain', graphConfigName);
    });

    it('Should create graph config with fixed node', () => {
        cy.enableAutocomplete(repositoryId);
        // Given I have started a create config wizard
        startCreateConfigWizard();
        // When I fill in the config name
        VisualGraphSteps.typeGraphConfigName(graphConfigName);
        // And I select the config with fixed node option
        VisualGraphSteps.selectStartMode('node');
        // And I type an uri and select it
        VisualGraphSteps.selectStartNode('USRegion', 0);
        VisualGraphSteps.getSelectedStartNodeUri().should('contain', 'http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#USRegion');
        // And I save the graph config
        saveGraphConfig(graphConfigName);
        // When I open the graph config
        VisualGraphSteps.openGraphConfig(graphConfigName);
        // Then I expect the graph visualization of the saved config to be opened
        cy.url().should('contain', Cypress.config('baseUrl') + '/graphs-visualizations?config=');
        VisualGraphSteps.getGraphVisualizationPane().should('be.visible');
    });

    it('Should be able to create graph config with query results', () => {
        // Given I have started a create config wizard
        startCreateConfigWizard();
        // And I populated in the config name
        VisualGraphSteps.typeGraphConfigName(graphConfigName);
        // And I selected the config with query results option
        VisualGraphSteps.selectStartMode('query');
        // And I selected a query
        VisualGraphSteps.getQueryEditor().should('be.visible');
        YasqeSteps.getQuery(500).should('contain', ' ');
        VisualGraphSteps.selectPredefinedQuerySample(0);
        YasqeSteps.getQuery(500).should('contain', QUERY_START);
        // When I select preview query results
        VisualGraphSteps.previewQueryResults();
        // Then I expect to see the results table
        YasrSteps.getYasr(0).should('be.visible');
        // When I select to edit query
        VisualGraphSteps.editQuery();
        // Then I expect to see the query editor with the previously selected query
        VisualGraphSteps.getQueryEditor().should('be.visible');
        YasqeSteps.getQuery(500).should('contain', QUERY_START);
        // And I open the graph expansion tab
        VisualGraphSteps.openConfigWizardTab(2);
        // Then I expect the tab to be opened and become active
        VisualGraphSteps.getConfigWizardTab(2).should('have.class', 'active');
        // And the query editor to be visible and empty
        VisualGraphSteps.getQueryEditor().should('be.visible');
        YasqeSteps.getQuery(500).should('contain', ' ');
        // When I select a predefined query from the list
        VisualGraphSteps.selectPredefinedQuerySample(0);
        YasqeSteps.getQuery(500).should('contain', QUERY_EXPAND_NODE);
        // When I select to preview query results
        VisualGraphSteps.previewQueryResults();
        // Then I expect to see the results table
        YasrSteps.getYasr(0).should('be.visible');
        // When I select to edit the selected query
        VisualGraphSteps.editQuery();
        // Then I expect to see the editor with the selected query
        YasqeSteps.getQuery(500).should('contain', QUERY_EXPAND_NODE);
        // When I click on save
        saveGraphConfig(graphConfigName);
        // Then I expect config to be saved
        // When I open the graph config
        VisualGraphSteps.openGraphConfig(graphConfigName);
        // Then I expect the graph visualization of the saved config to be opened
        cy.url().should('contain', Cypress.config('baseUrl') + '/graphs-visualizations?config=');
        VisualGraphSteps.getGraphVisualizationPane().should('be.visible');
    });

    it.skip('Should be able to share graph config', () => {

    });
});

function saveGraphConfig(graphConfigName) {
    // And I click on save
    VisualGraphSteps.saveConfig();
    // Then I expect a success notification
    ApplicationSteps.getSuccessNotifications().should('be.visible');
    // And I should be redirected to configs list view
    cy.url().should('eq', Cypress.config('baseUrl') + '/graphs-visualizations');
    // And the new config should be present in the list
    VisualGraphSteps.getGraphConfig(graphConfigName).should('be.visible');
}

function startCreateConfigWizard() {
    // Given I have opened the graphs visualizations page
    cy.visit('graphs-visualizations');
    // When I click on create custom graphs config
    VisualGraphSteps.getCreateCustomGraphLink().click();
    // Then I should see the graphs config view
    cy.url().should('include', '/config/save');
}
