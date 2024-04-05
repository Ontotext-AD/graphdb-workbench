import ImportSteps from "../../steps/import/import-steps";

describe('Import user data: URL import', () => {

    let repositoryId;

    const IMPORT_URL = 'https://www.w3.org/TR/owl-guide/wine.rdf';
    const JSONLD_FORMAT = 'JSON-LD';
    const VALID_URL_RDF_FORMAT = 'RDF/XML';
    const RDF_ERROR_MESSAGE = 'RDF Parse Error:';
    const SUCCESS_MESSAGE = 'Imported successfully';
    const IMPORT_JSONLD_URL = 'https://example.com/0007-context.jsonld';

    beforeEach(() => {
        repositoryId = 'user-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        ImportSteps.visitUserImport(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test import file via URL successfully with Auto format selected', () => {
        ImportSteps.openImportURLDialog(IMPORT_URL);
        ImportSteps.clickImportUrlButton();
        // Without changing settings
        ImportSteps.importFromSettingsDialog();
        ImportSteps.checkUserDataImportedResource(0, IMPORT_URL);
    });

    it('Test import file via URL with invalid RDF format selected', () => {
        ImportSteps.openImportURLDialog(IMPORT_URL);
        ImportSteps.selectRDFFormat(JSONLD_FORMAT);
        ImportSteps.clickImportUrlButton();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.checkUserDataImportedResource(0, IMPORT_URL, RDF_ERROR_MESSAGE);
    });

    it('Test import file via URL successfully with valid RDF format selected', () => {
        ImportSteps.openImportURLDialog(IMPORT_URL);
        ImportSteps.selectRDFFormat(VALID_URL_RDF_FORMAT);
        ImportSteps.clickImportUrlButton();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.checkUserDataImportedResource(0, IMPORT_URL);
    });

    it('should import JSON-LD file via URL with correct request body', () => {
        stubPostJSONLDFromURL(repositoryId);
        ImportSteps.openImportURLDialog(IMPORT_JSONLD_URL);
        ImportSteps.selectRDFFormat(JSONLD_FORMAT);
        ImportSteps.clickImportUrlButton();
        ImportSteps.importFromSettingsDialog();
        cy.wait('@postJsonldUrl').then((xhr) => {
            expect(xhr.request.body.name).to.eq('https://example.com/0007-context.jsonld');
            expect(xhr.request.body.data).to.eq('https://example.com/0007-context.jsonld');
            expect(xhr.request.body.type).to.eq('url');
            expect(xhr.request.body.hasContextLink).to.be.true;
        });
    });

    it('should show error on invalid JSON-LD URL', () => {
        stubPostJSONLDFromURL();
        ImportSteps.openImportURLDialog(IMPORT_JSONLD_URL);
        ImportSteps.selectRDFFormat(JSONLD_FORMAT);
        ImportSteps.clickImportUrlButton();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.checkUserDataImportedResource(0, IMPORT_JSONLD_URL, 'https://example.com/0007-context.jsonld');
    });
});

function stubPostJSONLDFromURL(repositoryId) {
    cy.intercept('POST', `/rest/repositories/${repositoryId}/import/upload/url`).as('postJsonldUrl');
}
