import {ImportServerFilesSteps} from "../../steps/import/import-server-files-steps";
import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";

describe('Import server files - Operations', () => {

    let repositoryId;

    const BASE_URI = 'http://purl.org/dc/elements/1.1/';
    const CONTEXT = 'http://example.org/context';
    const FILE_FOR_IMPORT = 'italian_public_schools_links.nt.gz';
    const TTLS_FOR_IMPORT = 'test_turtlestar.ttls';
    const TRIGS_FOR_IMPORT = 'test-trigstar.trigs';
    const JSONLD_FILE_FOR_IMPORT = '0007-import-file.jsonld';
    const JSONLD_CONTEXT = 'https://w3c.github.io/json-ld-api/tests/compact/0007-context.jsonld';

    beforeEach(() => {
        repositoryId = 'server-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        ImportServerFilesSteps.visitServerImport(repositoryId);
        ImportServerFilesSteps.getResources().should('have.length', 14);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should import Server files successfully without changing settings', () => {
        // Given I have opened the server files tab
        // When I select to import a file
        ImportServerFilesSteps.importFileByName(FILE_FOR_IMPORT);
        ImportSettingsDialogSteps.import();
        // Then I should see the file imported successfully
        ImportServerFilesSteps.checkImportedResource(0, FILE_FOR_IMPORT);
        // TODO: this and all similar check in the tests below are a checking for the default import settings which we probably should not verify here.
        // ImportServerFilesSteps.verifyImportStatusDetails(FILE_FOR_IMPORT, '"preserveBNodeIds": false,');
    });

    it('Should import Server files successfully with changing settings', () => {
        // Given I have opened the server files tab
        // When I select to import a file
        ImportServerFilesSteps.importFileByName(FILE_FOR_IMPORT);
        // And I change the settings
        ImportSettingsDialogSteps.expandAdvancedSettings();
        ImportSettingsDialogSteps.fillBaseURI(BASE_URI);
        ImportSettingsDialogSteps.selectNamedGraph();
        ImportSettingsDialogSteps.fillNamedGraph(CONTEXT);
        ImportSettingsDialogSteps.enablePreserveBNodes();
        ImportSettingsDialogSteps.import();
        // Then I should see the file imported successfully
        ImportServerFilesSteps.checkImportedResource(0, FILE_FOR_IMPORT);
        // ImportSteps.verifyImportStatusDetails(FILE_FOR_IMPORT, [CONTEXT, BASE_URI, '"preserveBNodeIds": true,']);
    });

    // for this test it is necessary to set up a whitelist to GraphDB in this way: -Dgraphdb.jsonld.whitelist=https://w3c.github.io/json-ld-api/tests/*
    it('Should import Server files successfully with JSONLD context link settings', () => {
        // Given I have opened the server files tab
        // When I select to import a file
        ImportServerFilesSteps.importFileByName(JSONLD_FILE_FOR_IMPORT);
        // And I change the settings
        ImportSettingsDialogSteps.expandAdvancedSettings();
        ImportSettingsDialogSteps.fillBaseURI(BASE_URI);
        ImportSettingsDialogSteps.fillContextLink(JSONLD_CONTEXT);
        ImportSettingsDialogSteps.selectNamedGraph();
        ImportSettingsDialogSteps.fillNamedGraph(CONTEXT);
        ImportSettingsDialogSteps.enablePreserveBNodes();
        ImportSettingsDialogSteps.import();
        // Then I should see the file imported successfully
        ImportServerFilesSteps.checkImportedResource(0, JSONLD_FILE_FOR_IMPORT);
        // ImportSteps.verifyImportStatusDetails(JSONLD_FILE_FOR_IMPORT, [CONTEXT, BASE_URI, '"preserveBNodeIds": true,', JSONLD_CONTEXT]);
    });

    it('Should import Server files successfully with JSONLD default settings', () => {
        // Given I have opened the server files tab
        // When I select to import a file
        ImportServerFilesSteps.importFileByName(JSONLD_FILE_FOR_IMPORT);
        // And I change the settings
        ImportSettingsDialogSteps.expandAdvancedSettings();
        ImportSettingsDialogSteps.fillBaseURI(BASE_URI);
        ImportSettingsDialogSteps.selectNamedGraph();
        ImportSettingsDialogSteps.fillNamedGraph(CONTEXT);
        ImportSettingsDialogSteps.setContextLinkToBeVisible();
        ImportSettingsDialogSteps.enablePreserveBNodes();
        ImportSettingsDialogSteps.import();
        // Then I should see the file imported successfully
        ImportServerFilesSteps.checkImportedResource(0, JSONLD_FILE_FOR_IMPORT);
        // ImportSteps.verifyImportStatusDetails(JSONLD_FILE_FOR_IMPORT, [CONTEXT, BASE_URI, '"preserveBNodeIds": true,']);
    });

    it('Should be able to reset status of imported file', () => {
        // Given I have opened the server files tab
        // And I have imported a file
        ImportServerFilesSteps.importFileByName(FILE_FOR_IMPORT);
        ImportSettingsDialogSteps.import();
        ImportServerFilesSteps.checkImportedResource(0, FILE_FOR_IMPORT);
        // When I reset the status of the imported file
        ImportServerFilesSteps.resetFileStatusByName(FILE_FOR_IMPORT);
        // Then Import status of the file should not be visible
        ImportServerFilesSteps.getResourceStatus(FILE_FOR_IMPORT).should('be.hidden');
    });

    it('Should import turtlestar from Server files successfully without changing settings', () => {
        // Given I have opened the server files tab
        ImportServerFilesSteps.importFileByName(TTLS_FOR_IMPORT);
        // When I select to import a ttl file without changing settings
        ImportSettingsDialogSteps.import();
        // Then I should see the file imported successfully
        ImportServerFilesSteps.checkImportedResource(0, TTLS_FOR_IMPORT);
        // ImportSteps.verifyImportStatusDetails(TTLS_FOR_IMPORT, '"preserveBNodeIds": false,');
    });

    it('Test import trigstar from Server files successfully without changing settings', () => {
        // Given I have opened the server files tab
        ImportServerFilesSteps.importFileByName(TRIGS_FOR_IMPORT);
        // When I select to import a trigstar file without changing settings
        ImportSettingsDialogSteps.import();
        // Then I should see the file imported successfully
        ImportServerFilesSteps.checkImportedResource(0, TRIGS_FOR_IMPORT);
        // ImportSteps.verifyImportStatusDetails(TRIGS_FOR_IMPORT, '"preserveBNodeIds": false,');
    });
});
