import {SparqlEditorSteps} from '../../../../steps/sparql-editor-steps';
import {YasqeSteps} from '../../../../steps/yasgui/yasqe-steps';
import {YasrSteps} from '../../../../steps/yasgui/yasr-steps';
import {QueryStubs} from '../../../../stubs/yasgui/query-stubs';
import {GraphConfigStubs} from '../../../../stubs/graph-config-stubs.js';
import {BrowserStubs} from '../../../../stubs/browser-stubs.js';

describe('"Visualize" split button', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'yasr-vizualize-split-button' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        // Given I visit a page with 'ontotex-yasgu-web-component' in it.
        SparqlEditorSteps.visitSparqlEditorPage();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should display "Visualize" split button when user execute a CONSTRUCT query', () => {
        // WHEN: I visit a page with 'ontotext-yasgui-web-component' on it, and execute select query.
        executeSelectQuery();
        // THEN: I expect the 'Visualize' button to not be visible.
        YasrSteps.getVisualizeMainButton().should('not.be.visible');

        // WHEN: I execute a CONSTRUCT query.
        executeConstructQuery();
        // THEN: I expect the 'Visualize' button to be visible.
        YasrSteps.getVisualizeMainButton().should('be.visible');

        // WHEN: I execute SELECT query again.
        executeSelectQuery();
        // THEN: I expect the 'Visualize' button to not be visible.
        YasrSteps.getVisualizeMainButton().should('not.be.visible');
    });

    it('should inform user that there no created graph configurations', () => {
        // GIVEN: There are no graph configurations.
        GraphConfigStubs.stubGetEmptyGraphConfigs();
        // AND: I visit a page with 'ontotext-yasgui-web-component' on it, and the 'Visualize' button is visible.
        executeConstructQuery();

        // WHEN: I open the dropdown.
        YasrSteps.toggleGraphConfigDropdown();
        // THEN: I expect to see message that informs that there are no graph configurations.
        YasrSteps.getNoConfigurationsMessage().should('contain.text', 'No advanced graph configuration.');

        // WHEN: I click on create link.
        BrowserStubs.stubWindowOpen();
        YasrSteps.clickCreateGraphConfigLink();
        // THEN: I expect to be navigated to graph configurations page.
        cy.get(BrowserStubs.WINDOW_OPEN_ALIAS()).should('have.been.calledWithMatch', 'graphs-visualizations', '_blank', 'noopener,noreferrer');
    });

    it('should open graphs-visualizations view when click on main button', () => {
        // GIVEN: I visit a page with 'ontotext-yasgui-web-component' on it, and the 'Visualize' button is visible.
        executeConstructQuery();

        // WHEN: I click on main button
        YasrSteps.clickOnVisualizeMainButton();
        // THEN: I expect to be navigated to graphs-visualizations view.
        cy.url().should('include', 'graphs-visualizations');
        cy.getQueryParam('query').should('include', 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>PREFIX onto: <http://www.ontotext.com/>CONSTRUCT {?source rdf:type ?destination .} WHERE {?bag rdf:type ?source .?flight rdf:type ?destination}');
        cy.getQueryParam('config').should('not.exist');
    });

    it('should open graphs-visualizations view when select a graph configuration', () => {
        // GIVEN: I visit a page with 'ontotext-yasgui-web-component' on it, and the 'Visualize' button is visible.
        executeConstructQuery();
        GraphConfigStubs.stubGetGraphConfigs();

        // WHEN: I select a graph configuration
        YasrSteps.toggleGraphConfigDropdown();
        YasrSteps.selectGraphConfig();
        // THEN: I expect to be navigated to graphs-visualizations view.
        cy.url().should('include', 'graphs-visualizations');
        cy.getQueryParam('query').should('include', 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>PREFIX onto: <http://www.ontotext.com/>CONSTRUCT {?source rdf:type ?destination .} WHERE {?bag rdf:type ?source .?flight rdf:type ?destination}');
        cy.getQueryParam('config').should('eq', 'de99fd5de7f94ef98f1875dff55fc1c9');
    });
});

const executeSelectQuery = () => {
    YasqeSteps.pasteQuery('select * where {?s ?p ?o.}');
    YasqeSteps.executeQuery();
};

const executeConstructQuery = () => {
    YasqeSteps.pasteQuery(
        'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' +
        'PREFIX onto: <http://www.ontotext.com/>' +
        'CONSTRUCT {' +
        '?source rdf:type ?destination .' +
        '} WHERE {' +
        '?bag rdf:type ?source .' +
        '?flight rdf:type ?destination' +
        '}');
    YasqeSteps.executeQuery();
};
