import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";

// TODO: Fix me. Broken due to migration (Error: beforeEach)
describe.skip('Import user data: URL import', () => {

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

    it('Test import file via URL successfully with Auto format selected', () => {
        ImportUserDataSteps.openImportURLDialog(IMPORT_URL);
        ImportUserDataSteps.clickImportUrlButton();
        // Without changing settings
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.checkImportedResource(0, IMPORT_URL);
    });

    it('Test import file via URL with invalid RDF format selected', () => {
        ImportUserDataSteps.openImportURLDialog(IMPORT_URL);
        ImportUserDataSteps.selectRDFFormat(JSONLD_FORMAT);
        ImportUserDataSteps.clickImportUrlButton();
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.checkImportedResource(0, IMPORT_URL, RDF_ERROR_MESSAGE);
    });

    it('Test import file via URL successfully with valid RDF format selected', () => {
        ImportUserDataSteps.openImportURLDialog(IMPORT_URL);
        ImportUserDataSteps.selectRDFFormat(VALID_URL_RDF_FORMAT);
        ImportUserDataSteps.clickImportUrlButton();
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.checkImportedResource(0, IMPORT_URL);
    });

    it('should import JSON-LD file via URL with correct request body', () => {
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
    });

    it('should show error on invalid JSON-LD URL', () => {
        ImportUserDataSteps.stubPostJSONLDFromURL();
        ImportUserDataSteps.openImportURLDialog(IMPORT_JSONLD_URL);
        ImportUserDataSteps.selectRDFFormat(JSONLD_FORMAT);
        ImportUserDataSteps.clickImportUrlButton();
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.checkImportedResource(0, IMPORT_JSONLD_URL, 'https://example.com/0007-context.jsonld');
    });
});
