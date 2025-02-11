import '../../core/services/graphql.service';
import 'angular/core/directives/dynamic-form/dynamic-form.directive';
import 'angular/core/directives/multiselect-dropdown/multiselect-dropdown.directive';

const modules = [
    'graphdb.framework.core.services.graphql-service',
    'graphdb.framework.core.directives.dynamic-form',
    'graphdb.framework.core.directives.multiselect-dropdown'
];

angular
    .module('graphdb.framework.graphql.controllers.graphql-endpoint-configuration-modal', modules)
    .controller('GraphqlEndpointConfigurationModalController', GraphqlEndpointConfigurationModalController);

GraphqlEndpointConfigurationModalController.$inject = ['$scope', '$uibModalInstance', 'data', '$translate', 'toastr', 'GraphqlService'];

function GraphqlEndpointConfigurationModalController($scope, $uibModalInstance, data, $translate, toastr, GraphqlService) {
    // =========================
    // Private variables
    // =========================

    // =========================
    // Public variables
    // =========================

    /**
     * The active repository id.
     * @type {string}
     */
    $scope.repositoryId = data.repositoryId;

    /**
     * The selected endpoint configuration for which the settings should be updated.
     * @type {GraphqlEndpointInfo|undefined|*}
     */
    $scope.endpointConfiguration = data.endpointConfiguration;

    /**
     * The endpoint configuration settings model.
     * @type {GraphqlEndpointConfigurationSettings|undefined}
     */
    $scope.endpointConfigurationSettings = undefined;

    /**
     * Flag indicating if the endpoint configuration settings are valid.
     * @type {boolean}
     */
    $scope.endpointConfigurationSettingsValid = false;

    /**
     * Flag indicating if the endpoint configuration settings are being loaded.
     * @type {boolean}
     */
    $scope.loadingEndpointConfigurationSettings = false;

    /**
     * Flag indicating if the endpoint configuration settings are being saved.
     * @type {boolean}
     */
    $scope.savingEndpointSettings = false;

    /**
     * Handles the save button click event in the dialog.
     */
    $scope.ok = () => {
        save();
    };

    /**
     * Cancels the operation and dismisses the modal.
     */
    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel')
    };

    /**
     * Handles the validity change of the endpoint configuration settings form
     * @param {boolean} isValid - The validity of the form.
     */
    $scope.handleValidityChange = (isValid) => {
        $scope.endpointConfigurationSettingsValid = isValid;
    };

    // =========================
    // Private functions
    // =========================

    /**
     * Loads the endpoint configuration settings from the server.
     */
    const loadEndpointConfigurationSettings = () => {
        $scope.loadingEndpointConfigurationSettings = true;
        GraphqlService.getGraphqlEndpointConfigurationSettings($scope.repositoryId, $scope.endpointConfiguration.endpointId)
            .then((endpointConfigurationSettings) => {
                $scope.endpointConfigurationSettings = endpointConfigurationSettings;
            })
            .catch((error) => {
                toastr.error(getError(error));
            })
            .finally(() => {
                $scope.loadingEndpointConfigurationSettings = false;
            });
    }

    /**
     * Saves the endpoint configuration settings to the server.
     */
    const save = () => {
        $scope.savingEndpointSettings = true;
        const updateEndpointRequest = $scope.endpointConfiguration.toUpdateEndpointRequest($scope.endpointConfigurationSettings);
        GraphqlService.editEndpointConfiguration($scope.repositoryId, $scope.endpointConfiguration.endpointId, updateEndpointRequest.getUpdateEndpointSettingsRequest())
            .then(() => {
                $uibModalInstance.close();
                toastr.success($translate.instant('graphql.endpoints_management.endpoint_configuration_modal.messages.success_saving_configuration'));
            })
            .catch((error) => {
                toastr.error(getError(error), $translate.instant('graphql.endpoints_management.endpoint_configuration_modal.messages.error_saving_configuration'));
            })
            .finally(() => {
                $scope.savingEndpointSettings = false;
            });
    }

    const init = () => {
        loadEndpointConfigurationSettings();
    }

    // =========================
    // Initialization
    // =========================

    init();
}
