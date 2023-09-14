import {BackupAndRestoreSteps} from "../../steps/monitoring/backup-and-restore-steps";
import {BackupAndRestoreStubs} from "../../stubs/backup-and-restore-stubs";

describe("Monitoring 'Backup And Restore'", () => {

    beforeEach(() => {
        const repositoryId = 'backup-and-restore-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    it('should show running backup or restore operations', () => {
        // When visit the "Backup and restore page",
        BackupAndRestoreSteps.visit();
        // and there are run backup and restore operations.
        BackupAndRestoreStubs.stubBackupAndRestoreResponse();

        // Then I expect to see information for all run operations.
        BackupAndRestoreSteps.getBackupAndRestoreResults().should('have.length', 3);
    });
});
