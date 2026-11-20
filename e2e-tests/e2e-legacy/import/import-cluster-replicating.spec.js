import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {ImportStubs} from "../../stubs/import/import-stubs";
import {ApplicationSteps} from "../../steps/application-steps";

describe('Import user data replicated to the cluster', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'import-cluster-replicating-' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should show a replicating import that cannot be aborted, removed or imported', () => {
        // Given a user data import is being replicated to the cluster
        ImportStubs.stubGetUploadedFiles(repositoryId, '/import/get-uploaded-files-cluster-replicating.json');
        // When I open the user data tab
        ImportUserDataSteps.visitUserImport(repositoryId);
        cy.wait('@getUploadedFiles');

        // Then I expect the file to be labelled as replicating
        ImportUserDataSteps.getResourceStatus('replicating-file.ttl').should('contain.text', 'Replicating...');
        // And I can't import it
        ImportUserDataSteps.getResourceImportButton('replicating-file.ttl').should('not.exist');
        // And Abort is disabled, with a tooltip saying why
        ImportUserDataSteps.getResourceAbortButton('replicating-file.ttl').should('be.disabled');
        ImportUserDataSteps.hoverResourceAbortButton('replicating-file.ttl');
        ApplicationSteps.getTooltip().should('have.text', 'Import cannot be interrupted while being replicated to the cluster');
        // And Remove is disabled, with a tooltip saying why
        ImportUserDataSteps.getResourceRemoveButton('replicating-file.ttl').should('be.disabled');
        ImportUserDataSteps.hoverResourceRemoveButton('replicating-file.ttl');
        ApplicationSteps.getTooltip().should('have.text', 'Import cannot be removed while being replicated to the cluster');
    });

    it('should show the error and refresh the list when the server rejects an abort or a remove', () => {
        // Given a user data file is being imported and another one is imported
        ImportStubs.stubGetUploadedFiles(repositoryId, '/import/get-uploaded-files-importing-and-done.json');
        // And the server rejects aborting and removing them
        ImportStubs.stubStopUserDataImportError(repositoryId);
        ImportStubs.stubResetUserDataStatusError(repositoryId);
        // And I have opened the user data tab
        ImportUserDataSteps.visitUserImport(repositoryId);
        cy.wait('@getUploadedFiles');

        // When I abort the import
        ImportUserDataSteps.abortImport('importing-file.ttl');
        cy.wait('@stopUserDataImport');
        // Then I expect the server message in a warning
        ApplicationSteps.getWarningNotification().should('contain.text', 'Could not stop import; The transaction can no longer be stopped');
        // And the list to be refreshed
        cy.wait('@getUploadedFiles');

        // When I remove the imported file
        ImportUserDataSteps.removeResource('imported-file.ttl');
        cy.wait('@resetUserDataStatus');
        // Then I expect the server message in a warning
        ApplicationSteps.getWarningNotification().should('contain.text', 'Could not clear status; The transaction can no longer be stopped');
        // And the list to be refreshed
        cy.wait('@getUploadedFiles');
    });
});
