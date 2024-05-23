import * as angular from 'angular';

import {TABS} from "../services/import-context.service";

angular
    .module('graphdb.framework.impex.import.controllers.tab', [])
    .controller('TabController', TabController);

TabController.$inject = ['$scope', '$location', 'ImportViewStorageService', 'ImportContextService'];

function TabController($scope, $location, ImportViewStorageService, ImportContextService) {

    // =========================
    // Private variables
    // =========================

    // flag to reset help visibility on empty state in initial load of the view
    let shouldResetHelpVisibility = true;

    // =========================
    // Public variables
    // =========================
    $scope.isHelpVisible = true;
    $scope.fileSizeLimitInfoTemplateUrl = 'js/angular/import/templates/fileSizeLimitInfo.html';

    // =========================
    // Public functions
    // =========================

    $scope.openTab = (tab) => {
        ImportContextService.updateActiveTabId(tab);
    };

    $scope.toggleHelp = () => {
        const viewPersistence = ImportViewStorageService.getImportViewSettings();
        ImportViewStorageService.toggleHelpVisibility();
        $scope.isHelpVisible = !viewPersistence.isHelpVisible;
    };

    // =========================
    // Private functions
    // =========================

    const onFilesUpdated = (files: any[]) => {
        // reset help visibility on empty state in initial load
        if (shouldResetHelpVisibility && files.length === 0) {
            ImportViewStorageService.setHelpVisibility(true);
            shouldResetHelpVisibility = false;
        }
        const viewPersistence = ImportViewStorageService.getImportViewSettings();
        let isVisible = viewPersistence.isHelpVisible;
        if (files.length === 0 && viewPersistence.isHelpVisible) {
            isVisible = true;
        } else if (files.length === 0 && !viewPersistence.isHelpVisible) {
            isVisible = false;
        } else if (viewPersistence.isHelpVisible) {
            isVisible = true;
        } else if (!viewPersistence.isHelpVisible) {
            isVisible = false;
        }
        ImportViewStorageService.setHelpVisibility(isVisible);
        $scope.isHelpVisible = isVisible;
    };

    // =========================
    // Watchers and event handlers
    // =========================

    const subscriptions = [];
    subscriptions.push(ImportContextService.onActiveTabIdUpdated((newActiveTabId) => {
        $scope.activeTabId = newActiveTabId;
        $location.hash($scope.activeTabId);
    }));

    subscriptions.push(ImportContextService.onFilesUpdated(onFilesUpdated));

    const removeAllListeners = () => subscriptions.forEach((subscription) => subscription());

    $scope.$on('$destroy', removeAllListeners);

    // Updates the active tab id from tha url.
    const activeTabId = $location.hash() || TABS.USER;
    $scope.openTab(activeTabId);
}
