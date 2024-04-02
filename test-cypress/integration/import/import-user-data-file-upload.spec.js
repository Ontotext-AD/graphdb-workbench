import ImportSteps from "../../steps/import/import-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";

const bnodes = `_:node0 <http://purl.org/dc/elements/1.1/title> "A new book" ;
                    \t<http://purl.org/dc/elements/1.1/creator> "A.N.Other" .`;
const jsonld = JSON.stringify({
    "@context": {
        "ab": "http://learningsparql.com/ns/addressbook#"
    },
    "@id": "ab:richard",
    "ab:homeTel": "(229)276-5135",
    "ab:email": "richard491@hotmail.com"
});

describe('Import user data: File upload', () => {

    let repositoryId;
    const testFiles = [
        'bnodes.ttl',
        'jsonld.jsonld',
        'invalid-format.json'
    ];

    beforeEach(() => {
        repositoryId = 'user-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        ImportSteps.visitImport('user', repositoryId);
    });

    afterEach(() => {
        cy.deleteUploadedFile(repositoryId, testFiles);
        cy.deleteRepository(repositoryId);
    });

    it('Should be able to upload and import a single unique file', () => {
        // Given there are no files uploaded yet
        ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
        // When I start to upload a file
        ImportSteps.selectFile(ImportSteps.createFile(testFiles[0], bnodes));
        // Then the import settings dialog should open automatically
        ImportSettingsDialogSteps.getDialog().should('be.visible');
        ImportSettingsDialogSteps.import();
        ImportSettingsDialogSteps.getDialog().should('not.exist');
        // Then I should see the uploaded file
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        checkImportedFile(0, 'bnodes.ttl');
    });

    it('Should be able to upload and import files one after the other and then override them', () => {
        // Given there are no files uploaded yet
        ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
        // When I upload a file
        ImportSteps.selectFile(ImportSteps.createFile(testFiles[0], bnodes));
        ImportSettingsDialogSteps.import();
        // Then I should see the uploaded file
        checkImportedFile(0, 'bnodes.ttl');
        // When I upload another file
        ImportSteps.selectFile(ImportSteps.createFile(testFiles[1], jsonld));
        ImportSettingsDialogSteps.import();
        // Then I should see the uploaded file - it becomes first in the list
        checkImportedFile(0, 'jsonld.jsonld');
        checkImportedFile(1, 'bnodes.ttl');
        // When I override the first file
        ImportSteps.selectFile(ImportSteps.createFile(testFiles[0], bnodes));
        ModalDialogSteps.clickOnConfirmButton();
        ImportSettingsDialogSteps.import();
        // Then I should see the uploaded file - it becomes first in the list
        checkImportedFile(0, 'bnodes.ttl');
        checkImportedFile(1, 'jsonld.jsonld');
        // When I override the second file
        ImportSteps.selectFile(ImportSteps.createFile(testFiles[1], jsonld));
        ModalDialogSteps.clickOnConfirmButton();
        ImportSettingsDialogSteps.import();
        // Then I should see the uploaded file - it becomes first in the list
        checkImportedFile(0, 'jsonld.jsonld');
        checkImportedFile(1, 'bnodes.ttl');
    });

    it('should be able to only upload a single file without importing it', () => {
        // Given there are no files uploaded yet
        ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
        // When I start to upload a file
        ImportSteps.selectFile(ImportSteps.createFile(testFiles[0], bnodes));
        // Then the import settings dialog should open automatically
        ImportSettingsDialogSteps.cancelImport();
        // Then I should see the uploaded file
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        checkUploadedFile(0, 'bnodes.ttl');
        // And the file should really be there
        MainMenuSteps.openHomePage();
        ImportSteps.visit();
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
    });

    it('Should be able to upload multiple unique files', () => {
        // Given there are no files uploaded yet
        ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
        // When I upload a file
        const file1 = ImportSteps.createFile(testFiles[0], bnodes);
        const file2 = ImportSteps.createFile(testFiles[1], jsonld);
        ImportSteps.selectFile([file1, file2]);
        // Then the import settings dialog should open automatically
        ImportSettingsDialogSteps.import();
        // Then I should see the uploaded file
        ImportSteps.getUserDataUploadedFiles().should('have.length', 2);
        checkImportedFile(0, 'bnodes.ttl');
        checkImportedFile(1, 'jsonld.jsonld');
        // And the files should really be there
        MainMenuSteps.openHomePage();
        ImportSteps.visit();
        ImportSteps.getUserDataUploadedFiles().should('have.length', 2);
    });

    it('Should be able to override a single file', () => {
        // Given I have uploaded a file
        ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
        const file1 = ImportSteps.createFile(testFiles[0], bnodes);
        ImportSteps.selectFile(file1);
        ImportSettingsDialogSteps.import();
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        checkImportedFile(0, 'bnodes.ttl');
        // When I upload a file with the same name
        ImportSteps.selectFile(file1);
        // Then I should see a file override confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I confirm the file override
        ModalDialogSteps.clickOnConfirmButton();
        // Then the import settings dialog should open automatically
        ImportSettingsDialogSteps.import();
        // Then The file should be overridden
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        checkImportedFile(0, 'bnodes.ttl');
    });

    it('Should be able to upload file with same name and preserve the existing file', () => {
        // Given I have uploaded a file
        ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
        const file1 = ImportSteps.createFile(testFiles[0], bnodes);
        ImportSteps.selectFile(file1);
        ImportSettingsDialogSteps.import();
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        checkImportedFile(0, 'bnodes.ttl');
        // When I upload a file with the same name
        ImportSteps.selectFile(file1);
        // Then I should see a file override confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I cancel the file override
        ModalDialogSteps.clickOnCancelButton();
        ImportSettingsDialogSteps.import();
        // Then The file should not be overridden but prefixed instead
        ImportSteps.getUserDataUploadedFiles().should('have.length', 2);
        checkImportedFile(0, 'bnodes.ttl');
        checkImportedFile(1, 'bnodes-0.ttl');
        // When I upload two files, one with the same name and second new one
        const file2 = ImportSteps.createFile(testFiles[1], jsonld);
        ImportSteps.selectFile([file1, file2]);
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.clickOnCancelButton();
        ImportSettingsDialogSteps.import();
        // Then The file should not be overridden but prefixed with increased index instead
        ImportSteps.getUserDataUploadedFiles().should('have.length', 4);
        checkImportedFile(0, 'bnodes.ttl');
        checkImportedFile(1, 'bnodes-0.ttl');
        checkImportedFile(2, 'bnodes-1.ttl');
        checkImportedFile(3, 'jsonld.jsonld');
    });

    it('should see error message when uploaded file has invalid format', () => {
        // Given I don't have any files uploaded yet

        // When I upload a file with invalid format
        const file1 = ImportSteps.createFile(testFiles[2], jsonld);
        ImportSteps.selectFile(file1);
        ImportSettingsDialogSteps.import();
        // Then I should see an error message
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        checkImportedFile(0, 'invalid-format.json', 'RDF Parse Error: Invalid file format');
    });
});

function checkImportedFile(index, fileName, expectedStatus) {
    const status = expectedStatus || 'Imported successfully';
    ImportSteps.getUserDataUploadedFile(index).should('contain', fileName);
    ImportSteps.getUserDataUploadedFileStatus(index).should('contain', status);
}

function checkUploadedFile(index, fileName, status) {
    ImportSteps.getUserDataUploadedFile(index).should('contain', fileName);
    ImportSteps.getUserDataUploadedFileStatus(index).should('be.hidden');
}
