const TYPE_FILTER_OPTIONS = {
    'FILE': 'FILE',
    'DIRECTORY': 'DIRECTORY',
    'ALL': 'ALL'
};

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
            $scope.filterByType = TYPE_FILTER_OPTIONS.ALL;
            $scope.TYPE_FILTER_OPTIONS = TYPE_FILTER_OPTIONS;

            // =========================
            // Private variables
            // =========================
            let selectedResources = [];

            // =========================
            // Public functions
            // =========================
            $scope.selectionChanged = (($event, resource) => {
                resource.setSelection(resource.selected);
                selectedResources = $scope.resources.getAllSelected();
            });

            $scope.changeTypeFilter = (newType) => {
                $scope.filterByType = newType;
                updateListedImportResources();
            };

            // =========================
            // Private functions
            // =========================
            const init = () => {
                updateListedImportResources();
            };

            const updateListedImportResources = () => {
                selectedResources.forEach((resource) => {
                    const resourceByFullPath = $scope.resources.getResourceByName(resource.importResource.name);
                    if (resourceByFullPath) {
                        resourceByFullPath.selected = true;
                    }
                });
                $scope.displayResources = $scope.resources.toList()
                    .filter(filterByType);
            };

            const filterByType = (resource) => {
                if (TYPE_FILTER_OPTIONS.ALL === $scope.filterByType) {
                    return true;
                }

                if ($scope.filterByType === TYPE_FILTER_OPTIONS.FILE) {
                    return resource.isFile();
                }

                if ($scope.filterByType === TYPE_FILTER_OPTIONS.DIRECTORY) {
                    return resource.isDirectory();
                }

                return false;
            };

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
