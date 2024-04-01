const modules = [];

angular
    .module('graphdb.framework.import.import-resource-tree', modules)
    .directive('importResourceTree', importResourceTreeDirective);

function importResourceTreeDirective() {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/import/templates/import-resource-tree.html',
        scope: {

            /**
             * @type {ImportResourceTreeElement}
             */
            resources: '=',
            onImport: '&',
            onDelete: '&'
        },
        link: ($scope, element, attrs) => {
            // =========================
            // Public variables
            // =========================
            $scope.displayResources = [];

            // =========================
            // Private variables
            // =========================
            let selectedResources = [];

            // =========================
            // Private functions
            // =========================
            const init = () => {
                selectedResources.forEach((resource) => {
                    const resourceByFullPath = $scope.resources.getResourceByName(resource.importResource.name);
                    if (resourceByFullPath) {
                        resourceByFullPath.selected = true;
                    }
                });

                $scope.displayResources = $scope.resources.toList();
            };

            $scope.selectionChanged = (($event, resource) => {
                resource.setSelection(resource.selected);
                selectedResources = $scope.resources.getAllSelected();
            });

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            subscriptions.push($scope.$watch('resources', init));

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);
        }
    };
}
