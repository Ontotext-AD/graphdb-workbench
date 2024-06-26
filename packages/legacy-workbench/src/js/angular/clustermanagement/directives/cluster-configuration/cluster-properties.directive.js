import {DELETE_CLUSTER, UPDATE_CLUSTER} from "../../events";

const modules = [];

angular
    .module('graphdb.framework.clustermanagement.directives.cluster-configuration.cluster-properties', modules)
    .directive('clusterProperties', ClusterProperties);

ClusterProperties.$inject = ['$jwtAuth', '$uibModal'];

function ClusterProperties($jwtAuth, $uibModal) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/clustermanagement/templates/cluster-configuration/cluster-properties.html',
        scope: {
            currentNode: '=',
            clusterModel: '=',
            clusterConfiguration: '='
        },
        link: ($scope) => {
            // =========================
            // Public variables
            // =========================
            $scope.isAdmin = false;

            // =========================
            // Public functions
            // =========================
            $scope.showEditConfigurationDialog = () => {
                const modalInstance = $uibModal.open({
                    templateUrl: 'js/angular/clustermanagement/templates/modal/cluster-edit-dialog.html',
                    controller: 'EditClusterCtrl',
                    size: 'lg',
                    resolve: {
                        data: () => {
                            return {
                                clusterConfiguration: $scope.clusterConfiguration
                            };
                        }
                    }
                });

                modalInstance.result.finally(function () {
                    $scope.$emit(UPDATE_CLUSTER, {force: true});
                });
            };

            $scope.showDeleteDialog = () => {
                const modalInstance = $uibModal.open({
                    templateUrl: 'js/angular/clustermanagement/templates/modal/cluster-delete-dialog.html',
                    controller: 'DeleteClusterCtrl'
                });

                modalInstance.result.then((forceDelete) => {
                    $scope.$emit(DELETE_CLUSTER, {force: forceDelete});
                });
            };

            // =========================
            // Initialization
            // =========================
            const init = () => {
                $scope.isAdmin = $jwtAuth.isAuthenticated() && $jwtAuth.isAdmin();
            };
            init();
        }
    };
}
