import {endpointUrl} from "../models/endpoints";

angular
    .module('graphdb.framework.graphql.directives.select-schema-sources', [])
    .directive('selectSchemaSources', SelectSchemaSourcesComponent);

SelectSchemaSourcesComponent.$inject = ['ModalService', '$translate', 'GraphqlContextService'];

function SelectSchemaSourcesComponent(ModalService, $translate, GraphqlContextService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/graphql/templates/select-schema-sources.html',
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
             * Handles the transition to the next step in the create endpoint wizard.
             */
            $scope.next = () => {
                GraphqlContextService.nextEndpointCreationStep();
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
