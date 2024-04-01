const TYPE_FILTER_OPTIONS = {
    'FILE': 'FILE',
    'DIRECTORY': 'DIRECTORY',
    'ALL': 'ALL'
};

const modules = [];

angular
    .module('graphdb.framework.import.import-resource-tree', modules)
    .directive('importResourceTree', importResourceTreeDirective);

importResourceTreeDirective.$inject = ['$timeout'];

function importResourceTreeDirective($timeout) {
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
            $scope.TYPE_FILTER_OPTIONS = TYPE_FILTER_OPTIONS;
            $scope.filterByType = TYPE_FILTER_OPTIONS.ALL;
            $scope.filterByFileName = '';

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

            $scope.handleInputChange = function (filterByFileName) {
                $scope.filterByFileName = filterByFileName;
                debounce(updateListedImportResources, 100);
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
                    .filter(filterByType)
                    .filter(filterByName);
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

            const filterByName = (resource) => {
                if (!$scope.filterByFileName) {
                    return true;
                }

                if ($scope.filterByType === TYPE_FILTER_OPTIONS.DIRECTORY) {
                    return resource.hasTextInDirectoriesName($scope.filterByFileName);
                }

                if ($scope.filterByType === TYPE_FILTER_OPTIONS.FILE) {
                    return resource.hasTextInFilesName($scope.filterByFileName);
                }
                return resource.hasTextInResourcesName($scope.filterByFileName);
            };

            let debounceTimeout;
            const debounce = (func, delay) => {
                // Clear previous timeout
                if (debounceTimeout) {
                    $timeout.cancel(debounceTimeout);
                }

                // Set new timeout
                debounceTimeout = $timeout(func, delay);
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
