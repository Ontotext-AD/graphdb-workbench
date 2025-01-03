export class BackupAndRestoreSteps {

    static visit() {
        cy.visit('/monitor/backup-and-restore');
    }

    static getInfoMessageElement() {
        return cy.get('.no-running-backup-and-restore-alert');
    }

    static getBackupAndRestoreResults() {
        return cy.get('.backup-and-restore table tbody tr');
    }
}
