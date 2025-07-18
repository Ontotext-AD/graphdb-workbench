angular
    .module('graphdb.framework.ttyg.controllers.external-integration-configuration-modal', [])
    .controller('ExternalIntegrationConfigurationModalController', ExternalIntegrationConfigurationModalController);

ExternalIntegrationConfigurationModalController.$inject = [
    '$scope',
    '$uibModalInstance',
    'ModalService',
    '$translate',
    'dialogModel'
];

function ExternalIntegrationConfigurationModalController($scope, $uibModalInstance, ModalService, $translate, dialogModel) {
    // =========================
    // Public variables
    // =========================

    $scope.externalIntegrationConfiguration = dialogModel.externalIntegrationConfiguration;
    $scope.difyExtension = dialogModel.difyExtensionUrl;
    $scope.queryMethods = dialogModel.queryMethodsUrl;
    $scope.agentId = dialogModel.agentId;
    $scope.agentName = dialogModel.agentName;

    // =========================
    // Public functions
    // =========================

    /**
     * Closes the modal when the user clicks the close button.
     */
    $scope.close = () => {
        $uibModalInstance.dismiss({});
    };

    $scope.onCloseExternalIntegrationConfigurationModal = () => {
        $uibModalInstance.dismiss({});
    };
}
