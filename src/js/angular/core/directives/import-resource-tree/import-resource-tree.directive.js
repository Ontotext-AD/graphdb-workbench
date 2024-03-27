import 'angular/core/directives/import-resource-tree/recursive.directive';

const modules = ['graphdb.framework.core.directives.recursive'];

angular
    .module('graphdb.framework.core.directives.import-resource-tree', modules)
    .directive('importResourceTree', importResourceTreeDirective);


importResourceTreeDirective.$inject = [];

function importResourceTreeDirective() {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/core/directives/import-resource-tree/templates/import-resource-tree.html',
        scope: {

            /**
             * @type {ImportServerResource}
             */
            importResources: '='
        },
        link: ($scope, element, attrs) => {
            const init = () => {
                console.log($scope.importResources);
                $scope.resources = $scope.importResources.toList();
            };

            // =========================
            // Private functions
            // =========================
            const toList = (importResources) => {

            }


            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            subscriptions.push($scope.$watch('importResources', init));

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);
        }
    }
}
