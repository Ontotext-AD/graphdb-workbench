import {BackupAndRestoreInfo} from "../../models/monitoring/backup-and-restore-info";
import {SnapshotOptionInfo} from "../../models/monitoring/snapshot-option-info";

export const mapBackupAndRestoreResponseToModel = ((backupAndRestoreResponseData) => {
    const backupAndRestoreInfos = [];
    const backupAndRestoreInfo = new BackupAndRestoreInfo();
    if (Object.keys(backupAndRestoreResponseData).length === 0) {
        return backupAndRestoreInfos;
    }
    backupAndRestoreInfo.id = backupAndRestoreResponseData.id;
    backupAndRestoreInfo.username = backupAndRestoreResponseData.username;
    backupAndRestoreInfo.operation = backupAndRestoreResponseData.operation;
    backupAndRestoreInfo.affectedRepositories = backupAndRestoreResponseData.affectedRepositories;
    backupAndRestoreInfo.secondsSinceCreated = backupAndRestoreResponseData.msSinceCreated / 1000;
    backupAndRestoreInfo.snapshotOptions = mapSnapshotOptionsResponseToModel(backupAndRestoreResponseData.snapshotOptions);
    backupAndRestoreInfo.nodePerformingClusterBackup = backupAndRestoreResponseData.nodePerformingClusterBackup;
    backupAndRestoreInfos.push(backupAndRestoreInfo);
    return backupAndRestoreInfos;
});

export const mapSnapshotOptionsResponseToModel = ((snapshotOption) => {
    const snapshotOptionInfo = new SnapshotOptionInfo();
    snapshotOptionInfo.withRepositoryData = snapshotOption.withRepositoryData;
    snapshotOptionInfo.withSystemData = snapshotOption.withSystemData;
    snapshotOptionInfo.withClusterData = snapshotOption.withClusterData;
    snapshotOptionInfo.cleanDataDir = snapshotOption.cleanDataDir;
    snapshotOptionInfo.removeCluster = snapshotOption.removeCluster;
    snapshotOptionInfo.repositories = snapshotOption.repositories;
    snapshotOptionInfo.replicationTimeoutMs = snapshotOption.replicationTimeoutMs;
    return snapshotOptionInfo;
});
