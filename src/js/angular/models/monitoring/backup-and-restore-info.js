export class BackupAndRestoreInfo {
    constructor() {
        this.id = undefined;
        this.username = '';

        /**
         * @type {string} - The value must be one of the @{see BackupAndRestoreOperationType} values.
         */
        this.operation = '';
        this.affectedRepositories = [];
        this.secondsSinceCreated = 0;
        this.snapshotOptions = [];
        this.nodePerformingClusterBackup = '';
    }
}
