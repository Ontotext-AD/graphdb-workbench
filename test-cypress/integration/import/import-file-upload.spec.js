import ImportSteps from "../../steps/import/import-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";

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
        'jsonld.json'
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

    it('Should be able to upload a single unique file', () => {
        // Given there are no files uploaded yet
        ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
        // When I upload a file
        ImportSteps.selectFile(ImportSteps.createFile(testFiles[0], bnodes));
        // Then I should see the uploaded file
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        ImportSteps.getUserDataUploadedFile(0).should('contain', 'bnodes.ttl');
    });

    it('Should be able to upload multiple unique file', () => {
        // Given there are no files uploaded yet
        ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
        // When I upload a file
        const file1 = ImportSteps.createFile(testFiles[0], bnodes);
        const file2 = ImportSteps.createFile(testFiles[1], jsonld);
        ImportSteps.selectFile([file1, file2]);
        // Then I should see the uploaded file
        ImportSteps.getUserDataUploadedFiles().should('have.length', 2);
        ImportSteps.getUserDataUploadedFile(0).should('contain', 'bnodes.ttl');
        ImportSteps.getUserDataUploadedFile(1).should('contain', 'jsonld.json');
    });

    it('Should be able to override a single file', () => {
        // Given I have uploaded a file
        ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
        const file1 = ImportSteps.createFile(testFiles[0], bnodes);
        ImportSteps.selectFile(file1);
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        ImportSteps.getUserDataUploadedFile(0).should('contain', 'bnodes.ttl');
        // When I upload a file with the same name
        ImportSteps.selectFile(file1);
        // Then I should see a file override confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I confirm the file override
        ModalDialogSteps.clickOnConfirmButton();
        // Then The file should be overridden
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        ImportSteps.getUserDataUploadedFile(0).should('contain', 'bnodes.ttl');
    });

    it('Should be able to upload file with same name and preserve the existing file', () => {
        // Given I have uploaded a file
        ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
        const file1 = ImportSteps.createFile(testFiles[0], bnodes);
        ImportSteps.selectFile(file1);
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        ImportSteps.getUserDataUploadedFile(0).should('contain', 'bnodes.ttl');
        // When I upload a file with the same name
        ImportSteps.selectFile(file1);
        // Then I should see a file override confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I cancel the file override
        ModalDialogSteps.clickOnCancelButton();
        // Then The file should not be overridden but prefixed instead
        ImportSteps.getUserDataUploadedFiles().should('have.length', 2);
        ImportSteps.getUserDataUploadedFile(0).should('contain', 'bnodes.ttl');
        ImportSteps.getUserDataUploadedFile(1).should('contain', 'bnodes-0.ttl');
        // When I upload two files, one with the same name and second new one
        const file2 = ImportSteps.createFile(testFiles[1], jsonld);
        ImportSteps.selectFile([file1, file2]);
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.clickOnCancelButton();
        // Then The file should not be overridden but prefixed with increased index instead
        ImportSteps.getUserDataUploadedFiles().should('have.length', 4);
        ImportSteps.getUserDataUploadedFile(0).should('contain', 'bnodes.ttl');
        ImportSteps.getUserDataUploadedFile(1).should('contain', 'bnodes-0.ttl');
        ImportSteps.getUserDataUploadedFile(2).should('contain', 'bnodes-1.ttl');
        ImportSteps.getUserDataUploadedFile(3).should('contain', 'jsonld.json');
    });
});
