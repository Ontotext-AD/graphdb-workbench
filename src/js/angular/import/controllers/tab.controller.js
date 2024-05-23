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
    let checkEmptyState = {};

    // =========================
    // Public variables
    // =========================
    $scope.isHelpVisible = false;
    $scope.fileSizeLimitInfoTemplateUrl = 'js/angular/import/templates/fileSizeLimitInfo.html';

    // =========================
    // Public functions
    // =========================

    const updateHelpVisibility = () => {
        let empty = checkEmptyState[$scope.activeTabId] && areResourcesEmpty();
        let helpVisible = ImportViewStorageService.getIsHelpVisible($scope.activeTabId);
        $scope.isHelpVisible =  empty || helpVisible;
    }

    const areResourcesEmpty = () => {
        let importResourceTreeElement = ImportContextService.getResources();
        return !importResourceTreeElement || importResourceTreeElement.isEmpty();
    }

    $scope.openTab = (tab) => {
        ImportContextService.updateActiveTabId(tab);
    };

    $scope.toggleHelp = () => {
        checkEmptyState[$scope.activeTabId] = false;
        ImportViewStorageService.setIsHelpVisible($scope.activeTabId, !$scope.isHelpVisible)
        updateHelpVisibility();
    };

    // =========================
    // Private functions
    // =========================
    const init = () => {
        Object.values(TABS).forEach((tabId) => checkEmptyState[tabId] = true);
        // // When controller is initialized we reset the state of persistence. Initially the help have to be opened.
        // ImportViewStorageService.setHelpVisibility($scope.activeTabId.false);
        // Updates the active tab id from tha url.
        const activeTabId = $location.hash() || TABS.USER;
        $scope.openTab(activeTabId);
        updateHelpVisibility();
    }

    // =========================
    // Watchers and event handlers
    // =========================

    const subscriptions = [];
    subscriptions.push(ImportContextService.onActiveTabIdUpdated((newActiveTabId) => {
        $scope.activeTabId = newActiveTabId;
        $location.hash($scope.activeTabId);
        updateHelpVisibility();
    }));

    subscriptions.push(ImportContextService.onResourcesUpdated(updateHelpVisibility));

    const removeAllListeners = () => subscriptions.forEach((subscription) => subscription());

    $scope.$on('$destroy', removeAllListeners);

    init();
}
