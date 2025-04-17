import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../../steps/yasgui/yasr-steps";

describe('Yasr Table plugin', () => {
    let repositoryId;
    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);
        // Given I visit a page with "ontotex-yasgu-web-component" in it.
        SparqlEditorSteps.visitSparqlEditorPage();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    describe('Results formatting', () => {

        it('Should format all resources as short uris when results are of type uri', {
            retries: {
                runMode: 1,
                openMode: 0
            }
        }, () => {
            // When I execute a query which return results and results type is uri.
            QueryStubs.stubDefaultQueryResponse();
            YasqeSteps.executeQuery();

            // Then I expect results to be displayed with short uri.
            YasrSteps.getResultCell(1, 2).contains('rdf:type');
            YasrSteps.getResultCell(4, 3).contains('owl:TransitiveProperty');
        });
    });
});
