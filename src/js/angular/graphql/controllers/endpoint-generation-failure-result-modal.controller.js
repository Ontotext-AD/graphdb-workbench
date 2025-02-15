import '../../core/services/graphql.service';
import 'angular/core/directives/dynamic-form/dynamic-form.directive';
import 'angular/core/directives/multiselect-dropdown/multiselect-dropdown.directive';

const modules = [
    'graphdb.framework.core.services.graphql-service',
];

angular
    .module('graphdb.framework.graphql.controllers.endpoint-generation-failure-result-modal', modules)
    .controller('EndpointGenerationResultFailureModalController', EndpointGenerationResultFailureModalController);

EndpointGenerationResultFailureModalController.$inject = ['$scope', '$uibModalInstance', 'data'];

function EndpointGenerationResultFailureModalController($scope, $uibModalInstance, data) {
    // =========================
    // Private variables
    // =========================

    // =========================
    // Public variables
    // =========================

    /**
     * The generation report model.
     * @type {EndpointGenerationReport|undefined}
     */
    $scope.endpointReport = undefined;

    // =========================
    // Public functions
    // =========================

    /**
     * Handles the download report button click.
     */
    $scope.downloadReport = () => {
        const reportData = JSON.stringify($scope.endpointReport.toJSON(), null, 2);
        const blob = new Blob([reportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${$scope.endpointReport.endpointId}-generation-report.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /**
     * Cancels the operation and dismisses the modal.
     */
    $scope.close = () => {
        $uibModalInstance.dismiss('cancel')
    };

    // =========================
    // Private functions
    // =========================

    const init = () => {
        $scope.endpointReport = data.endpointReport;
    };

    // =========================
    // Initialization
    // =========================
    init();
}
