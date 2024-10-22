import 'angular/clustermanagement/directives/cluster-configuration/cluster-properties.directive';
import 'angular/clustermanagement/directives/cluster-configuration/cluster-nodes.directive';
import 'angular/clustermanagement/directives/cluster-configuration/multi-region.directive';

const modules = [
    'graphdb.framework.clustermanagement.directives.cluster-configuration.cluster-properties',
    'graphdb.framework.clustermanagement.directives.cluster-configuration.cluster-nodes',
    'graphdb.framework.clustermanagement.directives.cluster-configuration.multi-region'
];

angular
    .module('graphdb.framework.clustermanagement.directives.cluster-configuration', modules)
    .directive('clusterConfiguration', ClusterConfiguration);

ClusterConfiguration.$inject = ['$jwtAuth', '$uibModal', '$translate', 'toastr', 'ClusterViewContextService'];

const CONFIGURATION_TABS = {
    PROPERTIES: 'properties',
    NODES: 'nodes',
    MULTI_REGION: 'multi_region'
};

function ClusterConfiguration($jwtAuth, $uibModal, $translate, toastr, ClusterViewContextService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/clustermanagement/templates/cluster-configuration/cluster-configuration.html',
        scope: {
            currentNode: '=',
            clusterModel: '=',
            clusterConfiguration: '='
        },
        link: ($scope) => {
            $scope.isAdmin = false;
            $scope.CONFIGURATION_TABS = CONFIGURATION_TABS;
            $scope.activeTab = CONFIGURATION_TABS.PROPERTIES;

            $scope.closeClusterConfigurationPanel = () => {
                ClusterViewContextService.hideClusterConfigurationPanel();
            };

            $scope.switchTab = ($event, tab) => {
                $scope.activeTab = tab;
            };
        }
    };
}
