const modules = [];
const UPDATE_BACKUP_AND_RESTORE_INFO_DATA_TIME_INTERVAL = 2000;

angular
    .module('graphdb.framework.monitoring.backupandrestore.controllers', modules)
    .controller('BackupAndRestoreCtrl', BackupAndRestoreCtrl);

BackupAndRestoreCtrl.$inject = ['$scope', '$interval', 'MonitoringRestService'];

function BackupAndRestoreCtrl($scope, $interval, MonitoringRestService) {

    $scope.loading = false;
    $scope.initialized = false;

    /**
     * @type {BackupAndRestoreInfo[]}
     */
    $scope.backupAndRestoreInfos = undefined;
    $scope.hasClusterOperation = false;
    let timer = undefined;

    // =========================
    // Public functions
    // =========================
    $scope.hasToShowValue = (value) => {
        if (typeof value === 'boolean') {
            return true;
        }
        return !!value;
    };

    // =========================
    // Private functions
    // =========================
    const loadBackupAndRestoreData = () => {
        if ($scope.loading) {
            return;
        }
        $scope.loading = true;
        MonitoringRestService.monitorBackup()
            .then((backupAndRestoreInfos) => {
                $scope.backupAndRestoreInfos = backupAndRestoreInfos;
                $scope.initialized = true;
                $scope.hasClusterOperation = $scope.backupAndRestoreInfos.some((backupAndRestoreInfo) => backupAndRestoreInfo.nodePerformingClusterBackup);
            })
            .finally(() => $scope.loading = false);
    };

    const removeAllListeners = () => {
        if (timer) {
            $interval.cancel(timer);
        }
    };

    // =========================
    // Event handlers
    // =========================
    $scope.$on('$destroy', removeAllListeners);

    // =========================
    // Initializes controller.
    // =========================
    loadBackupAndRestoreData();
    timer = $interval(() => loadBackupAndRestoreData(), UPDATE_BACKUP_AND_RESTORE_INFO_DATA_TIME_INTERVAL);
}
