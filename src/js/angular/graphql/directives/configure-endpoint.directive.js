angular
    .module('graphdb.framework.graphql.directives.configure-endpoint', [])
    .directive('configureEndpoint', ConfigureEndpointComponent);

ConfigureEndpointComponent.$inject = ['ModalService', '$translate', 'GraphqlService', 'GraphqlContextService'];

function ConfigureEndpointComponent(ModalService, $translate, GraphqlService, GraphqlContextService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/graphql/templates/step-configure-endpoint.html',
        scope: {
            stepDefinition: '='
        },
        link: ($scope) => {

            // =========================
            // Public variables
            // =========================

            /**
             * The endpoint configuration model.
             * @type {GraphqlEndpointConfiguration|undefined}
             */
            $scope.endpointConfiguration = undefined

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

            // =========================
            // Private functions
            // =========================

            const loadGenerationSettings = () => {
                return GraphqlService.getGraphqlGenerationSettings()
                    .catch((error) => {
                        console.error('Error loading generation settings', error);
                        toastr.error(getError(error));
                    });
            }

            const loadData = () => {
                $scope.loadingData = true;
                Promise.all([loadGenerationSettings()])
                    .then(([generationSettings]) => {
                        $scope.endpointConfiguration.settings = generationSettings;
                    })
                    .finally(() => {
                        $scope.loadingData = false;
                    });
            }

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
            }
            onInit();
        }
    };
}
