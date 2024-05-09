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

describe('Import user data: Batch operations', {retries: {runMode: 2}}, () => {

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

    it('Should be able to filter files by status', () => {
        uploadFiles([
            {name: testFiles[0], content: bnodes},
            {name: testFiles[1], content: jsonld}
        ]);
        // Then I should see no files selected
        ImportUserDataSteps.getSelectedResources().should('have.length', 0);
        // When I select All files from the menu
        ImportUserDataSteps.selectAllResources();
        // Then I should see all files selected
        ImportUserDataSteps.getSelectedResources().should('have.length', 2);
        // When I select None from the menu
        ImportUserDataSteps.deselectAllResources();
        // Then I should see no files selected
        ImportUserDataSteps.getSelectedResources().should('have.length', 0);
        // precondition for the next step
        const file = ImportUserDataSteps.createFile('jsonld-2.jsonld', jsonld);
        ImportUserDataSteps.selectFile([file]);
        ImportSettingsDialogSteps.getDialog().should('be.visible');
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.getResources().should('have.length', 3);
        ImportUserDataSteps.checkImportedResource(0, 'jsonld-2.jsonld');
        // When I select Imported from the menu
        ImportUserDataSteps.selectImportedResources();
        // Then I should see only imported files selected
        ImportUserDataSteps.getSelectedResources().should('have.length', 1);
        ImportUserDataSteps.getSelectedResourceName(0).should('contain', 'jsonld-2.jsonld');
        // When I select Not Imported from the menu
        ImportUserDataSteps.selectNotImportedResources();
        // Then I should see only not imported files selected
        ImportUserDataSteps.getSelectedResources().should('have.length', 2);
        ImportUserDataSteps.getResourceByName('jsonld.jsonld').should('be.visible');
        ImportUserDataSteps.getResourceByName('bnodes.ttl').should('be.visible');
    });

    it('Should be able to batch import files', () => {
        uploadFiles([
            {name: testFiles[0], content: bnodes},
            {name: testFiles[1], content: jsonld},
            {name: 'jsonld-2.jsonld', content: jsonld}
        ]);
        ImportUserDataSteps.getResources().should('have.length', 3);
        // When I select one file for import
        ImportUserDataSteps.selectFileByName('jsonld-2.jsonld');
        // And I click on the import button
        ImportUserDataSteps.batchImport();
        ImportSettingsDialogSteps.import();
        // Then the file should be imported
        ImportUserDataSteps.checkImportedResource(0, 'jsonld-2.jsonld');
        ImportUserDataSteps.selectImportedResources();
        ImportUserDataSteps.getSelectedResources().should('have.length', 1);
        ImportUserDataSteps.deselectAllResources();
        // When I select the rest of the uploaded files
        ImportUserDataSteps.selectFileByName('jsonld.jsonld');
        ImportUserDataSteps.selectFileByName('bnodes.ttl');
        // And I import them
        ImportUserDataSteps.batchImport();
        ImportSettingsDialogSteps.import();
        // Then the files should be imported
        ImportUserDataSteps.checkImportedResource(1, 'jsonld.jsonld');
        ImportUserDataSteps.checkImportedResource(2, 'bnodes.ttl');
        ImportUserDataSteps.selectImportedResources();
        ImportUserDataSteps.getSelectedResources().should('have.length', 3);
    });

    it('Should be able to reset the imported status of the files', () => {
        uploadWithImportFiles(testFiles);
        // When I select one of the imported files
        ImportUserDataSteps.selectFileByIndex(0);
        // And I click on the batch reset button
        ImportUserDataSteps.batchReset();
        // Then the import status of the file should be reset
        ImportUserDataSteps.selectNotImportedResources();
        ImportUserDataSteps.getSelectedResources().should('have.length', 1);
        // And the batch reset button should not be visible
        ImportUserDataSteps.getBatchResetButton().should('not.exist');
        // When I select the rest of the imported files
        ImportUserDataSteps.selectImportedResources();
        ImportUserDataSteps.getSelectedResources().should('have.length', 2);
        // And I click on the batch reset button
        ImportUserDataSteps.batchReset();
        // Then the import status of the files should be reset
        ImportUserDataSteps.selectNotImportedResources();
        ImportUserDataSteps.getSelectedResources().should('have.length', 3);
    });

    it('Should ba able to delete multiple files at once', () => {
        uploadWithImportFiles(testFiles);
        // When I select one file for removal
        ImportUserDataSteps.selectFileByIndex(0);
        // And I delete the file
        ImportUserDataSteps.removeSelectedResources();
        // Then I force click the confirmation dialog, to hide the button popover, which covers it
        ModalDialogSteps.getDialog().click({force: true});
        // The dialog should be visible
        ModalDialogSteps.getDialog().should('be.visible');
        // When I confirm the deletion
        ModalDialogSteps.clickOnConfirmButton();
        // Then the file should be deleted
        ImportUserDataSteps.getResources().should('have.length', 2);

        // When I select all other files
        ImportUserDataSteps.selectAllResources();
        // And I click on the delete button
        ImportUserDataSteps.removeSelectedResources();
        // Then I should see a confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I confirm the deletion
        ModalDialogSteps.clickOnConfirmButton();
        // Then the files should be deleted
        ImportUserDataSteps.getResources().should('have.length', 0);
        MainMenuSteps.openHomePage();
        ImportUserDataSteps.visit();
        ImportUserDataSteps.getResources().should('have.length', 0);
    });
});

function uploadWithImportFiles(files) {
    // Given there are no files uploaded yet
    ImportUserDataSteps.getResourcesTable().should('be.hidden');
    // When I upload multiple files
    const file1 = ImportUserDataSteps.createFile(files[0], bnodes);
    const file2 = ImportUserDataSteps.createFile(files[1], jsonld);
    const file3 = ImportUserDataSteps.createFile('jsonld-2.jsonld', jsonld);
    ImportUserDataSteps.selectFile([file1, file2, file3]);
    ImportSettingsDialogSteps.import();
    ImportUserDataSteps.getResources().should('have.length', 3);
    ImportUserDataSteps.checkImportedResource(0, 'jsonld-2.jsonld');
    ImportUserDataSteps.checkImportedResource(1, 'jsonld.jsonld');
    ImportUserDataSteps.checkImportedResource(2, 'bnodes.ttl');
}

function uploadFiles(data) {
    // Given there are no files uploaded yet
    ImportUserDataSteps.getResourcesTable().should('be.hidden');
    // When I upload multiple files
    const createdFiles = data.map((fileData) => {
        return ImportUserDataSteps.createFile(fileData.name, fileData.content);
    });
    ImportUserDataSteps.selectFile(createdFiles);
    ImportSettingsDialogSteps.cancelImport();
    ImportSettingsDialogSteps.getDialog().should('not.exist');
    ImportUserDataSteps.getResources().should('have.length', data.length);
    // check them backwards because  latest uploaded/imported files are at the top
    data.forEach((file, index) => {
        ImportUserDataSteps.checkUserDataUploadedResource(index, file.name);
    });
}
