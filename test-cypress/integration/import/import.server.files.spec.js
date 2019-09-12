import ImportSteps from '../../steps/import-steps';

describe('Import screen validation - server files', () => {

    let repositoryId;

    const BASE_URI = 'http://purl.org/dc/elements/1.1/';
    const CONTEXT = 'http://example.org/context';
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

    it('Test import Server files successfully without changing settings', () => {
        ImportSteps
            .selectServerFile(FILE_FOR_IMPORT)
            .importServerFiles()
            .verifyImportStatus(FILE_FOR_IMPORT, SUCCESS_MESSAGE)
            .verifyImportStatusDetails(FILE_FOR_IMPORT, '"preserveBNodeIds": false,');
    });

    it('Test import Server files successfully with changing settings', () => {
        ImportSteps.selectServerFile(FILE_FOR_IMPORT)
            .importServerFiles(true)
            .fillBaseURI(BASE_URI)
            .selectNamedGraph()
            .fillNamedGraph(CONTEXT)
            .expandAdvancedSettings()
            .enablePreserveBNodes()
            .importFromSettingsDialog()
            .verifyImportStatus(FILE_FOR_IMPORT, SUCCESS_MESSAGE)
            .verifyImportStatusDetails(FILE_FOR_IMPORT, [CONTEXT, BASE_URI, '"preserveBNodeIds": true,']);
    });

    it('Test import all Server files successfully without changing settings', () => {
        ImportSteps
            .selectAllServerFiles()
            .importServerFiles()
            .verifyImportStatus(FILE_FOR_IMPORT, SUCCESS_MESSAGE)
            .verifyImportStatus(BLANK_NODE_FILE, SUCCESS_MESSAGE);
    });

    it('Test import with resetting status of imported file', () => {
        ImportSteps
            .selectServerFile(FILE_FOR_IMPORT)
            .importServerFiles()
            .verifyImportStatus(FILE_FOR_IMPORT, SUCCESS_MESSAGE)
            .resetStatusOfUploadedFile(FILE_FOR_IMPORT)
            .verifyNoImportStatus(FILE_FOR_IMPORT);
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
