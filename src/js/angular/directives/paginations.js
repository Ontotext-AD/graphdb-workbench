const exportDirectives = angular.module('graphdb.framework.directives.paginations', []);

exportDirectives.directive('paginations', function () {
    return {
        template: '<pagination class="nav navbar-right" total-items="matchedElements.length" items-per-page="pageSize" ng-model="page" ng-change="changePagination()" direction-links="false" boundary-links="true" max-size="5" rotate="true"></pagination>',
    };
});
