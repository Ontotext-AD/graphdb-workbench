import {DELETE_CLUSTER, UPDATE_CLUSTER} from "../events";

const modules = [];

angular
    .module('graphdb.framework.clustermanagement.directives.cluster-configuration', modules)
    .directive('clusterConfiguration', ClusterConfiguration);

ClusterConfiguration.$inject = ['$jwtAuth', '$uibModal', '$translate', 'toastr', 'ClusterViewContextService', 'ClusterRestService'];

function ClusterConfiguration($jwtAuth, $uibModal, $translate, toastr, ClusterViewContextService, ClusterRestService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/clustermanagement/templates/cluster-configuration.html',
        scope: {
            currentNode: '=',
            clusterModel: '=',
            clusterConfiguration: '='
        },
        link: ($scope) => {

            $scope.isAdmin = false;

            $scope.closeClusterConfigurationPanel = () => {
                ClusterViewContextService.hideClusterConfigurationPanel();
            };

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

            const init = () => {
                $scope.isAdmin = $jwtAuth.isAuthenticated() && $jwtAuth.isAdmin();
            };
            init();
        }
    };
}
