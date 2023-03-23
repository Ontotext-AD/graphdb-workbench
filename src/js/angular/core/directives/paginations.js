angular.module('graphdb.framework.core.directives.paginations', [])
    .directive('paginations', function () {
        return {
            template: '<uib-pagination class="nav navbar-right" total-items="matchedElements.length" items-per-page="pageSize" ng-model="page" ng-change="changePagination()" direction-links="false" boundary-links="true" max-size="5" rotate="true"></uib-pagination>',
        };
    });
