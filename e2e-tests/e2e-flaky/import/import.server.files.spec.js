import ImportSteps from "../../steps/import/import-steps";

// TODO: these needs to be refactored or removed
describe.skip('Import screen validation - server files', () => {

    let repositoryId;

    const SUCCESS_MESSAGE = 'Imported successfully';
    const FILE_FOR_IMPORT = 'italian_public_schools_links.nt.gz';
    const BLANK_NODE_FILE = 'bnodes.ttl';

    beforeEach(() => {
        repositoryId = 'server-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        ImportSteps.visitServerImport(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test import all Server files successfully without changing settings', () => {
        ImportSteps
            .selectAllServerFiles()
            .importServerFiles()
            .verifyImportStatus(FILE_FOR_IMPORT, SUCCESS_MESSAGE)
            .verifyImportStatus(BLANK_NODE_FILE, SUCCESS_MESSAGE);
    });

    it('Test import with resetting status of all imported files', () => {
        ImportSteps
            .selectAllServerFiles()
            .importServerFiles()
            .verifyImportStatus(FILE_FOR_IMPORT, SUCCESS_MESSAGE)
            .verifyImportStatus(BLANK_NODE_FILE, SUCCESS_MESSAGE)
            .resetStatusOfUploadedFiles()
            .verifyNoImportStatus(BLANK_NODE_FILE)
            .verifyNoImportStatus(FILE_FOR_IMPORT);
    });
});
