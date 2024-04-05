import ImportSteps from "../../steps/import/import-steps";

describe('Import server files', () => {

    let repositoryId;

    const BASE_URI = 'http://purl.org/dc/elements/1.1/';
    const CONTEXT = 'http://example.org/context';
    const SUCCESS_MESSAGE = 'Imported successfully';
    const FILE_FOR_IMPORT = 'italian_public_schools_links.nt.gz';
    const TTLS_FOR_IMPORT = 'test_turtlestar.ttls';
    const TRIGS_FOR_IMPORT = 'test-trigstar.trigs';
    const JSONLD_FILE_FOR_IMPORT = '0007-import-file.jsonld';
    const JSONLD_CONTEXT = 'https://w3c.github.io/json-ld-api/tests/compact/0007-context.jsonld';

    beforeEach(() => {
        repositoryId = 'server-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        ImportSteps.visitServerImport(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Test import Server files successfully without changing settings', () => {
        ImportSteps.selectServerFile(FILE_FOR_IMPORT);
        ImportSteps.importServerFiles();
        ImportSteps.verifyImportStatus(FILE_FOR_IMPORT, SUCCESS_MESSAGE);
        ImportSteps.verifyImportStatusDetails(FILE_FOR_IMPORT, '"preserveBNodeIds": false,');
    });

    it('Test import Server files successfully with changing settings', () => {
        ImportSteps.selectServerFile(FILE_FOR_IMPORT);
        ImportSteps.importServerFiles(true);
        ImportSteps.expandAdvancedSettings();
        ImportSteps.fillBaseURI(BASE_URI);
        ImportSteps.selectNamedGraph();
        ImportSteps.fillNamedGraph(CONTEXT);
        ImportSteps.enablePreserveBNodes();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(FILE_FOR_IMPORT, SUCCESS_MESSAGE);
        ImportSteps.verifyImportStatusDetails(FILE_FOR_IMPORT, [CONTEXT, BASE_URI, '"preserveBNodeIds": true,']);
    });

    // for this test it is necessary to set up a whitelist to GraphDB in this way: -Dgraphdb.jsonld.whitelist=https://w3c.github.io/json-ld-api/tests/*
    it('Test import Server files successfully with JSONLD context link settings', () => {
        ImportSteps.selectServerFile(JSONLD_FILE_FOR_IMPORT);
        ImportSteps.importServerFiles(true);
        ImportSteps.expandAdvancedSettings();
        ImportSteps.fillBaseURI(BASE_URI);
        ImportSteps.fillContextLink(JSONLD_CONTEXT);
        ImportSteps.selectNamedGraph();
        ImportSteps.fillNamedGraph(CONTEXT);
        ImportSteps.enablePreserveBNodes();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(JSONLD_FILE_FOR_IMPORT, SUCCESS_MESSAGE);
        ImportSteps.verifyImportStatusDetails(JSONLD_FILE_FOR_IMPORT, [CONTEXT, BASE_URI, '"preserveBNodeIds": true,', JSONLD_CONTEXT]);
    });

    it('Test import Server files successfully with JSONLD default settings', () => {
        ImportSteps.selectServerFile(JSONLD_FILE_FOR_IMPORT);
        ImportSteps.importServerFiles(true);
        ImportSteps.expandAdvancedSettings();
        ImportSteps.fillBaseURI(BASE_URI);
        ImportSteps.selectNamedGraph();
        ImportSteps.fillNamedGraph(CONTEXT);
        ImportSteps.setContextLinkToBeVisible();
        ImportSteps.enablePreserveBNodes();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(JSONLD_FILE_FOR_IMPORT, SUCCESS_MESSAGE);
        ImportSteps.verifyImportStatusDetails(JSONLD_FILE_FOR_IMPORT, [CONTEXT, BASE_URI, '"preserveBNodeIds": true,']);
    });

    // TODO: will be fixed with next MR
    it.skip('Test import Server file successfully with JSONLD, button on row, with settings', () => {
        ImportSteps.clickImportOnRow(0);
        ImportSteps.expandAdvancedSettings();
        ImportSteps.fillBaseURI(BASE_URI);
        ImportSteps.fillContextLink(JSONLD_CONTEXT);
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(JSONLD_FILE_FOR_IMPORT, SUCCESS_MESSAGE);
        ImportSteps.verifyImportStatusDetails(JSONLD_FILE_FOR_IMPORT, [BASE_URI, '"preserveBNodeIds": false,', JSONLD_CONTEXT]);
    });

    it('Test import with resetting status of imported file', () => {
        ImportSteps.selectServerFile(FILE_FOR_IMPORT);
        ImportSteps.importServerFiles();
        ImportSteps.verifyImportStatus(FILE_FOR_IMPORT, SUCCESS_MESSAGE);
        ImportSteps.resetStatusOfUploadedFile(FILE_FOR_IMPORT);
        ImportSteps.verifyNoImportStatus(FILE_FOR_IMPORT);
    });

    it('Test import turtlestar from Server files successfully without changing settings', () => {
        ImportSteps.selectServerFile(TTLS_FOR_IMPORT);
        ImportSteps.importServerFiles();
        ImportSteps.verifyImportStatus(TTLS_FOR_IMPORT, SUCCESS_MESSAGE);
        ImportSteps.verifyImportStatusDetails(TTLS_FOR_IMPORT, '"preserveBNodeIds": false,');
    });

    it('Test import trigstar from Server files successfully without changing settings', () => {
        ImportSteps.selectServerFile(TRIGS_FOR_IMPORT);
        ImportSteps.importServerFiles();
        ImportSteps.verifyImportStatus(TRIGS_FOR_IMPORT, SUCCESS_MESSAGE);
        ImportSteps.verifyImportStatusDetails(TRIGS_FOR_IMPORT, '"preserveBNodeIds": false,');
    });
});
