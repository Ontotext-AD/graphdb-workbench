angular
    .module('graphdb.framework.graphql.directives.generate-endpoint', [])
    .directive('generateEndpoint', GenerateEndpointComponent);

GenerateEndpointComponent.$inject = ['ModalService', '$translate', 'GraphqlService', 'GraphqlContextService'];

function GenerateEndpointComponent(ModalService, $translate, GraphqlService, GraphqlContextService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/graphql/templates/step-generate-endpoint.html',
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
                $scope.endpointConfiguration = GraphqlContextService.getNewEndpoint();
                console.log('%cgenerate endpoint', 'background: orange', $scope.endpointConfiguration);
            }
            onInit();
        }
    };
}
