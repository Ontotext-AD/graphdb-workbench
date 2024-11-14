import {ImportResourceStatus} from "../../models/import/import-resource-status";
import 'angular/import/directives/import-resource-message.directive';
import 'angular/import/directives/import-resource-status-info.directive';
import {SortingType} from "../../models/import/sorting-type";
import {ImportResourceTreeElement} from "../../models/import/import-resource-tree-element";
import {TABS} from "../services/import-context.service";
import {ImportResourceTreeService} from "../services/import-resource-tree.service";
import {CheckboxControlModel} from "../../models/import/checkbox-control-resource-wrapper";

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
    'graphdb.framework.import.directives.import-resource-message',
    'graphdb.framework.import.directives.import-resource-status-info'
];

angular
    .module('graphdb.framework.import.directives.import-resource-tree', modules)
    .directive('importResourceTree', importResourceTreeDirective);

importResourceTreeDirective.$inject = ['$timeout', 'ImportContextService'];

function importResourceTreeDirective($timeout, ImportContextService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/import/templates/import-resource-tree.html',
        scope: {
            /**
             * Contains mapping of the column names to label keys. Should contain
             * keys for: name, size, imported, modified, context column names.
             */
            columnKeys: '=',
            /**
             * If the type filter buttons should be visible.
             */
            showTypeFilter: '=',
            /**
             * The default field to sort the resources by.
             */
            sortBy: '=',
            asc: '=',
            onImport: '&',
            onImportAll: '&',
            onReset: '&',
            onRemove: '&',
            onStopImport: '&',
            onEditResource: '&'
        },
        link: ($scope, element, attrs) => {

            // =========================
            // Public variables
            // =========================
            $scope.resources = new ImportResourceTreeElement();
            $scope.displayResources = [];
            $scope.checkboxControlModel = undefined;
            $scope.TYPE_FILTER_OPTIONS = TYPE_FILTER_OPTIONS;
            $scope.filterByType = TYPE_FILTER_OPTIONS.ALL;
            $scope.filterByFileName = '';
            $scope.STATUS_OPTIONS = STATUS_OPTIONS;
            $scope.selectedByStatus = STATUS_OPTIONS.NONE;
            $scope.ImportResourceStatus = ImportResourceStatus;
            $scope.canRemoveResource = angular.isDefined(attrs.onRemove);
            $scope.canResetSelectedResources = false;
            $scope.SORTING_TYPES = SortingType;
            $scope.sortAsc = angular.isDefined(attrs.asc) ? $scope.asc : true;
            $scope.sortedBy = $scope.sortBy;
            $scope.showLoader = ImportContextService.getShowLoader();
            $scope.hasSelection = false;

            // =========================
            // Public functions
            // =========================

            /**
             * Updates the selection model when a resource is selected or unselected.
             * @param {ImportResourceTreeElement} resource The resource that was selected or unselected.
             */
            $scope.selectionChanged = ((resource) => {
                resource.setSelection(resource.selected);
                updateSelectByStateDropdownModel();
                setCanResetResourcesFlag();
                updateHasSelection();
            });

            $scope.selectResourceWithStatus = (resourceStatus) => {
                $scope.selectedByStatus = resourceStatus;
                $scope.resources.setSelection(false);

                if (STATUS_OPTIONS.ALL === $scope.selectedByStatus) {
                    $scope.resources.setSelection(true);
                } else if (STATUS_OPTIONS.IMPORTED === $scope.selectedByStatus) {
                    $scope.resources.selectAllWithStatus([ImportResourceStatus.DONE]);
                } else if (STATUS_OPTIONS.NOT_IMPORTED === $scope.selectedByStatus) {
                    $scope.resources.selectAllWithStatus([
                        ImportResourceStatus.IMPORTING,
                        ImportResourceStatus.NONE,
                        ImportResourceStatus.ERROR,
                        ImportResourceStatus.PENDING,
                        ImportResourceStatus.INTERRUPTING
                    ]);
                }

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
                const resourcesNames = $scope.resources.getAllSelected()
                    .map((resource) => resource.path);
                if (resourcesNames.length > 0) {
                    $scope.onReset({resources: resourcesNames});
                }
            };

            /**
             * Resets the status of the given resource.
             * @param {ImportResourceTreeElement} importResource
             */
            $scope.resetStatus = (importResource) => {
                $scope.onReset({resources: [importResource.path]});
            };

            $scope.onRemoveResources = () => {
                const selectedResources = $scope.resources.getAllSelected();
                if (selectedResources && selectedResources.length > 0) {
                    $scope.onRemove({resources: selectedResources});
                }
            };

            $scope.removeResource = (resource) => {
                $scope.onRemove({resources: [resource]});
            };

            $scope.importAll = (withoutChangingSettings) => {
                const selectedResources = $scope.resources.getAllSelectedForImport();
                if (selectedResources.length > 0) {
                    $scope.onImportAll({selectedResources: selectedResources, withoutChangingSettings});
                }
            };

            $scope.stopImport = (importResource) => {
                $scope.onStopImport({resource: importResource});
            };

            /**
             * Sorts resources by provided sorting type.
             * @param {SortingType} sortedBy The sorting type to use.
             */
            $scope.sort = (sortedBy) => {
                if ($scope.sortedBy === sortedBy) {
                    $scope.sortAsc = !$scope.sortAsc;
                } else {
                    $scope.sortAsc = true;
                }
                $scope.sortedBy = sortedBy;
                updateListedImportResources();
            };

            $scope.editResource = (resource) => {
                $scope.onEditResource({resource});
            };

            $scope.toggleSelectAll = () => {
                $scope.resources.setSelection(!($scope.checkboxControlModel.areAllDisplayedImportResourcesPartialSelected ||
                    $scope.checkboxControlModel.areAllDisplayedImportResourcesSelected));

                updateListedImportResources();
                setCanResetResourcesFlag();
            };

            // =========================
            // Private functions
            // =========================

            /**
             * Sets the flag showing if any of the selected resources is already imported
             * and can have their states reset.
             */
            const setCanResetResourcesFlag = () => {
                $scope.canResetSelectedResources = $scope.resources.getSelectedImportedResources();
            };

            const updateListedImportResources = () => {
                $scope.resources.getRoot().updateSelectionState();
                $scope.checkboxControlModel.sortResources($scope.sortedBy, $scope.sortAsc);
                $scope.displayResources = $scope.checkboxControlModel.getFilteredResources();
                updateHasSelection();
                updateSelectByStateDropdownModel();
            };

            const updateHasSelection = () => {
                const allSelectedFilesNames = $scope.resources.getAllSelectedFilesNames();
                $scope.hasSelection = allSelectedFilesNames.length > 0;
                ImportContextService.updateSelectedFilesNames(allSelectedFilesNames);
            };

            const updateSelectByStateDropdownModel = () => {
                const mainCheckbox = element[0].querySelector('#importSelectCheckboxInput');

                if (mainCheckbox) {
                    mainCheckbox.checked = !!($scope.checkboxControlModel.areAllDisplayedImportResourcesSelected || $scope.checkboxControlModel.areAllDisplayedImportResourcesPartialSelected);
                }
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
            // Subscription handlers
            // =========================

            const onResourcesUpdatedHandler = (newResources = []) => {
                const isUserImport = TABS.USER === ImportContextService.getActiveTabId();
                if ($scope.resources.isEmpty()) {
                    $scope.resources = ImportResourceTreeService.toImportResourceTree(newResources, isUserImport);
                    if (isUserImport) {
                        $scope.sortedBy = SortingType.MODIFIED;
                    }
                } else {
                    ImportResourceTreeService.mergeResourceTree($scope.resources, newResources, isUserImport);
                }
                $scope.checkboxControlModel = new CheckboxControlModel($scope.resources, $scope.filterByType, $scope.filterByFileName);
                ImportResourceTreeService.calculateElementIndent($scope.resources);
                ImportResourceTreeService.setupAfterTreeInitProperties($scope.resources);
                updateListedImportResources();
                setCanResetResourcesFlag();
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            subscriptions.push(ImportContextService.onResourcesUpdated(onResourcesUpdatedHandler));
            subscriptions.push(ImportContextService.onShowLoaderUpdated((showLoader) => $scope.showLoader = showLoader));
            subscriptions.push(ImportContextService.onActiveTabIdUpdated(() => $scope.resources = new ImportResourceTreeElement()));

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);
        }
    };
}
