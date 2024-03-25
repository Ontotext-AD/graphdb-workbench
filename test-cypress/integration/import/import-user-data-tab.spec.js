import ImportSteps from '../../steps/import-steps';

describe('Import user data tab: initial state', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'user-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should load user data import tab by default', () => {
        // Given I have visited the import page
        ImportSteps.visit();
        // When the page is loaded
        cy.url().should('include', '/import#user');
        // Then I should see the user help icons
        ImportSteps.showPageInfoPopover();
        ImportSteps.getPageInfoPopover().should('be.visible');
        // And user data import tab should be selected by default
        ImportSteps.getActiveTab().should('have.text', 'User data');
        ImportSteps.getUserDataTab().should('be.visible');
        ImportSteps.getUploadRdfFilesButton().should('be.visible');
        ImportSteps.getUploadFromUrlButton().should('be.visible');
        ImportSteps.getUploadTextSnippetButton().should('be.visible');
    });

    it('Should show the file size limit warning', () => {
        // Given I have visited the import page
        ImportSteps.visit();
        // When the page is loaded
        // Then I should see the file size limit warning
        ImportSteps.getFileSizeLimitWarning().should('be.visible');
        // When I click the server files tab through the link in the warning
        ImportSteps.openServerFilesTabFromWarning();
        // Then I should see the server files tab
        ImportSteps.getActiveTab().should('have.text', 'Server files');
        cy.url().should('include', '/import#server');
        ImportSteps.getServerFilesTab().should('be.visible');
        // When I click on the API link in the warning
        ImportSteps.openUserDataTab();
        ImportSteps.getUserDataTab().should('be.visible');
        ImportSteps.openAPIViewFromWarning();
        // Then I should see the API view
        cy.url().should('include', '/webapi');
    });

    it('Should show the user data import help', () => {
        // Given I have visited the import page
        ImportSteps.visit();
        // When the page is loaded and no uploaded files are present
        // Then I should see the user data import help
        ImportSteps.getImportUserDataHelp().should('be.visible');
        // When I close the help
        ImportSteps.closeImportUserDataHelp();
        // Then the help should disappear
        ImportSteps.getImportUserDataHelp().should('not.be.visible');
        // When I visit the import page again the help should appear again in the empty state
        ImportSteps.openAPIViewFromWarning();
        cy.url().should('include', '/webapi');
        ImportSteps.visit();
        ImportSteps.getImportUserDataHelp().should('be.visible');
    });

    it('should be able to copy the max file size limit property', () => {
        // Given I have visited the import page
        ImportSteps.visit();
        // When the page is loaded
        // And I click the copy button next to the max file size limit property
        ImportSteps.copyMaxFileSizeLimitProperty();
        // Then I should be able to copy the max file size limit property
        ImportSteps.getClipboardTextContent().should('equal', 'graphdb.workbench.maxUploadSize');
    });
});
