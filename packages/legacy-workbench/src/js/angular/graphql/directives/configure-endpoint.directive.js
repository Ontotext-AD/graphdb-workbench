import {LoggerProvider} from "../../core/services/logger-provider";

const logger = LoggerProvider.logger;

angular
    .module('graphdb.framework.graphql.directives.configure-endpoint', [])
    .directive('configureEndpoint', ConfigureEndpointComponent);

ConfigureEndpointComponent.$inject = ['$q', 'ModalService', '$translate', 'GraphqlService', 'GraphqlContextService', 'toastr'];

function ConfigureEndpointComponent($q, ModalService, $translate, GraphqlService, GraphqlContextService, toastr) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/graphql/templates/step-configure-endpoint.html',
        scope: {
            stepDefinition: '=',
            selectedSourceRepository: '=',
        },
        link: ($scope) => {
            // =========================
            // Public variables
            // =========================

            /**
             * The endpoint configuration model.
             * @type {GraphqlEndpointConfiguration|undefined}
             */
            $scope.endpointConfiguration = undefined;

            /**
             * The dynamic form model containing the generation settings.
             * @type {GraphqlEndpointConfigurationSettings|undefined}
             */
            $scope.generationSettings = undefined;

            /**
             * Flag indicating if the generation settings in the form are valid.
             * @type {boolean}
             */
            $scope.generationSettingsValid = false;

            /**
             * Flag controlling the visibility of the advanced settings section. Advanced settings are hidden by default
             * in the settings model.
             * @type {boolean}
             */
            $scope.showAdvancedSettings = false;

            // =========================
            // Public functions
            // =========================

            /**
             * Handles the validity change of the generation settings form.
             * @param {boolean} isValid The new validity state of the form.
             */
            $scope.handleValidityChange = (isValid) => {
                $scope.endpointConfigurationSettingsValid = isValid;
            };

            /**
             * Handles the transition to the next step in the create endpoint wizard.
             */
            $scope.next = () => {
                GraphqlContextService.nextEndpointCreationStep();
            };

            /**
             * Handles the transition to the previous step in the create endpoint wizard.
             */
            $scope.back = () => {
                GraphqlContextService.previousEndpointCreationStep();
            };

            /**
             * Handles the termination of the create endpoint wizard.
             */
            $scope.cancel = () => {
                const title = $translate.instant('graphql.create_endpoint.wizard_steps.actions.cancel.confirmation.title');
                const confirmDeleteMessage = $translate.instant('graphql.create_endpoint.wizard_steps.actions.cancel.confirmation.body');
                ModalService.openConfirmation(title, confirmDeleteMessage, () => {
                    GraphqlContextService.cancelEndpointCreation();
                });
            };

            /**
             * Toggles the visibility of the advanced settings. Advanced settings are hidden by default.
             */
            $scope.toggleAdvancedSettings = () => {
                $scope.showAdvancedSettings = !$scope.showAdvancedSettings;
            };

            // =========================
            // Private functions
            // =========================

            const loadGenerationSettings = () => {
                return GraphqlService.getGraphqlGenerationSettings($scope.selectedSourceRepository.id)
                    .catch((error) => {
                        logger.error('Error loading generation settings', error);
                        toastr.error(getError(error));
                    });
            };

            const loadData = () => {
                $scope.loadingData = true;
                $q.all([loadGenerationSettings()])
                    .then(([generationSettings]) => {
                        $scope.endpointConfiguration.settings = generationSettings;
                    })
                    .finally(() => {
                        $scope.loadingData = false;
                    });
            };

            // =========================
            // Subscriptions
            // =========================

            const subscriptions = [];

            const onDestroy = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            $scope.$on('$destroy', onDestroy);

            const onInit = () => {
                $scope.endpointConfiguration = GraphqlContextService.getNewEndpoint();
                // Reload generation settings only if they are not already loaded. We need them to stay in the
                // endpoint configuration object during the whole endpoint creation process.
                if (!$scope.endpointConfiguration.settings) {
                    loadData($scope.endpointConfiguration);
                }
            };
            onInit();
        },
    };
}
