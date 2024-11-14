import 'angular/core/services/similarity.service';
import 'angular/core/services/connectors.service';
import 'angular/core/services/ttyg.service';
import 'angular/rest/repositories.rest.service';

angular
    .module('graphdb.framework.ttyg.controllers.agent-instructions-explain-modal', [])
    .controller('AgentInstructionsExplainModalController', AgentInstructionsExplainModalController);

AgentInstructionsExplainModalController.$inject = [
    '$scope',
    '$uibModalInstance',
    'ModalService',
    '$translate',
    'dialogModel'
];

function AgentInstructionsExplainModalController($scope, $uibModalInstance, ModalService, $translate, dialogModel) {
    // =========================
    // Public variables
    // =========================

    $scope.agentInstructionsExplain = dialogModel.agentInstructionsExplain;

    // =========================
    // Public functions
    // =========================

    /**
     * Closes the modal when the user clicks the close button.
     */
    $scope.close = () => {
        $uibModalInstance.dismiss({});
    };

    $scope.onCloseAgentInstructionsExplainModal = () => {
        $uibModalInstance.dismiss({});
    };

    // =========================
    // Private functions
    // =========================

    // =========================
    // Subscriptions
    // =========================

    const subscriptions = [];

    const onDestroy = () => {
        subscriptions.forEach((subscription) => subscription());
    };
    $scope.$on('$destroy', onDestroy);

    // =========================
    // Initialization
    // =========================
}
