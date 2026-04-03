import {SparqlEditorSteps} from '../../../steps/sparql-editor-steps.js';
import {YasrSteps} from '../../../steps/yasgui/yasr-steps.js';
import {YasqeSteps} from '../../../steps/yasgui/yasqe-steps.js';

describe('YASR', () => {
    let repositoryId;
    let secondRepositoryId;

    beforeEach(() => {
        repositoryId = 'yasr-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
        cy.deleteRepository(secondRepositoryId);
    });

    it('should load YASR in fullscreen with plugin config from URL', () => {
        // WHEN: I visit SPARQL Query & Update page with url parameters: embedded and pluginName
        SparqlEditorSteps.visitSparqlEditorPageAndWaitForEditor(getUrl(repositoryId, 'pivotTable', true));
        // THEN: YASR is in fullscreen mode because the workbench is embedded.
        YasrSteps.getYasr().should('have.class', 'yasr-fullscreen');
        // AND: I expect the raw response plugin to be visible
        YasrSteps.getPivotTablePlugin().should('be.visible');

        // WHEN: I press the ESC key.
        YasrSteps.typeEscapeKey();
        // THEN: I see YASR results in fullscreen mode because Escape is disabled in this mode.
        YasrSteps.getYasr().should('have.class', 'yasr-fullscreen');

        // WHEN: I visit SPARQL Query & Update page with without embedded url parameter.
        SparqlEditorSteps.visitSparqlEditorPageAndWaitForEditor(getUrl(repositoryId, 'googleChart'));
        // THEN: I expect yasr to be in non-fullscreen mode
        YasrSteps.getYasr().should('not.have.class', 'yasr-fullscreen');
        // AND: I expect Google Chart plugin to be visible
        YasrSteps.getGoogleChartPlugin().should('be.visible');

        // WHEN: I visit SPARQL Query & Update page with without embedded and pluginName url parameters.
        SparqlEditorSteps.visitSparqlEditorPageAndWaitForEditor(getUrl(repositoryId));
        // THEN: I expect yasr to be in non-fullscreen mode
        YasrSteps.getYasr().should('not.have.class', 'yasr-fullscreen');
        // AND: I expect Google Chart plugin to be visible, because it was the last used plugin.
        YasrSteps.getGoogleChartPlugin().should('be.visible');

        // WHEN: I visit SPARQL Query & Update page with without embedded and pluginName url parameters.
        // AND: There are no persisted yasr data.
        cy.clearLocalStorage('yagui__graphdb-workbench-sparql-editor');
        SparqlEditorSteps.visitSparqlEditorPageAndWaitForEditor(getUrl(repositoryId));
        // THEN: I expect yasr to be in non-fullscreen mode
        YasrSteps.getYasr().should('not.have.class', 'yasr-fullscreen');
        // AND: I expect the default plugin to be visible
        YasrSteps.getExtendedTablePlugin().should('be.visible');
    });

    it('should trigger YASR fullscreen mode', () => {
        // GIVEN: I open a page that contains "ontotext-yasgui-web-component".
        SparqlEditorSteps.visitSparqlEditorPage();

        // WHEN: I execute a query.
        YasqeSteps.executeQuery();
        // THEN: I should see YASR results in non-fullscreen mode.
        YasrSteps.getYasr().should('not.have.class', 'yasr-fullscreen');

        // WHEN: I toggle to fullscreen mode.
        YasrSteps.toggleFullscreen();
        // THEN: I should see YASR results in fullscreen mode.
        YasrSteps.getYasr().should('have.class', 'yasr-fullscreen');

        // WHEN: I press the ESC key.
        YasrSteps.typeEscapeKey();
        // THEN: I should see YASR results in non-fullscreen mode, because escape is enabled when workbench is not embedded.
        YasrSteps.getYasr().should('not.have.class', 'yasr-fullscreen');
    });
});

const getUrl = (repositoryId, pluginName, embedded = false) => {
    return `repositoryId=${repositoryId}${pluginName ? ('&pluginName=' + pluginName) : ''}${embedded ? '&embedded' : ''}&query=SELECT * { ?s ?p ?o }&execute=true`;
}
