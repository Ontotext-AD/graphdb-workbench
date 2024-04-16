import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";

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
        ImportUserDataSteps.visitImport('user', repositoryId);
    });

    afterEach(() => {
        cy.deleteUploadedFile(repositoryId, testFiles);
        cy.deleteRepository(repositoryId);
    });

    it('Should be able to upload and import a single unique file', () => {
        // Given there are no files uploaded yet
        ImportUserDataSteps.getResourcesTable().should('be.hidden');
        // When I start to upload a file
        ImportUserDataSteps.selectFile(ImportUserDataSteps.createFile(testFiles[0], bnodes));
        // Then the import settings dialog should open automatically
        ImportSettingsDialogSteps.getDialog().should('be.visible');
        ImportSettingsDialogSteps.import();
        ImportSettingsDialogSteps.getDialog().should('not.exist');
        // Then I should see the uploaded file
        ImportUserDataSteps.getResources().should('have.length', 1);
        ImportUserDataSteps.checkImportedResource(0, 'bnodes.ttl');
    });

    it('Should allow replacing graph when uploading and importing single file', () => {
        // Given there are no files uploaded yet
        ImportUserDataSteps.getResourcesTable().should('be.hidden');
        // When I start to upload a file
        ImportUserDataSteps.selectFile(ImportUserDataSteps.createFile(testFiles[0], bnodes));
        // Then the import settings dialog should open automatically
        ImportSettingsDialogSteps.getDialog().should('be.visible');
        // And the option for replace graph should be active
        ImportSettingsDialogSteps.getReplaceExistingDataCheckbox().should('be.enabled').and('not.be.checked');
    });

    it('Should be able to upload and import files one after the other and then override them', () => {
        // Given there are no files uploaded yet
        ImportUserDataSteps.getResourcesTable().should('be.hidden');
        // When I upload a file
        ImportUserDataSteps.selectFile(ImportUserDataSteps.createFile(testFiles[0], bnodes));
        ImportSettingsDialogSteps.import();
        // Then I should see the uploaded file
        ImportUserDataSteps.checkImportedResource(0, 'bnodes.ttl');
        // When I upload another file
        ImportUserDataSteps.selectFile(ImportUserDataSteps.createFile(testFiles[1], jsonld));
        ImportSettingsDialogSteps.import();
        // Then I should see the uploaded file - it becomes first in the list
        ImportUserDataSteps.checkImportedResource(0, 'jsonld.jsonld');
        ImportUserDataSteps.checkImportedResource(1, 'bnodes.ttl');
        // When I override the first file
        ImportUserDataSteps.selectFile(ImportUserDataSteps.createFile(testFiles[0], bnodes));
        ModalDialogSteps.clickOnConfirmButton();
        ImportSettingsDialogSteps.import();
        // Then I should see the uploaded file - it becomes first in the list
        // TODO: timestamps currently seems to not be changed on reimport
        ImportUserDataSteps.checkImportedResource(0, 'jsonld.jsonld');
        ImportUserDataSteps.checkImportedResource(1, 'bnodes.ttl');
        // When I override the second file
        ImportUserDataSteps.selectFile(ImportUserDataSteps.createFile(testFiles[1], jsonld));
        ModalDialogSteps.clickOnConfirmButton();
        ImportSettingsDialogSteps.import();
        // Then I should see the uploaded file - it becomes first in the list
        ImportUserDataSteps.checkImportedResource(0, 'jsonld.jsonld');
        ImportUserDataSteps.checkImportedResource(1, 'bnodes.ttl');
    });

    it('should be able to only upload a single file without importing it', () => {
        // Given there are no files uploaded yet
        ImportUserDataSteps.getResourcesTable().should('be.hidden');
        // When I start to upload a file
        ImportUserDataSteps.selectFile(ImportUserDataSteps.createFile(testFiles[0], bnodes));
        // Then the import settings dialog should open automatically
        ImportSettingsDialogSteps.cancelImport();
        // Then I should see the uploaded file
        ImportUserDataSteps.getResources().should('have.length', 1);
        ImportUserDataSteps.checkUserDataUploadedResource(0, 'bnodes.ttl');
        // And the file should really be there
        MainMenuSteps.openHomePage();
        ImportUserDataSteps.visit();
        ImportUserDataSteps.getResources().should('have.length', 1);
    });

    it('Should be able to upload multiple unique files', () => {
        // Given there are no files uploaded yet
        ImportUserDataSteps.getResourcesTable().should('be.hidden');
        // When I upload a file
        const file1 = ImportUserDataSteps.createFile(testFiles[0], bnodes);
        const file2 = ImportUserDataSteps.createFile(testFiles[1], jsonld);
        ImportUserDataSteps.selectFile([file1, file2]);
        // Then the import settings dialog should open automatically
        ImportSettingsDialogSteps.import();
        // Then I should see the uploaded file
        ImportUserDataSteps.getResources().should('have.length', 2);
        ImportUserDataSteps.checkImportedResource(0, 'jsonld.jsonld');
        ImportUserDataSteps.checkImportedResource(1, 'bnodes.ttl');
        // And the files should really be there
        MainMenuSteps.openHomePage();
        ImportUserDataSteps.visit();
        ImportUserDataSteps.getResources().should('have.length', 2);
    });

    it('Should be able to override a single file', () => {
        // Given I have uploaded a file
        ImportUserDataSteps.getResourcesTable().should('be.hidden');
        const file1 = ImportUserDataSteps.createFile(testFiles[0], bnodes);
        ImportUserDataSteps.selectFile(file1);
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.getResources().should('have.length', 1);
        ImportUserDataSteps.checkImportedResource(0, 'bnodes.ttl');
        // When I upload a file with the same name
        ImportUserDataSteps.selectFile(file1);
        // Then I should see a file override confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I confirm the file override
        ModalDialogSteps.clickOnConfirmButton();
        // Then the import settings dialog should open automatically
        ImportSettingsDialogSteps.import();
        // Then The file should be overridden
        ImportUserDataSteps.getResources().should('have.length', 1);
        ImportUserDataSteps.checkImportedResource(0, 'bnodes.ttl');
    });

    it('Should be able to upload file with same name and preserve the existing file', () => {
        // Given I have uploaded a file
        ImportUserDataSteps.getResourcesTable().should('be.hidden');
        const file1 = ImportUserDataSteps.createFile(testFiles[0], bnodes);
        ImportUserDataSteps.selectFile(file1);
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.getResources().should('have.length', 1);
        ImportUserDataSteps.checkImportedResource(0, 'bnodes.ttl');
        // When I upload a file with the same name
        ImportUserDataSteps.selectFile(file1);
        // Then I should see a file override confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I cancel the file override
        ModalDialogSteps.clickOnCancelButton();
        ImportSettingsDialogSteps.import();
        // Then The file should not be overridden but prefixed instead
        ImportUserDataSteps.getResources().should('have.length', 2);
        ImportUserDataSteps.checkImportedResource(0, 'bnodes-0.ttl');
        ImportUserDataSteps.checkImportedResource(1, 'bnodes.ttl');
        // When I upload two files, one with the same name and second new one
        const file2 = ImportUserDataSteps.createFile(testFiles[1], jsonld);
        ImportUserDataSteps.selectFile([file1, file2]);
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.clickOnCancelButton();
        ImportSettingsDialogSteps.import();
        // Then The file should not be overridden but prefixed with increased index instead
        ImportUserDataSteps.getResources().should('have.length', 4);
        ImportUserDataSteps.checkImportedResource(0, 'jsonld.jsonld');
        ImportUserDataSteps.checkImportedResource(1, 'bnodes-1.ttl');
        ImportUserDataSteps.checkImportedResource(2, 'bnodes-0.ttl');
        ImportUserDataSteps.checkImportedResource(3, 'bnodes.ttl');
    });

    it('should see error message when uploaded file has invalid format', () => {
        // Given I don't have any files uploaded yet

        // When I upload a file with invalid format
        const file1 = ImportUserDataSteps.createFile(testFiles[2], jsonld);
        ImportUserDataSteps.selectFile(file1);
        ImportSettingsDialogSteps.import();
        // Then I should see an error message
        ImportUserDataSteps.getResources().should('have.length', 1);
        ImportUserDataSteps.checkImportedResource(0, 'invalid-format.json', 'RDF Parse Error: Invalid file format');
    });
});
