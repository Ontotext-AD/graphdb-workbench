import {TABS} from "../services/import-context.service";

angular
    .module('graphdb.framework.impex.import.controllers.tab', [])
    .controller('TabController', TabController);

TabController.$inject = ['$scope', '$location', 'ImportContextService'];

function TabController($scope, $location, ImportContextService) {

    // =========================
    // Private variables
    // =========================

    // object holds information about
    let helpVisibility;

    // =========================
    // Public variables
    // =========================
    $scope.isHelpVisible = false;
    $scope.fileSizeLimitInfoTemplateUrl = 'js/angular/import/templates/fileSizeLimitInfo.html';

    // =========================
    // Public functions
    // =========================

    const updateHelpVisibility = () => {
        if (helpVisibility.isPristine($scope.activeTabId)) {
            const resources = ImportContextService.getResources();
            $scope.isHelpVisible = !resources || resources.length === 0;
        } else {
            $scope.isHelpVisible = helpVisibility.isHelpVisible($scope.activeTabId);
        }
    };

    $scope.openTab = (tab) => {
        ImportContextService.updateActiveTabId(tab);
    };

    $scope.toggleHelp = () => {
        helpVisibility.setIsHelpVisible($scope.activeTabId, !$scope.isHelpVisible);
        updateHelpVisibility();
    };

    // =========================
    // Private functions
    // =========================
    const init = () => {
        helpVisibility = new HelpVisibilityPersistence();
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

class HelpVisibilityPersistence {
    constructor() {
        this._helpVisibility = {
            [TABS.USER]: {
                isHelpVisible: undefined
            },
            [TABS.SERVER]: {
                isHelpVisible: undefined
            }
        };
    }

    /**
     * Checks if user is toggled the help.
     * @param {string} tabId the value have to be one of {@link TABS}
     * @return {boolean} true if the user has clicked the help icon at least once.
     */
    isPristine(tabId) {
        return this._helpVisibility[tabId].isHelpVisible === undefined;
    }

    /**
     * Sets the help visibility.
     * @param {string} tabId the value have to be one of {@link TABS}
     * @param {boolean} isVisible - The visibility of the help.
     */
    setIsHelpVisible(tabId, isHelpVisible) {
        this._helpVisibility[tabId].isHelpVisible = isHelpVisible;
    }

    isHelpVisible(tabId) {
        return this._helpVisibility[tabId] && this._helpVisibility[tabId].isHelpVisible;
    }
}
