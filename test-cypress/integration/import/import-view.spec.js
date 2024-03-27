import ImportSteps from "../../steps/import/import-steps";

const bnodes = `_:node0 <http://purl.org/dc/elements/1.1/title> "A new book" ;
                    \t<http://purl.org/dc/elements/1.1/creator> "A.N.Other" .`;

describe('Import view', () => {

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

    it('Should be able to toggle between user data and server files tabs', () => {
        // Given I have opened the user data tab and uploaded a single file
        ImportSteps.getUserDataUploadedFilesTable().should('be.hidden');
        ImportSteps.selectFile(ImportSteps.createFile(testFiles[0], bnodes));
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        ImportSteps.getUserDataUploadedFile(0).should('contain', 'bnodes.ttl');
        // When I switch to the server files tab
        ImportSteps.openServerFilesTab();
        // Then I should see the server files only
        ImportSteps.getServerFiles().should('have.length', 11);
        // When I switch back to the user data tab
        ImportSteps.openUserDataTab();
        // Then I should see the uploaded file
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        ImportSteps.getUserDataUploadedFile(0).should('contain', 'bnodes.ttl');
    });
});
