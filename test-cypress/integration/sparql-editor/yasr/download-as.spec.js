import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasrSteps} from "../../../steps/yasgui/yasr-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";

describe('Download results', () => {
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

    it('Should be able to download result as a file', () => {
        QueryStubs.stubDownloadAsJSONResponse(repositoryId);
        YasqeSteps.executeQuery();
        YasrSteps.getDownloadAsDropdown().should('be.visible');
        YasrSteps.downloadAs(0);
        cy.wait('@download').its('request.body').should('equal', 'query=select%20*%20where%20%7B%20%20%0A%20%3Fs%20%3Fp%20%3Fo%20.%20%0A%20%7D%20limit%20100&infer=true&sameAs=true&offset=0&limit=1001')
    });

    context('DownloadAs button', () => {
        it('should not be visible if query is not ran', () => {
            // When yasr has not result
            // Then download dropdown should not be visible.
            YasrSteps.getDownloadAsDropdown().should('not.be.visible');
        });

        it('Should "Download as" dropdown be visible if there is results', () => {
            // When execute a query witch returns results.
            YasqeSteps.executeQuery();

            // Then "Download as" dropdown should be visible.
            YasrSteps.getDownloadAsDropdown().should('be.visible');
        });

        it('should contains following dropdown option.', () => {
            // When execute a query witch returns results.
            YasqeSteps.executeQuery();
            // And open the download button.
            YasrSteps.openDownloadAsDropdown();

            // Then expect follow options to be present.
            YasrSteps.getDownloadAsOption(0).contains('JSON');
            YasrSteps.getDownloadAsOption(1).contains( 'JSON*');
            YasrSteps.getDownloadAsOption(2).contains( 'XML');
            YasrSteps.getDownloadAsOption(3).contains( 'XML*');
            YasrSteps.getDownloadAsOption(4).contains( 'CSV');
            YasrSteps.getDownloadAsOption(5).contains( 'TSV');
            YasrSteps.getDownloadAsOption(6).contains( 'TSV*');
            YasrSteps.getDownloadAsOption(7).contains( 'Binary RDF Results');
        });
    });
});
