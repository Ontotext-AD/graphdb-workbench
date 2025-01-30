angular
    .module('graphdb.framework.graphql.directives.configure-endpoint', [])
    .directive('configureEndpoint', ConfigureEndpointComponent);

ConfigureEndpointComponent.$inject = ['ModalService', '$translate', 'GraphqlContextService'];

function ConfigureEndpointComponent(ModalService, $translate, GraphqlContextService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/graphql/templates/configure-endpoint.html',
        scope: {
            stepDefinition: '='
        },
        link: ($scope) => {

            // =========================
            // Public variables
            // =========================


            // =========================
            // Public functions
            // =========================

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
             * Handles the creation of the GraphQL endpoint.
             */
            $scope.generateEndpoint = () => {
                GraphqlContextService.generateEndpoint();
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

            const onInit = () => {
                // TODO: implement
            }
            onInit();
        }
    };
}
