const modules = [];

angular
    .module('graphdb.framework.clustermanagement.directives.cluster-configuration.multi-region', modules)
    .directive('multiRegion', MultiRegion);

MultiRegion.$inject = [];

function MultiRegion() {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/clustermanagement/templates/cluster-configuration/multi-region.html',
        scope: {
            clusterModel: '=',
            clusterConfiguration: '='
        },
        link: ($scope) => {
            // not implemented
        }
    };
}
