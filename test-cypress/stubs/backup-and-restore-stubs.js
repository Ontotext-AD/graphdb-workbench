export class BackupAndRestoreStubs {
    static stubBackupAndRestoreResponse(withDelay = 0) {
        BackupAndRestoreStubs.stubQueryResponse('/rest/monitor/backup', '/monitoring/backup-and-restore.json', 'backup-and-restore-response', withDelay);
    }

    static stubQueryResponse(url, fixture, alias, withDelay = 0) {
        cy.intercept(url, {fixture, delay: withDelay}).as(alias);
    }
}
