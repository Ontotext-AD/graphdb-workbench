import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {WindowSteps} from "../../steps/window-steps";

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

    // Can't test this on CI. This can only be run in browser.
    it.skip('should be able to copy the max file size limit property', () => {
        // Given I have visited the import page
        ImportUserDataSteps.visit();
        // When the page is loaded
        // And I click the copy button next to the max file size limit property
        ImportUserDataSteps.copyMaxFileSizeLimitProperty();
        // Then I should be able to copy the max file size limit property
        WindowSteps.getClipboardTextContent().should('equal', 'graphdb.workbench.maxUploadSize');
    });
});
