import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";
import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {ImportServerFilesSteps} from "../../steps/import/import-server-files-steps";

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
        ImportUserDataSteps.visitImport('user', repositoryId);
    });

    afterEach(() => {
        cy.deleteUploadedFile(repositoryId, testFiles);
        cy.deleteRepository(repositoryId);
    });

    it('Should be able to toggle between user data and server files tabs', () => {
        // Given I have opened the user data tab and uploaded a single file
        ImportUserDataSteps.getResourcesTable().should('be.hidden');
        ImportUserDataSteps.selectFile(ImportUserDataSteps.createFile(testFiles[0], bnodes));
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.getResources().should('have.length', 1);
        ImportUserDataSteps.getResourceByName('bnodes.ttl').should('be.visible');
        // When I switch to the server files tab
        ImportUserDataSteps.openServerFilesTab();
        // Then I should see the server files only
        ImportServerFilesSteps.getResources().should('have.length', 14);
        // When I switch back to the user data tab
        ImportServerFilesSteps.openUserDataTab();
        // Then I should see the uploaded file
        ImportUserDataSteps.getResources().should('have.length', 1);
        ImportUserDataSteps.getResourceByName('bnodes.ttl').should('be.visible');
    });
});
