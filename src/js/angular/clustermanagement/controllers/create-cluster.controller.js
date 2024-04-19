import 'angular/rest/cluster.rest.service';

const getAdvancedOptionsClass = function () {
    const optionsModule = document.getElementById('advancedOptions');

    if (optionsModule) {
        const isAriaExpanded = optionsModule.getAttribute('aria-expanded');
        if (isAriaExpanded && isAriaExpanded === 'true') {
            return 'fa fa-angle-down';
        }
    }
    return 'fa fa-angle-right';
};

angular
    .module('graphdb.framework.clustermanagement.controllers.create-cluster', [])
    .controller('CreateClusterCtrl', CreateClusterCtrl);

CreateClusterCtrl.$inject = ['$scope', '$uibModalInstance', '$timeout', 'ClusterRestService', 'toastr', '$translate', 'data', '$uibModal',
    'RemoteLocationsService', '$rootScope'];

function CreateClusterCtrl($scope, $uibModalInstance, $timeout, ClusterRestService, toastr, $translate, data, $uibModal, RemoteLocationsService, $rootScope) {

    // =========================
    // Public variables
    // =========================

    $scope.pageTitle = $translate.instant('cluster_management.cluster_page.create_page_title');
    $scope.autofocusId = 'autofocus';
    $scope.errors = [];
    $scope.clusterConfiguration = {
        electionMinTimeout: 8000,
        electionRangeTimeout: 6000,
        heartbeatInterval: 2000,
        messageSizeKB: 64,
        verificationTimeout: 1500,
        transactionLogMaximumSizeGB: 50,
        nodes: []
    };

    $scope.locations = data.clusterModel.locations.filter((location) => !location.isLocal);
    $scope.selectedLocations = data.clusterModel.locations.filter((location) => location.isLocal);

    $scope.loader = false;

    // =========================
    // Public functions
    // =========================

    $scope.deleteLocation = function (event, location) {
        event.preventDefault();
        event.stopPropagation();
        data.deleteLocation(location).then(() => $scope.locations = $scope.locations.filter((loc) => loc.endpoint !== location.endpoint));
    };

    $scope.getAdvancedOptionsClass = getAdvancedOptionsClass;

    $scope.createCluster = function () {
        $scope.setLoader(true, $translate.instant('cluster_management.cluster_page.creating_cluster_loader'));
        $scope.clusterConfiguration.nodes = $scope.selectedLocations.map((node) => node.rpcAddress);
        return ClusterRestService.createCluster($scope.clusterConfiguration)
            .then(() => {
                toastr.success($translate.instant('cluster_management.cluster_page.notifications.create_success'));
                $uibModalInstance.close();
            })
            .catch(function (error) {
                handleErrors(error.data, error.status);
            })
            .finally(() => {
                $scope.setLoader(false);
                $rootScope.$broadcast('reloadLocations');
            });
    };

    $scope.isClusterConfigurationValid = () => {
        const isFormValid = !$scope.clusterConfigurationForm.$invalid;
        const nodesListValid = $scope.selectedLocations && $scope.selectedLocations.length >= 2;
        return isFormValid && nodesListValid;
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

    $scope.addNodeToList = (location) => {
        if (!location.rpcAddress) {
            return;
        }
        $scope.selectedLocations.push(location);
        $scope.locations = $scope.locations.filter((loc) => loc.endpoint !== location.endpoint);
    };

    $scope.removeNodeFromList = (index, node) => {
        if (node.isLocal) {
            return;
        }
        $scope.selectedLocations.splice(index, 1);
        $scope.locations.push(node);
    };

    $scope.addLocation = () => {
        RemoteLocationsService.addLocation()
            .then((newLocation) => {
                if (newLocation) {
                    $scope.locations.push(newLocation);
                }
            });
    };

    $scope.ok = () => {
        if (!$scope.isClusterConfigurationValid()) {
            toastr.warning($translate.instant('cluster_management.cluster_page.notifications.form_invalid'));
            return;
        }
        $scope.createCluster();
    };

    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

    // =========================
    // Private functions
    // =========================

    const handleErrors = (data, status) => {
        let failMessage;
        delete $scope.preconditionErrors;
        $scope.errors.splice(0);
        if (status === 412) {
            $scope.preconditionErrors = Object.keys(data).map((key) => `${key} - ${data[key]}`);
        } else if (status === 400) {
            $scope.errors.push(...data);
        } else if (status === 409) {
            $scope.errors.push(data);
        } else if (data.message || typeof data === 'string'){
            failMessage = data.message || data;
        }
        toastr.error(failMessage, $translate.instant('cluster_management.cluster_page.notifications.create_failed'));

    };
}
