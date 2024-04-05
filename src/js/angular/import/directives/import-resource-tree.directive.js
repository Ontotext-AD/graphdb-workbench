import {ImportResourceStatus} from "../../models/import/import-resource-status";
import 'angular/import/directives/import-resource-message.directive';

const TYPE_FILTER_OPTIONS = {
    'FILE': 'FILE',
    'DIRECTORY': 'DIRECTORY',
    'ALL': 'ALL'
};

const STATUS_OPTIONS = {
    'ALL': 'ALL',
    'NONE': 'NONE',
    'IMPORTED': 'IMPORTED',
    'NOT_IMPORTED': 'NOT_IMPORTED'
};

const modules = ['graphdb.framework.import.import-resource-message'];

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
            /**
             * If the type filter buttons should be visible.
             */
            showTypeFilter: '=',
            onImport: '&',
            onImportAll: '&',
            onDelete: '&',
            onReset: '&',
            onRemove: '&'
        },
        link: ($scope, element, attrs) => {

            // =========================
            // Public variables
            // =========================
            $scope.displayResources = [];
            /**
             * @type {ImportResourceTreeElement[]}
             */
            $scope.selectedResources = [];
            $scope.TYPE_FILTER_OPTIONS = TYPE_FILTER_OPTIONS;
            $scope.filterByType = TYPE_FILTER_OPTIONS.ALL;
            $scope.filterByFileName = '';
            $scope.STATUS_OPTIONS = STATUS_OPTIONS;
            $scope.selectedByStatus = undefined;
            $scope.ImportResourceStatus = ImportResourceStatus;

            // =========================
            // Public functions
            // =========================
            $scope.selectionChanged = ((resource) => {
                resource.setSelection(resource.selected);
                $scope.selectedResources = $scope.resources.getAllSelected();
            });

            $scope.selectResourceWithStatus = (resourceStatus) => {
                $scope.selectedByStatus = resourceStatus;
                $scope.resources.setSelection(false);

                if (STATUS_OPTIONS.ALL === $scope.selectedByStatus) {
                    $scope.resources.setSelection(true);
                } else if (STATUS_OPTIONS.IMPORTED === $scope.selectedByStatus) {
                    $scope.resources.selectAllWithStatus([ImportResourceStatus.DONE]);
                } else if (STATUS_OPTIONS.NOT_IMPORTED === $scope.selectedByStatus) {
                    $scope.resources.selectAllWithStatus([ImportResourceStatus.IMPORTING, ImportResourceStatus.NONE, ImportResourceStatus.ERROR, ImportResourceStatus.PENDING, ImportResourceStatus.INTERRUPTING]);
                }

                $scope.selectedResources = $scope.resources.getAllSelected();
                updateListedImportResources();
            };

            $scope.filterByTypeChanged = (newType) => {
                $scope.filterByType = newType;
                updateListedImportResources();
            };

            $scope.filterByFileNameChanged = (filterByFileName) => {
                $scope.filterByFileName = filterByFileName;
                debounce(updateListedImportResources, 100);
            };

            $scope.onResetStatus = () => {
                if (!$scope.selectedResources) {
                    return;
                }
                const files = $scope.selectedResources.filter((resource) => !resource.isDirectory());
                if (files.length > 0) {
                    $scope.onReset({resources: files});
                }
            };

            $scope.resetStatus = (importResource) => {
                $scope.onReset({resources: [importResource]});
            };

            $scope.onRemoveResources = () => {
                if ($scope.selectedResources && $scope.selectedResources.length > 0) {
                    $scope.onRemove({selectedResources: $scope.selectedResources});
                }
            };

            $scope.importAll = (withoutChangingSettings) => {
                if ($scope.selectedResources && $scope.selectedResources.length > 0) {
                    $scope.onImportAll({selectedResources: $scope.selectedResources, withoutChangingSettings});
                }
            };

            // =========================
            // Private functions
            // =========================
            const init = () => {
                updateListedImportResources();
            };

            const updateListedImportResources = () => {
                $scope.selectedResources.forEach((resource) => {
                    const resourceByFullPath = $scope.resources.getResourceByName(resource.importResource.name);
                    if (resourceByFullPath) {
                        resourceByFullPath.selected = true;
                    }
                });
                $scope.resources.getRoot().updateSelectionState();
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
