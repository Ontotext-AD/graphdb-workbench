
const modules = [];

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
             * @type {ImportResourceTreeElement}
             */
            importResources: '=',
            onImport: '&',
            onDelete: '&'
        },
        link: ($scope, element, attrs) => {
            // =========================
            // Public variables
            // =========================
            $scope.indent = 30;

            // =========================
            // Private variables
            // =========================
            let selectedResources = [];

            // =========================
            // Private functions
            // =========================
            const init = () => {
                selectedResources.forEach((resource) => {
                    const resourceByFullPath = $scope.importResources.getResourceName(resource.importResource.name);
                    if (resourceByFullPath) {
                        resourceByFullPath.selected = true;
                    }
                });

                $scope.resources = $scope.importResources.toList();
            };

            $scope.selectionChanged = (($event, resource) => {
                resource.setSelection(resource.selected);
                selectedResources = $scope.importResources.getAllSelected();
            });

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
    };
}
