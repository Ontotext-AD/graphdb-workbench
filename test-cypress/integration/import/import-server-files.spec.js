import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {ImportServerFilesSteps} from "../../steps/import/import-server-files-steps";
import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";
import {ImportResourceMessageDialog} from "../../steps/import/import-resource-message-dialog";
import {ApplicationSteps} from "../../steps/application-steps";

describe('Import server files', () => {

    let repositoryId;

    const JSONLD_FILE_FOR_IMPORT = '0007-import-file.jsonld';

    beforeEach(() => {
        repositoryId = 'server-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        ImportServerFilesSteps.visitServerImport(repositoryId);
        ImportServerFilesSteps.getResources().should('have.length', 18);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should be able to open the server files tab through a click on the tab', () => {
        // Given I have visited the import page
        ImportUserDataSteps.visit();
        ImportUserDataSteps.getActiveTab().should('have.text', 'User data');
        // When I switch to the server files tab
        ImportUserDataSteps.openServerFilesTab();
        // Then Server files tab should be active
        cy.url().should('include', '/import#server');
        ImportServerFilesSteps.getActiveTab().should('have.text', 'Server files');
        ImportServerFilesSteps.getResourcesTable().should('be.visible');
    });

    it('Should be able to open the server files tab through a link', () => {
        // When I visit the import page through a direct link to the server files tab
        cy.visit('/import#server');
        // Then Server files tab should be active
        cy.url().should('include', '/import#server');
        ImportServerFilesSteps.getActiveTab().should('have.text', 'Server files');
        ImportServerFilesSteps.getResourcesTable().should('be.visible');
    });

    it('Should be able to toggle the server file import help', () => {
        // When the page is loaded
        // Then I should not see the server files import help
        ImportServerFilesSteps.getHelpMessage().should('not.exist');
        // When I open the help
        ImportServerFilesSteps.toggleHelpMessage();
        // Then the help should disappear
        ImportServerFilesSteps.getHelpMessage().should('be.visible');
    });

    it('Should be able to filter the files', () => {
        // When the server files tab is loaded
        // Then I should see all the files
        // When I type in the filter filed
        ImportServerFilesSteps.typeInFilterField('007');
        // Then I should see only the files matching the filter
        ImportServerFilesSteps.getResources().should('have.length', 1);
        ImportServerFilesSteps.getResourceByName(JSONLD_FILE_FOR_IMPORT).should('be.visible');
    });

    it('Should be able to switch between files, folders and mixed list', () => {
        // When the server files tab is loaded
        // Then I should see all the files and folders by default
        ImportServerFilesSteps.getShowAllResourceTypesButton().should('have.class', 'active');
        ImportServerFilesSteps.getResources().should('have.length', 18);
        // When I select the folders only filter
        ImportServerFilesSteps.selectFoldersOnlyFilter();
        // Then I should see only the folders
        ImportServerFilesSteps.getShowOnlyFoldersButton().should('have.class', 'active');
        ImportServerFilesSteps.getResources().should('have.length', 2);
        // When I select the files only filter
        ImportServerFilesSteps.selectFilesOnlyFilter();
        // Then I should see only the files
        ImportServerFilesSteps.getResources().should('have.length', 16);
    });

    it('should be able to import the whole directory', () => {
        // When the server files tab is loaded
        // When I try to import a directory that contains resources with correct rdf data.
        ImportServerFilesSteps.importResourceByName('more-files');
        ImportSettingsDialogSteps.import();

        // Then I expect all files to be successfully imported.
        ImportServerFilesSteps.checkImportedResource(0, 'more-files', 'Imported successfully in');
        ImportServerFilesSteps.checkImportedResource(1, 'jsonld-file.jsonld', 'Imported successfully in');
        ImportServerFilesSteps.checkImportedResource(2, 'rdfxml.rdf', 'Imported successfully in');

        // When I try to import a directory that contains resources with incorrect rdf data.
        ImportServerFilesSteps.importResourceByName('more-files-with-error');
        ImportSettingsDialogSteps.import();
        // Then I expect no one file be imported.
        ImportServerFilesSteps.checkImportedResource(0, 'more-files-with-error', 'RDF Parse Error: The element type "ex:editor" must be terminated by the matching end-ta');
        ImportServerFilesSteps.checkImportedStatusIsEmpty('import-resource-with-correct-data.jsonld');
        ImportServerFilesSteps.checkImportedStatusIsEmpty('import-resource-with-incorrect-data.rdf');

        // When I click on a directory reset status button
        ImportServerFilesSteps.resetResourceStatusByName('more-files');

        // Then I expect all sub-resource statuses to be reset.
        ImportServerFilesSteps.checkImportedStatusIsEmpty('more-files');
        // TODO: When the status of a given folder is reset, all sub-folder/file statuses should be reset. This works correctly
        // when the scenario is executed manually or if the test is run locally. For some reason, in the Jenkins environment, the status is cleared
        // only for the folder. The next two lines are correct but are commented out to be tried again later.
        // ImportServerFilesSteps.checkImportedStatusIsEmpty('jsonld-file.jsonld');
        // ImportServerFilesSteps.checkImportedStatusIsEmpty('rdfxml.rdf');
    });

    it('should open error dialog', () => {
        const importResourceName = 'import-resource-with-long-error.rdf';
        // When I visited the server import tab,
        // and try to import a file with wrong data that causes server to generate long error message.
        ImportServerFilesSteps.importResourceByName(importResourceName);
        ImportSettingsDialogSteps.import();

        // I expect only part of the error be displayed,
        ImportServerFilesSteps.checkImportedResource(0, importResourceName, 'RDF Parse Error: The element type ');
        // and when click on that error
        ImportServerFilesSteps.openErrorDialog(importResourceName);

        // Then I expect to see dialog,
        ImportSettingsDialogSteps.getDialog().should('be.visible');

        // with full error message
        ImportResourceMessageDialog.getMessage().should('have.value', 'RDF Parse Error: The element type "ex:looooooooooooooooooooooooooooooooongTaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabNaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaame" must be terminated by the matching end-tag "</ex:looooooooooooooooooooooooooooooooongTaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabNaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaame>". [line 9, column 6]');

        // When I click on corner close button.
        ImportResourceMessageDialog.clickOnCornerCloseButton();

        // // Then I expect the dialog closed
        ImportResourceMessageDialog.getDialog().should('not.exist');

        // When error dialog is opened,
        ImportServerFilesSteps.openErrorDialog(importResourceName);
        ImportResourceMessageDialog.getDialog().should('be.visible');
        // and I click one close button
        ImportResourceMessageDialog.clickOnCloseButton();

        // Then I expect the dialog closed
        ImportResourceMessageDialog.getDialog().should('not.exist');
    });
});
