import {Stubs} from "./stubs";

export class BackupAndRestoreStubs extends Stubs {
    static stubBackupAndRestoreResponse(withDelay = 0) {
        BackupAndRestoreStubs.stubQueryResponse('/rest/monitor/backup', '/monitoring/backup-and-restore.json', 'backup-and-restore-response', withDelay);
    }
}
