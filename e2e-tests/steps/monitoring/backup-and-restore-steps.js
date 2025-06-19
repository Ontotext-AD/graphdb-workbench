import {BaseSteps} from "../base-steps";

export class BackupAndRestoreSteps extends BaseSteps {

    static visit() {
        cy.visit('/monitor/backup-and-restore');
    }

    static getBackupAndRestorePage() {
        return this.getByTestId('backup-and-restore-page');
    }

    static getInfoMessageElement() {
        return this.getBackupAndRestorePage().getByTestId('no-running-backup-and-restore-alert');
    }

    static getBackupAndRestoreResults() {
        return this.getBackupAndRestorePage().find('table tbody tr');
    }
}
