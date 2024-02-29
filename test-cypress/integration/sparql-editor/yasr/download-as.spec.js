import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasrSteps} from "../../../steps/yasgui/yasr-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {JsonLdModalSteps} from "../../../steps/json-ld-modal-steps";
import {GraphsOverviewSteps} from "../../../steps/explore/graphs-overview-steps";

describe('Download results', () => {
    let repositoryId;
    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        // Given I visit a page with "ontotex-yasgu-web-component" in it.
        SparqlEditorSteps.visitSparqlEditorPage();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    describe('DownloadAs button', () => {
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

        it('should download as JSON-LD after a CONSTRUCT query', () => {
            // Given I execute a CONSTRUCT query
            pasteAndExecuteConstructQuery();
            // And I open the download dropdown
            YasrSteps.openDownloadAsDropdown();
            // Then the second option should be JSON-LD
            YasrSteps.getDownloadAsOption(1).contains( 'JSON-LD');
            // When I select it
            YasrSteps.selectDownloadAsOption(1);
            // The dialog for download should appear
            JsonLdModalSteps.getJSONLDModal().should('be.visible');
            // Then I see the default settings
            JsonLdModalSteps.getSelectedJSONLDModeField().should('have.value', 'http://www.w3.org/ns/json-ld#expanded');
            // When I click to export
            JsonLdModalSteps.clickExportJSONLD();
            // Then the dialog should disappear
            JsonLdModalSteps.getJSONLDModal().should('not.exist');
            // And the file should have downloaded
            JsonLdModalSteps.verifyFileExists('query-result.jsonld');

            // When I open the dialog again
            YasrSteps.selectDownloadAsOption(1);
            // And I change the JSON-LD form
            GraphsOverviewSteps.selectJSONLDMode(0);
            // And type in a context
            JsonLdModalSteps.typeJSONLDFrame('https://w3c.github.io/json-ld-api/tests/compact/0007-context.jsonld');
            // And export
            JsonLdModalSteps.clickExportJSONLD();
            // Then the file should have downloaded
            JsonLdModalSteps.verifyFileExists('query-result.jsonld');
        });

        it('should download as JSON-LD after a CONSTRUCT query, with context added', () => {
            // Given I execute a CONSTRUCT query
            pasteAndExecuteConstructQuery();
            // And I open the download dropdown
            YasrSteps.openDownloadAsDropdown();
            // Then the second option should be JSON-LD
            YasrSteps.getDownloadAsOption(1).contains( 'JSON-LD');
            // When I select it
            YasrSteps.selectDownloadAsOption(1);
            // And I change the JSON-LD form
            GraphsOverviewSteps.selectJSONLDMode(0);
            // And type in a context
            JsonLdModalSteps.typeJSONLDFrame('https://w3c.github.io/json-ld-api/tests/compact/0007-context.jsonld');
            // And export
            JsonLdModalSteps.clickExportJSONLD();
            // Then the file should have downloaded
            JsonLdModalSteps.verifyFileExists('query-result.jsonld');
        });

        function pasteAndExecuteConstructQuery() {
            YasqeSteps.clearEditor();
            YasqeSteps.pasteQuery('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' +
                'PREFIX onto: <http://www.ontotext.com/>' +
                'CONSTRUCT {' +
                '?source rdf:type ?destination .' +
                '}  WHERE {' +
                '?bag rdf:type ?source .' +
                '?flight rdf:type ?destination' +
                '}');
            YasqeSteps.executeQuery();
        }
    });
});
