import {ImportResourceStatus} from "../../models/import/import-resource-status";
import 'angular/import/directives/import-resource-message.directive';
import 'angular/import/directives/import-resource-status-info.directive';

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

const modules = [
    'graphdb.framework.import.import-resource-message',
    'graphdb.framework.import.import-resource-status-info'
];

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
            onReset: '&',
            onRemove: '&',
            onStopImport: '&'
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
            $scope.canRemoveResource = angular.isDefined(attrs.onRemove);
            $scope.canResetSelectedResources = false;

            // =========================
            // Public functions
            // =========================

            /**
             * Updates the selection model when a resource is selected or unselected.
             * @param {ImportResourceTreeElement} resource The resource that was selected or unselected.
             */
            $scope.selectionChanged = ((resource) => {
                resource.setSelection(resource.selected);
                $scope.selectedResources = $scope.resources.getAllSelected();
                setCanResetResourcesFlag();
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
                setCanResetResourcesFlag();
            };

            $scope.filterByTypeChanged = (newType) => {
                $scope.filterByType = newType;
                updateListedImportResources();
            };

            $scope.filterByFileNameChanged = (filterByFileName) => {
                $scope.filterByFileName = filterByFileName;
                debounce(updateListedImportResources, 100);
            };

            /**
             * Resets the status of the selected resources.
             */
            $scope.onResetStatus = () => {
                if (!$scope.selectedResources) {
                    return;
                }
                const resourcesNames = $scope.selectedResources
                    .filter((resource) => !resource.isDirectory())
                    .map((resource) => resource.importResource.name);
                if (resourcesNames.length > 0) {
                    $scope.onReset({resources: resourcesNames});
                }
            };

            /**
             * Resets the status of the given resource.
             * @param {ImportResourceTreeElement} importResource
             */
            $scope.resetStatus = (importResource) => {
                $scope.onReset({resources: [importResource.name]});
            };

            $scope.onRemoveResources = () => {
                if ($scope.selectedResources && $scope.selectedResources.length > 0) {
                    $scope.onRemove({resources: $scope.selectedResources});
                }
            };

            $scope.removeResource = (resource) => {
                $scope.onRemove({resources: [resource]});
            };

            $scope.importAll = (withoutChangingSettings) => {
                if ($scope.selectedResources && $scope.selectedResources.length > 0) {
                    $scope.onImportAll({selectedResources: $scope.selectedResources, withoutChangingSettings});
                }
            };

            $scope.stopImport = (importResource) => {
                $scope.onStopImport({resource: importResource});
            };

            // =========================
            // Private functions
            // =========================

            const init = () => {
                updateListedImportResources();
            };

            /**
             * Sets the flag showing if any of the selected resources is already imported
             * and can have their states reset.
             */
            const setCanResetResourcesFlag = () => {
                $scope.canResetSelectedResources = $scope.selectedResources
                    .some((treeResource) => treeResource.importResource.status === ImportResourceStatus.DONE);
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
