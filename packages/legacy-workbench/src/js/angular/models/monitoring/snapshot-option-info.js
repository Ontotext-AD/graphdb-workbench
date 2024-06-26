export class SnapshotOptionInfo {
    constructor() {
        this.withRepositoryData = false;
        this.withSystemData = false;
        this.withClusterData = false;
        this.cleanDataDir = false;
        this.removeCluster = false;
        this.repositories = [];
        this.replicationTimeoutMs = 0;
    }
}
