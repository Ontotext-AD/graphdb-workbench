import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";

describe('Abort query', () => {

    const FILE_TO_IMPORT = 'wine.rdf';
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);

        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should abort query when click on "Abort query" button.', () => {
        // When I visit a page with "ontotext-yasgui-web-component" in it,
        // and execute a query that takes a long time.
        YasqeSteps.clearEditor();
        YasqeSteps.writeInEditor(
            'select (count(*) as ?count) where {?s ?p ?o. ?s1 ?p1 ?o1. ?s2 ?p2 ?o2. ?s3 ?p3 ?o3.}');
        YasqeSteps.executeQueryWithoutWaiteResult();

        // Then I expect to an "Abort query" button to be displayed,
        YasqeSteps.getAbortQueryButton().should('exist');
        // and button has text
        YasqeSteps.getAbortQueryButton().should('have.text', 'Abort query');

        // When I hover over the "Abort button".
        YasqeSteps.hoverOverAbortQueryButton();

        // Then I expect to see tooltip that describes what happen if click on it.
        cy.get('div[data-tippy-root]').contains('Click to abort query');

        // When I click on the button.
        YasqeSteps.getAbortQueryButton().realClick();

        // Then I expect button text to be changed.
        YasqeSteps.getAbortQueryButton().should('have.text', 'Stop has been requested');

        // When I hover over the "Stop has been requested".
        YasqeSteps.hoverOverAbortQueryButton();

        // Then I expect to see tooltip that describes what happen if click on it.
        YasguiSteps.getTooltipRoot().contains('Query was requested to abort and will be terminated on the first I/O operation');

        // When abort query finished.
        // I expect the button not be visible.
        YasqeSteps.getAbortQueryButton().should('not.be.visible');
    });
});
