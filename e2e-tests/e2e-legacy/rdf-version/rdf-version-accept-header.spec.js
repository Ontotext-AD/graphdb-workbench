import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../steps/yasgui/yasgui-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../steps/yasgui/yasr-steps";
import {QueryStubs} from "../../stubs/yasgui/query-stubs";
import {GraphsOverviewSteps} from "../../steps/explore/graphs-overview-steps";
import {JsonLdModalSteps} from "../../steps/json-ld-modal-steps";

// The workbench requests RDF 1.2 by adding the "version" media type parameter to the Accept header.
// The parameter must be present on every RDF media range and must precede the weight ("q"),
// because anything after the weight is not a media type parameter.
const SELECT_QUERY_ACCEPT = 'application/x-sparqlstar-results+json;version=1.2, application/sparql-results+json;version=1.2;q=0.9, */*;version=1.2;q=0.8';
const CONSTRUCT_QUERY_ACCEPT = 'application/x-graphdb-table-results+json;version=1.2, application/rdf+json;version=1.2;q=0.9, */*;version=1.2;q=0.8';
const JSONLD_EXPANDED_ACCEPT = 'application/ld+json;profile=http://www.w3.org/ns/json-ld#expanded;version=1.2';

describe('RDF version in the Accept header', () => {
    let repositoryId;

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    describe('SPARQL editor', () => {
        beforeEach(() => {
            repositoryId = 'rdf-version-sparql-' + Date.now();
            QueryStubs.stubQueryCountResponse();
            cy.createRepository({id: repositoryId});
            cy.presetRepository(repositoryId);
            QueryStubs.stubDefaultQueryResponse(repositoryId);

            SparqlEditorSteps.visitSparqlEditorPage();
            YasguiSteps.getYasgui().should('be.visible');
        });

        it('should request RDF 1.2 when executing a SELECT query', () => {
            // Given I am about to execute the default SELECT query
            cy.intercept('POST', `/repositories/${repositoryId}`).as('query');

            // When I execute it
            YasqeSteps.executeQuery();

            // Then every media range of the Accept header should request RDF 1.2
            verifyAcceptHeader('@query', SELECT_QUERY_ACCEPT);
        });

        it('should request RDF 1.2 when executing a CONSTRUCT query', () => {
            // Given I am about to execute a CONSTRUCT query
            cy.intercept('POST', `/repositories/${repositoryId}`).as('query');

            // When I execute it
            pasteAndExecuteConstructQuery();

            // Then every media range of the Accept header should request RDF 1.2
            verifyAcceptHeader('@query', CONSTRUCT_QUERY_ACCEPT);
        });

        it('should request RDF 1.2 when downloading SELECT results', () => {
            // Given I have executed a SELECT query
            YasqeSteps.executeQuery();
            cy.intercept('POST', `/repositories/${repositoryId}`).as('download');

            // When I download the results as XML
            YasrSteps.openDownloadAsDropdown();
            YasrSteps.selectDownloadAsOption(1);

            // Then the download request should ask for RDF 1.2
            verifyAcceptHeader('@download', 'application/sparql-results+xml;version=1.2');
        });

        it('should request RDF 1.2 when downloading CONSTRUCT results as JSON-LD', () => {
            // Given I have executed a CONSTRUCT query
            pasteAndExecuteConstructQuery();
            cy.intercept('POST', `/repositories/${repositoryId}`).as('download');

            // When I download the results as JSON-LD with the default settings
            YasrSteps.openDownloadAsDropdown();
            YasrSteps.selectDownloadAsOption(1);
            JsonLdModalSteps.clickExportJSONLD();

            // Then the version should follow the JSON-LD profile
            verifyAcceptHeader('@download', JSONLD_EXPANDED_ACCEPT);
        });
    });

    describe('Graphs overview', () => {
        beforeEach(() => {
            repositoryId = 'rdf-version-graphs-' + Date.now();
            cy.createRepository({id: repositoryId});
            cy.presetRepository(repositoryId);
            cy.importRDFTextSnippet(repositoryId, '<urn:s> <urn:p> <urn:o> .');

            GraphsOverviewSteps.visit();
            GraphsOverviewSteps.getResults().should('have.length.at.least', 1);
        });

        it('should request RDF 1.2 when exporting the repository', () => {
            // Given the export opens the download URL in a new window
            cy.window().then((win) => {
                cy.stub(win, 'open').returns({closed: true}).as('windowOpen');
            });

            // When I export the repository as TriG
            GraphsOverviewSteps.exportRepository();
            cy.get('.export-repo-format-TriG').eq(0).click();

            // Then the Accept parameter of the download URL should request RDF 1.2
            cy.get('@windowOpen').should('have.been.calledOnce')
                .its('firstCall.args.0')
                .should('contain', '&Accept=' + encodeURIComponent('application/x-trig;version=1.2'));
        });

        it('should request RDF 1.2 when exporting the repository as JSON-LD', () => {
            // Given I am about to export the repository
            cy.intercept({method: 'GET', pathname: `/repositories/${repositoryId}/statements`}).as('export');

            // When I export it as JSON-LD with the default settings
            GraphsOverviewSteps.exportRepository();
            GraphsOverviewSteps.selectJSONLDOption();
            JsonLdModalSteps.clickExportJSONLD();

            // Then the version should follow the JSON-LD profile
            verifyAcceptHeader('@export', JSONLD_EXPANDED_ACCEPT);
        });

        it('should request RDF 1.2 when downloading all graphs', () => {
            // Given I am about to download all graphs
            cy.intercept({method: 'GET', pathname: `/repositories/${repositoryId}/contexts`}).as('downloadGraphs');

            // When I download them
            GraphsOverviewSteps.clickOnDownloadAllButton();

            // Then RDF 1.2 should be requested for every media range except JSON
            verifyAcceptHeader('@downloadGraphs', 'application/json, text/plain;version=1.2, */*;version=1.2');
        });
    });
});

function verifyAcceptHeader(alias, expectedAccept) {
    cy.wait(alias).its('request.headers.accept').should('equal', expectedAccept);
}

function pasteAndExecuteConstructQuery() {
    YasqeSteps.pasteQuery('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }');
    YasqeSteps.executeQuery();
}
