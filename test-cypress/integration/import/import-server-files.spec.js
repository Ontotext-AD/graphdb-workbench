import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {ImportServerFilesSteps} from "../../steps/import/import-server-files-steps";

describe('Import server files', () => {

    let repositoryId;

    const JSONLD_FILE_FOR_IMPORT = '0007-import-file.jsonld';

    beforeEach(() => {
        repositoryId = 'server-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        ImportServerFilesSteps.visitServerImport(repositoryId);
        ImportServerFilesSteps.getResources().should('have.length', 14);
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
        // Then I expect import help message to be hidden because it is not an empty state
        ImportServerFilesSteps.getHelpMessage().should('not.exist');
        // When I click on the help button
        ImportServerFilesSteps.openHelpMessage();
        // Then the help should appear
        ImportServerFilesSteps.getHelpMessage().should('be.visible');
        // When I close the help
        ImportServerFilesSteps.closeHelpMessage();
        // Then the help should disappear
        ImportServerFilesSteps.getHelpMessage().should('not.exist');
    });

    it('Should be able to filter the files', () => {
        // When the server files tab is loaded
        // Then I should see all the files
        ImportServerFilesSteps.getResources().should('have.length', 14);
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
        ImportServerFilesSteps.getResources().should('have.length', 14);
        // When I select the folders only filter
        ImportServerFilesSteps.selectFoldersOnlyFilter();
        // Then I should see only the folders
        ImportServerFilesSteps.getShowOnlyFoldersButton().should('have.class', 'active');
        ImportServerFilesSteps.getResources().should('have.length', 1);
        // When I select the files only filter
        ImportServerFilesSteps.selectFilesOnlyFilter();
        // Then I should see only the files
        ImportServerFilesSteps.getResources().should('have.length', 13);
    });
});
