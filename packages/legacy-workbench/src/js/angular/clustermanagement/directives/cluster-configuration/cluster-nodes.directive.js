const modules = [];

angular
    .module('graphdb.framework.clustermanagement.directives.cluster-configuration.cluster-nodes', modules)
    .directive('clusterNodes', ClusterNodes);

ClusterNodes.$inject = [];

function ClusterNodes() {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/clustermanagement/templates/cluster-configuration/cluster-nodes.html',
        scope: {
            currentNode: '=',
            clusterModel: '='
        }
    };
}
