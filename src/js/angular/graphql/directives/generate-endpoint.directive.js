import {GraphqlEventName} from "../services/graphql-context.service";

angular
    .module('graphdb.framework.graphql.directives.generate-endpoint', [])
    .directive('generateEndpoint', GenerateEndpointComponent);

GenerateEndpointComponent.$inject = ['ModalService', '$translate', '$repositories', 'GraphqlService', 'GraphqlContextService'];

function GenerateEndpointComponent(ModalService, $translate, $repositories, GraphqlService, GraphqlContextService) {
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
            $scope.endpointConfiguration = undefined;

            /**
             * The count of the endpoints that will be generated.
             * @type {number}
             */
            $scope.endpointsCountToGenerate = 0;

            /**
             * A model with the overview of the endpoints to be generated.
             * @type {GraphqlEndpointOverviewList|undefined}
             */
            $scope.endpointsOverview = undefined;

            /**
             * The active repository.
             */
            $scope.activeRepository = $repositories.getActiveRepository();

            /**
             * A flag indicating if the endpoint will be generated from the GraphQL schema shapes.
             * @type {boolean}
             */
            $scope.generateFromGraphqlSchemaShapes = false;

            /**
             * A flag indicating if the endpoint generation is in progress.
             * @type {boolean}
             */
            $scope.generatingEndpoint = false;

            /**
             * The endpoint generation report.
             * @type {EndpointGenerationReportList|undefined}
             */
            $scope.generationReport = undefined;

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
                $scope.generatingEndpoint = true;
                GraphqlContextService.generateEndpoint();
            };

            $scope.showEndpointReport = (endpointReport) => {
                // TODO: Implement the endpoint report modal.
            }

            // =========================
            // Private functions
            // =========================

            /**
             * Handles the completion of the endpoint generation.
             * @param {EndpointGenerationReportList} generationReport The endpoint generation report.
             */
            const onEndpointGenerated = (generationReport) => {
                $scope.generatingEndpoint = false;
                $scope.generationReport = generationReport;
            };

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const onDestroy = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            subscriptions.push(GraphqlContextService.subscribe(GraphqlEventName.ENDPOINT_GENERATED, onEndpointGenerated));

            $scope.$on('$destroy', onDestroy);

            const onInit = () => {
                $scope.endpointConfiguration = GraphqlContextService.getNewEndpoint();
                $scope.generateFromGraphqlSchemaShapes = $scope.endpointConfiguration.hasSelectedGraphqlSchemaShapes();
                $scope.endpointsCountToGenerate = GraphqlService.getEndpointsCountToGenerate($scope.endpointConfiguration);
                $scope.endpointsOverview = GraphqlService.getGenerateEndpointsOverview($scope.endpointConfiguration);
            }
            onInit();
        }
    };
}
