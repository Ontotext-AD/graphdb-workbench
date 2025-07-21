import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";

describe('Import user data: URL import', () => {

    let repositoryId;

    const IMPORT_URL = 'https://www.w3.org/TR/owl-guide/wine.rdf';
    const JSONLD_FORMAT = 'JSON-LD';
    const VALID_URL_RDF_FORMAT = 'RDF/XML';
    const RDF_ERROR_MESSAGE = 'RDF Parse Error:';
    const IMPORT_JSONLD_URL = 'https://example.com/0007-context.jsonld';

    beforeEach(() => {
        repositoryId = 'user-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        ImportUserDataSteps.visitUserImport(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    // Test fails because GDB waits for the import link to be resolved and since it is invalid it waits for a timeout, blocking all other requests
    it('should import JSON-LD file via URL with correct request body', () => {
        cy.intercept('GET', `/rest/repositories/${repositoryId}/import/upload`).as('upload');

        ImportUserDataSteps.stubPostJSONLDFromURL(repositoryId);
        ImportUserDataSteps.openImportURLDialog(IMPORT_JSONLD_URL);
        ImportUserDataSteps.selectRDFFormat(JSONLD_FORMAT);
        ImportUserDataSteps.clickImportUrlButton();
        ImportSettingsDialogSteps.import();
        cy.wait('@postJsonldUrl').then((xhr) => {
            expect(xhr.request.body.name).to.eq('https://example.com/0007-context.jsonld');
            expect(xhr.request.body.data).to.eq('https://example.com/0007-context.jsonld');
            expect(xhr.request.body.type).to.eq('url');
            expect(xhr.request.body.hasContextLink).to.be.true;
        });
        cy.waitUntil(() =>
            cy.wait('@upload').then((xhr) => {
                console.log(xhr.response.body)
                return xhr.response.body[0]?.status === 'ERROR'
            }), {timeout: 10000, interval: 1000}
        )
    });

    it('should show error on invalid JSON-LD URL', () => {
        cy.intercept('GET', `/rest/repositories/${repositoryId}/import/upload`).as('upload');

        ImportUserDataSteps.stubPostJSONLDFromURL();
        ImportUserDataSteps.openImportURLDialog(IMPORT_JSONLD_URL);
        ImportUserDataSteps.selectRDFFormat(JSONLD_FORMAT);
        ImportUserDataSteps.clickImportUrlButton();
        ImportSettingsDialogSteps.import();
        cy.waitUntil(() =>
            cy.wait('@upload').then((xhr) => {
                console.log(xhr.response.body)
                return xhr.response.body[0]?.status === 'ERROR'
            }), {timeout: 10000, interval: 1000}
        )
        ImportUserDataSteps.checkImportedResource(0, IMPORT_JSONLD_URL, 'https://example.com/0007-context.jsonld');
    });
});
