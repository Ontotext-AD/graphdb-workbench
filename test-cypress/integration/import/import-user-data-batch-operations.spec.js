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

describe('Import user data: Batch operations', () => {

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

    it('Should be able to filter files by status', () => {
        uploadFiles([
            {name: testFiles[0], content: bnodes},
            {name: testFiles[1], content: jsonld}
        ]);
        // Then I should see no files selected
        ImportSteps.getSelectedResources().should('have.length', 0);
        // When I select All files from the menu
        ImportSteps.selectAllResources();
        // Then I should see all files selected
        ImportSteps.getSelectedResources().should('have.length', 2);
        // When I select None from the menu
        ImportSteps.deselectAllResources();
        // Then I should see no files selected
        ImportSteps.getSelectedResources().should('have.length', 0);
        // precondition for the next step
        const file = ImportSteps.createFile('jsonld-2.jsonld', jsonld);
        ImportSteps.selectFile([file]);
        ImportSettingsDialogSteps.getDialog().should('be.visible');
        ImportSettingsDialogSteps.import();
        ImportSteps.getUserDataUploadedFiles().should('have.length', 3);
        ImportSteps.checkUserDataImportedResource(0, 'jsonld-2.jsonld');
        // When I select Imported from the menu
        ImportSteps.selectImportedResources();
        // Then I should see only imported files selected
        ImportSteps.getSelectedResources().should('have.length', 1);
        ImportSteps.getSelectedResourceName(0).should('contain', 'jsonld-2.jsonld');
        // When I select Not Imported from the menu
        ImportSteps.selectNotImportedResources();
        // Then I should see only not imported files selected
        ImportSteps.getSelectedResources().should('have.length', 2);
        ImportSteps.getUserDataUploadedFileByName('jsonld.jsonld').should('be.visible');
        ImportSteps.getUserDataUploadedFileByName('bnodes.ttl').should('be.visible');
    });

    it('Should be able to batch import files', () => {
        uploadFiles([
            {name: testFiles[0], content: bnodes},
            {name: testFiles[1], content: jsonld},
            {name: 'jsonld-2.jsonld', content: jsonld}
        ]);
        ImportSteps.getUserDataUploadedFiles().should('have.length', 3);
        // When I select one file for import
        ImportSteps.selectFileByName('jsonld-2.jsonld');
        // And I click on the import button
        ImportSteps.batchImport();
        ImportSettingsDialogSteps.import();
        // Then the file should be imported
        ImportSteps.checkUserDataImportedResource(0, 'jsonld-2.jsonld');
        ImportSteps.selectImportedResources();
        ImportSteps.getSelectedResources().should('have.length', 1);
        ImportSteps.deselectAllResources();
        // When I select the rest of the uploaded files
        ImportSteps.selectFileByName('jsonld.jsonld');
        ImportSteps.selectFileByName('bnodes.ttl');
        // And I import them
        ImportSteps.batchImport();
        ImportSettingsDialogSteps.import();
        // Then the files should be imported
        ImportSteps.checkUserDataImportedResource(1, 'jsonld.jsonld');
        ImportSteps.checkUserDataImportedResource(2, 'bnodes.ttl');
        ImportSteps.selectImportedResources();
        ImportSteps.getSelectedResources().should('have.length', 3);
    });

    it('Should be able to reset the imported status of the files', () => {
        uploadWithImportFiles(testFiles);
        // When I select one of the imported files
        ImportSteps.selectFileByIndex(0);
        // And I click on the batch reset button
        ImportSteps.batchReset();
        // Then the import status of the file should be reset
        ImportSteps.selectNotImportedResources();
        ImportSteps.getSelectedResources().should('have.length', 1);
        // And the batch reset button should not be visible
        ImportSteps.getBatchResetButton().should('not.exist');
        // When I select the rest of the imported files
        ImportSteps.selectImportedResources();
        ImportSteps.getSelectedResources().should('have.length', 2);
        // And I click on the batch reset button
        ImportSteps.batchReset();
        // Then the import status of the files should be reset
        ImportSteps.selectNotImportedResources();
        ImportSteps.getSelectedResources().should('have.length', 3);
    });

    it('Should ba able to delete multiple files at once', () => {
        uploadWithImportFiles(testFiles);
        // When I select one file for removal
        ImportSteps.selectFileByIndex(0);
        // And I delete the file
        ImportSteps.removeSelectedResources();
        // Then I should see a confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I confirm the deletion
        ModalDialogSteps.clickOnConfirmButton();
        // Then the file should be deleted
        ImportSteps.getUserDataUploadedFiles().should('have.length', 2);

        // When I select all other files
        ImportSteps.selectAllResources();
        // And I click on the delete button
        ImportSteps.removeSelectedResources();
        // Then I should see a confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I confirm the deletion
        ModalDialogSteps.clickOnConfirmButton();
        // Then the files should be deleted
        ImportSteps.getUserDataUploadedFiles().should('have.length', 0);
        MainMenuSteps.openHomePage();
        ImportSteps.visit();
        ImportSteps.getUserDataUploadedFiles().should('have.length', 0);
    });
});

function uploadWithImportFiles(files) {
    // Given there are no files uploaded yet
    ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
    // When I upload multiple files
    const file1 = ImportSteps.createFile(files[0], bnodes);
    const file2 = ImportSteps.createFile(files[1], jsonld);
    const file3 = ImportSteps.createFile('jsonld-2.jsonld', jsonld);
    ImportSteps.selectFile([file1, file2, file3]);
    ImportSettingsDialogSteps.import();
    ImportSteps.getUserDataUploadedFiles().should('have.length', 3);
    ImportSteps.checkUserDataImportedResource(0, 'jsonld-2.jsonld');
    ImportSteps.checkUserDataImportedResource(1, 'jsonld.jsonld');
    ImportSteps.checkUserDataImportedResource(2, 'bnodes.ttl');
}

function uploadFiles(data) {
    // Given there are no files uploaded yet
    ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
    // When I upload multiple files
    const createdFiles = data.map((fileData) => {
        return ImportSteps.createFile(fileData.name, fileData.content);
    });
    ImportSteps.selectFile(createdFiles);
    ImportSettingsDialogSteps.cancelImport();
    ImportSteps.getUserDataUploadedFiles().should('have.length', data.length);
    // check them backwards because  latest uploaded/imported files are at the top
    data.reverse().forEach((file, index) => {
        ImportSteps.checkUserDataUploadedResource(index, file.name);
    });
}
