import {GraphqlEventName} from "../services/graphql-context.service";
import '../controllers/endpoint-generation-failure-result-modal.controller';
import {endpointUrl} from "../models/endpoints";

angular
    .module('graphdb.framework.graphql.directives.generate-endpoint', [
        'graphdb.framework.graphql.controllers.endpoint-generation-failure-result-modal'
    ])
    .directive('generateEndpoint', GenerateEndpointComponent);

GenerateEndpointComponent.$inject = ['ModalService', '$uibModal', '$translate', '$repositories', 'GraphqlService', 'GraphqlContextService'];

function GenerateEndpointComponent(ModalService, $uibModal, $translate, $repositories, GraphqlService, GraphqlContextService) {
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

            /**
             * Exposes the graphql module view URL constants for use in the template.
             * @type {{string?: string}}
             */
            $scope.endpointUrl = endpointUrl;

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
                $scope.generationReport = undefined;
                GraphqlContextService.generateEndpoint();
            };

            /**
             * Handles the completion of the endpoint generation workflow.
             */
            $scope.finishGenerationWorkflow = () => {
                GraphqlContextService.finishGenerationWorkflow();
            };

            /**
             * Triggers an event to open the endpoint generation report modal.
             * @param {EndpointGenerationReport} endpointReport The endpoint generation report.
             */
            $scope.showEndpointReport = (endpointReport) => {
                GraphqlContextService.openEndpointGenerationReport(endpointReport);
            }

            /**
             * Opens the endpoint in the playground in a new browser tab.
             * @param {EndpointGenerationReport} endpointReport The endpoint generation report.
             */
            $scope.exploreInPlayground = (endpointReport) => {
                GraphqlContextService.exploreEndpointInPlayground(endpointReport);
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
