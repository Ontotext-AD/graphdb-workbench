import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {ImportServerFilesSteps} from "../../steps/import/import-server-files-steps";
import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";

describe('Import server files', () => {

    let repositoryId;

    const JSONLD_FILE_FOR_IMPORT = '0007-import-file.jsonld';

    beforeEach(() => {
        repositoryId = 'server-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        ImportServerFilesSteps.visitServerImport(repositoryId);
        ImportServerFilesSteps.getResources().should('have.length', 17);
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
        ImportServerFilesSteps.getResources().should('have.length', 17);
        // When I select the folders only filter
        ImportServerFilesSteps.selectFoldersOnlyFilter();
        // Then I should see only the folders
        ImportServerFilesSteps.getShowOnlyFoldersButton().should('have.class', 'active');
        ImportServerFilesSteps.getResources().should('have.length', 2);
        // When I select the files only filter
        ImportServerFilesSteps.selectFilesOnlyFilter();
        // Then I should see only the files
        ImportServerFilesSteps.getResources().should('have.length', 15);
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
        ImportServerFilesSteps.checkImportedStatusIsEmpty('jsonld-file.jsonld');
        ImportServerFilesSteps.checkImportedStatusIsEmpty('rdfxml.rdf');
    });
});
