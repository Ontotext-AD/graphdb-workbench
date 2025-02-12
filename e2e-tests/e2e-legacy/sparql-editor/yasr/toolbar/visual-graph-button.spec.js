import {SparqlEditorSteps} from "../../../../steps/sparql-editor-steps";
import {YasqeSteps} from "../../../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../../../steps/yasgui/yasr-steps";
import {QueryStubs} from "../../../../stubs/yasgui/query-stubs";

/**
 * TODO: Fix me. Broken due to migration (Error: beforeEach)
 */
describe.skip('Visual graph button when user execute a CONSTRUCT query', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        // Given I visit a page with "ontotex-yasgu-web-component" in it.
        SparqlEditorSteps.visitSparqlEditorPage();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display a "Visual" graph button configured by user', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        // When I visit a page with "ontotext-yasgui-web-component" on it,
        // and select a CONSTRUCT query.
        YasqeSteps.executeQuery();

        // Then I expect "Visual" button to not be visible.
        YasrSteps.getVisualButton().should('not.be.visible');

        // When I execute a CONSTRUCT query.
        YasqeSteps.pasteQuery(
            'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' +
                  'PREFIX onto: <http://www.ontotext.com/>' +
                  'CONSTRUCT {' +
                    '?source rdf:type ?destination .' +
                  '}  WHERE {' +
                    '?bag rdf:type ?source .' +
                    '?flight rdf:type ?destination' +
                  '}');
        YasqeSteps.executeQuery();

        // Then I expect "Visual" button to be visible.
        YasrSteps.getVisualButton().should('be.visible');

        // When I execute SELECT query again.
        YasqeSteps.pasteQuery('select * where {?s ?p ?o.}');
        YasqeSteps.executeQuery();

        // Then I expect "Visual" button to not be visible.
        YasrSteps.getVisualButton().should('not.be.visible');
    });
});
