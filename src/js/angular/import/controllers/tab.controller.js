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
    $scope.isHelpVisible = false;
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
        setIsHelpVisible(!viewPersistence.isHelpVisible);
    };

    // =========================
    // Private functions
    // =========================

    const setIsHelpVisible = (isVisible) => {
        $scope.isHelpVisible = isVisible;
    };

    const setHelpVisibility = (resources) => {
        // reset help visibility on empty state in initial load
        if (shouldResetHelpVisibility && resources.getSize() === 0) {
            ImportViewStorageService.setHelpVisibility(true);
            shouldResetHelpVisibility = false;
        }
        const isVisible = resources.getSize() === 0;
        ImportViewStorageService.setHelpVisibility(isVisible);
        setIsHelpVisible(isVisible);
    };

    const onResourcesUpdated = (resources) => {
        setHelpVisibility(resources);
    };

    // =========================
    // Watchers and event handlers
    // =========================

    const subscriptions = [];
    subscriptions.push(ImportContextService.onActiveTabIdUpdated((newActiveTabId) => {
        $scope.activeTabId = newActiveTabId;
        $location.hash($scope.activeTabId);
        setHelpVisibility(ImportContextService.getResources());
    }));

    subscriptions.push(ImportContextService.onResourcesUpdated(onResourcesUpdated));

    const removeAllListeners = () => subscriptions.forEach((subscription) => subscription());

    $scope.$on('$destroy', removeAllListeners);

    // Updates the active tab id from tha url.
    const activeTabId = $location.hash() || TABS.USER;
    $scope.openTab(activeTabId);
}
