import 'angular/rest/cluster.rest.service';

angular
    .module('graphdb.framework.clustermanagement.controllers.edit-cluster', [])
    .controller('EditClusterCtrl', EditClusterCtrl);

EditClusterCtrl.$inject = ['$scope', '$uibModalInstance', '$timeout', 'ClusterRestService', 'toastr', '$translate', 'data'];

function EditClusterCtrl($scope, $uibModalInstance, $timeout, ClusterRestService, toastr, $translate, data) {

    // =========================
    // Public variables
    // =========================

    $scope.pageTitle = $translate.instant('cluster_management.cluster_page.edit_page_title');
    $scope.errors = [];
    $scope.clusterConfiguration = _.cloneDeep(data.clusterConfiguration);
    $scope.loader = false;
    $scope.configFields = [
        {
            id: 'election-minimum-timeout',
            name: 'electionMinTimeout',
            label: 'cluster_management.cluster_configuration_properties.election_min_timeout',
            tooltip: 'cluster_management.cluster_configuration_properties.election_min_timeout_tooltip',
            errorMsg: 'cluster_management.cluster_page.errors.only_positive_integers'
        },
        {
            id: 'election-range-timeout',
            name: 'electionRangeTimeout',
            label: 'cluster_management.cluster_configuration_properties.election_range_timeout',
            tooltip: 'cluster_management.cluster_configuration_properties.election_range_timeout_tooltip',
            errorMsg: 'cluster_management.cluster_page.errors.only_positive_integers'
        },
        {
            id: 'heartbeat-interval',
            name: 'heartbeatInterval',
            label: 'cluster_management.cluster_configuration_properties.heartbeat_interval',
            tooltip: 'cluster_management.cluster_configuration_properties.heartbeat_interval_tooltip',
            errorMsg: 'cluster_management.cluster_page.errors.only_positive_integers'
        },
         {
            id: 'message-size',
            name: 'messageSizeKB',
            label: 'cluster_management.cluster_configuration_properties.message_size_kb',
            tooltip: 'cluster_management.cluster_configuration_properties.message_size_kb_tooltip',
            errorMsg: 'cluster_management.cluster_page.errors.only_positive_integers'
        },
        {
            id: 'verification-timeout',
            name: 'verificationTimeout',
            label: 'cluster_management.cluster_configuration_properties.verification_timeout',
            tooltip: 'cluster_management.cluster_configuration_properties.verification_timeout_tooltip',
            errorMsg: 'cluster_management.cluster_page.errors.only_positive_integers'
        },
        {
            id: 'transaction-log-max-size',
            name: 'transactionLogMaximumSizeGB',
            label: 'cluster_management.cluster_configuration_properties.transaction_log_maximum_size_gb',
            tooltip: 'cluster_management.cluster_configuration_properties.transaction_log_maximum_size_gb_tooltip',
            pattern: '-?[1-9][0-9]*(\\.[0-9]+)?',
            errorMsg: 'cluster_management.cluster_page.errors.small_transaction_log_max_size'
        },
        {
            id: 'batch-update-interval',
            name: 'batchUpdateInterval',
            label: 'cluster_management.cluster_configuration_properties.batch_update_interval',
            tooltip: 'cluster_management.cluster_configuration_properties.batch_update_interval_tooltip',
            errorMsg: 'cluster_management.cluster_page.errors.only_positive_integers'
        }
    ];

    // =========================
    // Public functions
    // =========================

    $scope.updateClusterConfiguration = () => {
        $scope.setLoader(true, $translate.instant('cluster_management.cluster_page.updating_cluster_loader'));
        return ClusterRestService.updateClusterConfiguration($scope.clusterConfiguration)
            .then(() => {
                toastr.success($translate.instant('cluster_management.cluster_page.notifications.update_success'));
                $uibModalInstance.close();
            })
            .catch(function (response) {
                handleErrors(response.data, response.status);
            })
            .finally(() => $scope.setLoader(false));
    };

    $scope.isClusterConfigurationValid = () => {
        return !$scope.clusterConfigurationForm.$invalid;
    };

    $scope.setLoader = (loader, message) => {
        $timeout.cancel($scope.loaderTimeout);
        if (loader) {
            $scope.loaderTimeout = $timeout(() => {
                $scope.loader = loader;
                $scope.loaderMessage = message;
            }, 300);
        } else {
            $scope.loader = false;
        }
    };

    $scope.ok = () => {
        if (!$scope.isClusterConfigurationValid()) {
            toastr.warning($translate.instant('cluster_management.cluster_page.notifications.form_invalid'));
            return;
        }
        $scope.updateClusterConfiguration();
    };

    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.onClick = ($event) => {
        $event.stopPropagation();
    };

    // =========================
    // Private functions
    // =========================

    const handleErrors = (data, status) => {
        delete $scope.preconditionErrors;
        toastr.error($translate.instant('cluster_management.cluster_page.notifications.update_failed'));
        $scope.errors.splice(0);

        if (status === 409 || typeof data === 'string') {
            $scope.errors.push(data);
        } else if (status === 412) {
            $scope.preconditionErrors = Object.keys(data).map((key) => `${key} - ${data[key]}`);
        } else if (status === 400) {
            $scope.errors.push(...data);
        }
    };
}
