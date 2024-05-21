import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";

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
        ImportUserDataSteps.visit();
        // When the page is loaded
        cy.url().should('include', '/import#user');
        // Then I should see the user help icons
        ImportUserDataSteps.showPageInfoPopover();
        ImportUserDataSteps.getPageInfoPopover().should('be.visible');
        // And user data import tab should be selected by default
        ImportUserDataSteps.getActiveTab().should('have.text', 'User data');
        ImportUserDataSteps.getUserDataTab().should('be.visible');
        ImportUserDataSteps.getUploadRdfFilesButton().should('be.visible');
        ImportUserDataSteps.getUploadFromUrlButton().should('be.visible');
        ImportUserDataSteps.getUploadTextSnippetButton().should('be.visible');
    });

    it('Should show the file size limit warning', () => {
        // Given I have visited the import page
        ImportUserDataSteps.visit();
        // When the page is loaded
        // Then I should see the file size limit warning
        ImportUserDataSteps.getFileSizeLimitWarning().should('be.visible');
        // When I click the server files tab through the link in the warning
        ImportUserDataSteps.openServerFilesTabFromWarning();
        // Then I should see the server files tab
        ImportUserDataSteps.getActiveTab().should('have.text', 'Server files');
        cy.url().should('include', '/import#server');
        ImportUserDataSteps.getServerFilesTab().should('be.visible');
        // When I click on the API link in the warning
        ImportUserDataSteps.openUserDataTab();
        ImportUserDataSteps.getUserDataTab().should('be.visible');
        ImportUserDataSteps.openAPIViewFromWarning();
        // Then I should see the API view
        cy.url().should('include', '/webapi');
    });

    it('Should be able to toggle the user data import help', () => {
        // Given I have visited the import page
        ImportUserDataSteps.visit();
        // When the page is loaded and no uploaded files are present
        // Then I should see the user data import help
        ImportUserDataSteps.getHelpMessage().should('be.visible');
        // When I close the help
        ImportUserDataSteps.closeHelpMessage();
        // Then the help should disappear
        ImportUserDataSteps.getHelpMessage().should('not.exist');
        // When I visit the import page again the help should appear again in the empty state
        ImportUserDataSteps.openAPIViewFromWarning();
        cy.url().should('include', '/webapi');
        ImportUserDataSteps.visit();
        ImportUserDataSteps.getHelpMessage().should('be.visible');
    });

    it('Should be able to open and close help message', () => {
        // Given I have visited the import page
        ImportUserDataSteps.visit();
        // When the page is loaded and no uploaded files are present
        ImportUserDataSteps.getResources().should('have.length', 0);
        // Then I should see the user data import help
        ImportUserDataSteps.getHelpMessage().should('be.visible');
        // When I upload a text snippet
        ImportUserDataSteps.openImportTextSnippetDialog();
        ImportUserDataSteps.fillRDFTextSnippet(RDF_TEXT_SNIPPET);
        ImportUserDataSteps.clickImportTextSnippetButton();
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.getResources().should('have.length', 1);
        // Then the help should disappear because it's not an empty state anymore
        ImportUserDataSteps.getHelpMessage().should('not.exist');
        // When I open the help message
        ImportUserDataSteps.openHelpMessage();
        // Then the help message should appear
        ImportUserDataSteps.getHelpMessage().should('be.visible');
        // When I visit another page and return
        cy.visit('/webapi');
        cy.url().should('include', '/webapi');
        ImportUserDataSteps.visit();
        ImportUserDataSteps.getResources().should('have.length', 1);
        // Then the help should not appear because it's not an empty state
        ImportUserDataSteps.getHelpMessage().should('not.exist');
        // When I delete the uploaded file
        ImportUserDataSteps.deleteUploadedFile(0);
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.clickOnConfirmButton();
        ModalDialogSteps.getDialog().should('not.exist');
        // Then the help should appear again
        ImportUserDataSteps.getHelpMessage().should('be.visible');
    });

    // Can't test this on CI
    it.skip('should be able to copy the max file size limit property', () => {
        // Given I have visited the import page
        ImportUserDataSteps.visit();
        // When the page is loaded
        // And I click the copy button next to the max file size limit property
        ImportUserDataSteps.copyMaxFileSizeLimitProperty();
        // Then I should be able to copy the max file size limit property
        ImportUserDataSteps.getClipboardTextContent().should('equal', 'graphdb.workbench.maxUploadSize');
    });
});
