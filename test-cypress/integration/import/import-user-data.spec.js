import ImportSteps from "../../steps/import/import-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";

const RDF_TEXT_SNIPPET = '@prefix ab:<http://learningsparql.com/ns/addressbook#>.\n\n' +
    'ab:richard ab:homeTel "(229)276-5135".\n' +
    'ab:richard ab:email "richard491@hotmail.com".';

describe('Import user data', () => {

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

    it('Should be able to toggle the user data import help', () => {
        // Given I have visited the import page
        ImportSteps.visit();
        // When the page is loaded and no uploaded files are present
        // Then I should see the user data import help
        ImportSteps.getImportUserDataHelp().should('be.visible');
        // When I close the help
        ImportSteps.closeImportUserDataHelp();
        // Then the help should disappear
        ImportSteps.getImportUserDataHelp().should('not.exist');
        // When I visit the import page again the help should appear again in the empty state
        ImportSteps.openAPIViewFromWarning();
        cy.url().should('include', '/webapi');
        ImportSteps.visit();
        ImportSteps.getImportUserDataHelp().should('be.visible');
    });

    it('Should be able to open and close help message', () => {
        // Given I have visited the import page
        ImportSteps.visit();
        // When the page is loaded and no uploaded files are present
        ImportSteps.getUserDataUploadedFiles().should('have.length', 0);
        // Then I should see the user data import help
        ImportSteps.getImportUserDataHelp().should('be.visible');
        // When I have uploaded a text snippet
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(RDF_TEXT_SNIPPET);
        ImportSteps.clickImportTextSnippetButton();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.getUserDataUploadedFiles().should('have.length', 1);
        // And I close the help
        ImportSteps.closeImportUserDataHelp();
        // And I visit another page and return
        cy.visit('/webapi');
        cy.url().should('include', '/webapi');
        ImportSteps.visit();
        // Then the help should not appear because I have closed it explicitly
        ImportSteps.getImportUserDataHelp().should('not.exist');
        // When I delete the uploaded file
        ImportSteps.deleteUploadedFile(0);
        ModalDialogSteps.clickOnConfirmButton();
        ModalDialogSteps.getDialog().should('not.exist');
        // Then the help should appear again
        ImportSteps.getImportUserDataHelp().should('be.visible');
    });

    // Can't test this on CI
    it.skip('should be able to copy the max file size limit property', () => {
        // Given I have visited the import page
        ImportSteps.visit();
        // When the page is loaded
        // And I click the copy button next to the max file size limit property
        ImportSteps.copyMaxFileSizeLimitProperty();
        // Then I should be able to copy the max file size limit property
        ImportSteps.getClipboardTextContent().should('equal', 'graphdb.workbench.maxUploadSize');
    });
});
