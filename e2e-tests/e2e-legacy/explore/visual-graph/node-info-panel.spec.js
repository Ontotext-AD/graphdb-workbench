import {VisualGraphSteps} from '../../../steps/visual-graph-steps.js';
import {ApplicationSteps} from '../../../steps/application-steps.js';

const DATA_SNIPPET =
'PREFIX ex: <http://example.org/>\n' +
'PREFIX sysont: <http://www.ontotext.com/proton/protonsys#>\n' +
'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
'ex:MyNode a ex:Thing ;\n' +
'rdfs:label "My Node" ;\n' +
'ex:description """# My Node\n\nThis is a **Markdown** literal.\n\n- item 1\n- item 2"""^^sysont:Markdown .';

describe('Node info panel', () => {
    let repositoryId;
    let graphConfigName;

    beforeEach(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        repositoryId = 'node-info-panel-' + Date.now();
        graphConfigName = 'graph-config-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importRDFTextSnippet(repositoryId, DATA_SNIPPET);
    })

    afterEach(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        cy.deleteGraphConfig(graphConfigName);
        cy.deleteRepository(repositoryId);
    });

    it('should render markdown content for literals with markdown datatype', () => {
        cy.enableAutocomplete(repositoryId);
        // Given I have opened the graphs visualizations page
        VisualGraphSteps.visit();
        // And I have created a graph config with query results
        VisualGraphSteps.getCreateCustomGraphLink().click();
        cy.url().should('include', '/config/save');
        VisualGraphSteps.typeGraphConfigName(graphConfigName);
        VisualGraphSteps.selectStartMode('node');
        VisualGraphSteps.selectStartNode('MyNode', 0);
        VisualGraphSteps.saveConfig();
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        VisualGraphSteps.getGraphConfig(graphConfigName).should('be.visible');
        // When I open the graph config
        VisualGraphSteps.openGraphConfig(graphConfigName);
        // Then I expect the graph visualization of the saved config to be opened
        cy.url().should('contain', Cypress.config('baseUrl') + '/graphs-visualizations?config=');
        VisualGraphSteps.getGraphVisualizationPane().should('be.visible');
        // When I click on the node with markdown content
        VisualGraphSteps.getCircleOfNodeByNodeId('http://example.org/MyNode').click();
        // Then node info panel should be opened
        VisualGraphSteps.getSidePanelContent().should('be.visible');
        // And the markdown typed literal should be rendered
        VisualGraphSteps.getPropertyByIndex(1).should('contain', 'This is a Markdown literal')
            .and('contain', 'item 1')
            .and('contain', 'item 2');
    });
});
