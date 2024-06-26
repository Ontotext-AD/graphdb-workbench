angular
    .module('graphdb.framework.graphexplore.directives.sysrepo', ['graphdb.framework.graphexplore.controllers.class'])
    .directive('systemRepoWarning', systemRepoWarningDirective);

systemRepoWarningDirective.$inject = ['$repositories', '$rootScope'];

function systemRepoWarningDirective($repositories, $rootScope) {
    return {
        restrict: 'A',
        scope: {},
        templateUrl: 'js/angular/graphexplore/templates/systemRepoWarningTemplate.html',
        link: function (scope) {
            scope.isSystemRepository = function () {
                return $repositories.getActiveRepository() === 'SYSTEM';
            };

            scope.hasPermission = function () {
                return $rootScope.hasPermission();
            };
        }
    };
}
