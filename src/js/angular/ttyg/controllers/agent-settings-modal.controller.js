angular
    .module('graphdb.framework.ttyg.controllers.agent-settings-modal', [])
    .controller('AgentSettingsModalController', AgentSettingsModalController);

AgentSettingsModalController.$inject = ['$scope', '$uibModalInstance', 'toastr', 'UriUtils', '$translate', 'dialogModel'];

function AgentSettingsModalController($scope, $uibModalInstance, toastr, UriUtils, $translate, dialogModel) {

    // =========================
    // Public variables
    // =========================

    // =========================
    // Public functions
    // =========================

    $scope.ok = function () {

    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss({});
    };

    $scope.close = function () {
        $uibModalInstance.dismiss({});
    };

    // =========================
    // Private functions
    // =========================


    // =========================
    // Initialization
    // =========================

    const init = function () {

    };
    init();
}
