import 'angular/rest/cluster.rest.service';

angular
    .module('graphdb.framework.clustermanagement.controllers.edit-cluster', [])
    .controller('EditClusterCtrl', EditClusterCtrl);

EditClusterCtrl.$inject = ['$scope', '$uibModalInstance', '$timeout', 'ClusterRestService', 'toastr', '$translate', 'data'];

function EditClusterCtrl($scope, $uibModalInstance, $timeout, ClusterRestService, toastr, $translate, data) {
    $scope.pageTitle = $translate.instant('cluster_management.cluster_page.edit_page_title');
    $scope.errors = [];
    $scope.clusterConfiguration = _.cloneDeep(data.clusterConfiguration);
    $scope.loader = false;

    $scope.updateCluster = function () {
        $scope.setLoader(true, $translate.instant('cluster_management.cluster_page.updating_cluster_loader'));
        return ClusterRestService.updateCluster($scope.clusterConfiguration)
            .then(() => {
                toastr.success($translate.instant('cluster_management.cluster_page.notifications.update_success'));
                $uibModalInstance.close();
            })
            .catch(function (response) {
                handleErrors(response.data, response.status);
            })
            .finally(() => $scope.setLoader(false));
    };

    function handleErrors(data, status) {
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
    }

    $scope.isClusterConfigurationValid = () => {
        return !$scope.clusterConfigurationForm.$invalid;
    };

    $scope.setLoader = function (loader, message) {
        $timeout.cancel($scope.loaderTimeout);
        if (loader) {
            $scope.loaderTimeout = $timeout(function () {
                $scope.loader = loader;
                $scope.loaderMessage = message;
            }, 300);
        } else {
            $scope.loader = false;
        }
    };

    $scope.ok = function () {
        if (!$scope.isClusterConfigurationValid()) {
            toastr.warning($translate.instant('cluster_management.cluster_page.notifications.form_invalid'));
            return;
        }
        $scope.updateCluster();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}
