import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";
import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {ImportServerFilesSteps} from "../../steps/import/import-server-files-steps";
import ImportSteps from "../../steps/import/import-steps";
import HomeSteps from "../../steps/home-steps";

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
        // Then the import settings dialog should open automatically
        ImportSettingsDialogSteps.getDialog().should('be.visible');
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.getResources().should('have.length', 1);
        ImportUserDataSteps.getResourceByName('bnodes.ttl').should('be.visible');
        // When I switch to the server files tab
        ImportUserDataSteps.openServerFilesTab();
        // Then I should see the server files only
        ImportServerFilesSteps.getResources().should('have.length', 18);
        // When I switch back to the user data tab
        ImportServerFilesSteps.openUserDataTab();
        // Then I should see the uploaded file
        ImportUserDataSteps.getResources().should('have.length', 1);
        ImportUserDataSteps.getResourceByName('bnodes.ttl').should('be.visible');
        ImportUserDataSteps.checkImportedResource(0, 'bnodes.ttl');
    });

    it('Should display/hide help message depends on resource result', () => {
        // Given I am on import page

        // Then help message has to be displayed, because the result of imported files are empty.
        ImportUserDataSteps.getHelpMessage().should('exist');

        // When I toggle the help
        ImportUserDataSteps.toggleHelpMessage();

        // Then help message mustn't be displayed because the user has hidden it, regardless resources are empty.
        ImportUserDataSteps.getHelpMessage().should('not.exist');

        // When I go to server tab
        ImportSteps.openServerFilesTab();

        // Then help message mustn't be displayed because the resources are not empty.
        ImportServerFilesSteps.getHelpMessage().should('not.exist');

        // When I toggle the server help
        ImportServerFilesSteps.toggleHelpMessage();

        // Then I expect the help message be displayed.
        ImportServerFilesSteps.getHelpMessage().should('exist');

        // When I return to the user tab
        ImportSteps.openUserDataTab();

        // Then help message mustn't be displayed because the user has hidden it, regardless resources are empty.
        ImportUserDataSteps.getHelpMessage().should('not.exist');

        // When I go to server tab
        ImportSteps.openServerFilesTab();

        // Then I expect the help message be displayed.
        ImportServerFilesSteps.getHelpMessage().should('exist');


        // When I go to other view
        HomeSteps.visit();
        // And return to import user data
        ImportUserDataSteps.visit();

        // Then I expect the help message to be displayed, because there are no results, regardless of whether the user had previously hidden the help message.
        ImportUserDataSteps.getHelpMessage().should('exist');

        // When I go to server tab
        ImportSteps.openServerFilesTab();

        // Then help message mustn't be displayed because the resources are not empty.
        ImportServerFilesSteps.getHelpMessage().should('not.exist');

        // When I go to user tab and upload a file
        ImportSteps.openUserDataTab();
        // And I wait for tab data to load
        ImportUserDataSteps.selectFile(ImportUserDataSteps.createFile(testFiles[0], bnodes));
        // Then the import settings dialog should open automatically
        ImportSettingsDialogSteps.getDialog().should('be.visible');
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.getResources().should('have.length', 1);
        ImportUserDataSteps.checkImportedResource(0, 'bnodes.ttl');

        // Then I expect the help message not exist, because user because there are resource displayed
        ImportUserDataSteps.getHelpMessage().should('not.exist');
    });
});
