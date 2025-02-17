import '../../core/services/graphql.service';
import '../services/graphql-context.service';
import './graphql-endpoint-configuration-modal.controller';
import {GraphqlEventName} from "../services/graphql-context.service";
import {endpointUrl} from "../models/endpoints";

const modules = [
    'graphdb.framework.core.services.graphql-service',
    'graphdb.framework.graphql.services.graphql-context',
    'graphdb.framework.graphql.controllers.graphql-endpoint-configuration-modal'
];

angular
    .module('graphdb.framework.graphql.controllers.graphql-endpoint-management-view', modules)
    .controller('GraphqlEndpointManagementViewCtrl', GraphqlEndpointManagementViewCtrl);

GraphqlEndpointManagementViewCtrl.$inject = ['$scope', '$location', '$interval', '$repositories', '$uibModal', 'ModalService', 'toastr', '$translate', 'GraphqlService', 'GraphqlContextService', 'AuthTokenService'];

function GraphqlEndpointManagementViewCtrl($scope, $location, $interval, $repositories, $uibModal, ModalService, toastr, $translate, GraphqlService, GraphqlContextService, AuthTokenService) {

    // =========================
    // Private variables
    // =========================

    const subscriptions = [];

    /**
     * The interval for polling the endpoints info.
     * @type {number}
     */
    const ENDPOINTS_INFO_POLLING_INTERVAL = 5000;

    // =========================
    // Public variables
    // =========================

    /**
     * Flag indicating if there are any GraphQL endpoints.
     * @type {boolean}
     */
    $scope.hasEndpoints = false;

    /**
     * The currently expanded row index.
     * @type {number}
     */
    $scope.expandedRow = -1;

    /**
     * Flag indicating if endpoints info loading is in progress.
     * @type {boolean}
     */
    $scope.loadingEndpointsInfo = false;

    /**
     * The list of GraphQL endpoints info.
     * @type {GraphqlEndpointsInfoList|undefined}
     */
    $scope.endpointsInfoList = undefined;

    /**
     * The term to filter the endpoints by.
     * @type {string}
     */
    $scope.filterTerm = '';

    /**
     * Flag indicating if an endpoint is being deleted.
     * @type {boolean}
     */
    $scope.deletingEndpoint = false;

    /**
     * The timer for polling the endpoints info.
     * @type {Promise|undefined}
     */
    let endpointsInfoPollingTimer = undefined;

    /**
     * The Promise for loading the endpoints info.
     * @type {Promise|undefined}
     */
    let endpointsInfoLoader = undefined;

    // =========================
    // Public methods
    // =========================

    /**
     * Toggles the expanded state of the row.
     * @param {MouseEvent} event The click event.
     * @param {number} index The index of the row.
     */
    $scope.toggleRow = (event, index) => {
        event.preventDefault();
        if ($scope.expandedRow === index) {
            $scope.expandedRow = -1;
        } else {
            $scope.expandedRow = index;
        }
    };

    /**
     * Opens the GraphQL endpoint for exploration in the playground.
     * @param {GraphqlEndpointInfo} endpoint The endpoint to explore.
     */
    $scope.exploreEndpoint = (endpoint) => {
        GraphqlContextService.setSelectedEndpoint(endpoint);
        $location.path(endpointUrl.PLAYGROUND);
    };

    /**
     * Filters the endpoints by the given term.
     * @param {string} filterTerm The term to filter by.
     */
    $scope.onEndpointsFilter = (filterTerm) => {
        $scope.filterTerm = filterTerm.toLowerCase();
        $scope.endpointsInfoList.filter(filterTerm);
    };

    /**
     * Starts a new GraphQL endpoint creation process by emitting the create endpoint event.
     */
    $scope.startCreateEndpointWizard = () => {
        GraphqlContextService.startCreateEndpointWizard();
    };

    $scope.importSchema = () => {
        // TODO: implement schema import
    };

    $scope.onExportSchema = (endpoint) => {
        // TODO: implement schema export
    };

    $scope.onConfigureEndpoint = (endpoint) => {
        return $uibModal.open({
            templateUrl: 'js/angular/graphql/templates/modal/endpoint-configuration-modal.html',
            controller: 'GraphqlEndpointConfigurationModalController',
            windowClass: 'graphql-endpoint-configuration-modal',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: () => {
                    return {
                        repository: $repositories.getActiveRepository(),
                        endpoint: endpoint.endpointId
                    };
                }
            }
        }).result;
    };

    /**
     * Handles the delete endpoint event.
     * @param {GraphqlEndpointInfo} endpoint The endpoint to delete.
     */
    $scope.onDeleteEndpoint = (endpoint) => {
        ModalService.openConfirmationModal({
                title: $translate.instant('graphql.endpoints_management.table.actions.delete_endpoint.confirmation.title'),
                message: $translate.instant('graphql.endpoints_management.table.actions.delete_endpoint.confirmation.body', {name: endpoint.endpointId}),
                confirmButtonKey: 'common.confirm'
            },
            () => {
                deleteEndpoint(endpoint);
            });
    };

    $scope.showEndpointReport = (endpointReport) => {
        return $uibModal.open({
            templateUrl: 'js/angular/graphql/templates/modal/endpoint-generation-failure-result-modal.html',
            controller: 'EndpointGenerationResultFailureModalController',
            windowClass: 'endpoint-generation-failure-result-modal',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: () => {
                    return {
                        endpointReport
                    };
                }
            }
        }).result;
    }

    // =========================
    // Private methods
    // =========================

    /**
     * Handles the change of the active repository.
     * @param {object} repositoryObject
     */
    const getActiveRepositoryObjectHandler = (repositoryObject) => {
        if (repositoryObject) {
            onInit();
        }
    };

    /**
     * Deletes the given GraphQL endpoint.
     * @param {GraphqlEndpointInfo} endpoint The endpoint to delete.
     */
    const deleteEndpoint = (endpoint) => {
        $scope.deletingEndpoint = true;
        GraphqlService.deleteEndpoint($repositories.getActiveRepository(), endpoint.endpointId)
            .then(() => {
                toastr.success(
                    $translate.instant(
                        'graphql.endpoints_management.table.actions.delete_endpoint.success',
                        {name: endpoint.endpointId}));
                loadEndpointsInfo();
            })
            .catch((error) => {
                toastr.error(getError(error));
                console.error('Error deleting GraphQL endpoint', error);
            })
            .finally(() => {
                $scope.deletingEndpoint = false;
            });
    }

    /**
     * Handles the loaded GraphQL endpoints info.
     * @param {GraphqlEndpointsInfoList} endpointsInfoList
     */
    const onEndpointsInfoLoaded = (endpointsInfoList) => {
        $scope.endpointsInfoList = endpointsInfoList;
        if ($scope.endpointsInfoList && $scope.endpointsInfoList.endpoints.length > 0) {
            $scope.hasEndpoints = true;
        }
    }

    /**
     * Loads the GraphQL endpoints info.
     */
    const loadEndpointsInfo = () => {
        $scope.loadingEndpointsInfo = true;
        return GraphqlService.getEndpointsInfo($repositories.getActiveRepository())
            .then(onEndpointsInfoLoaded)
            .catch((error) => {
                toastr.error(getError(error));
                console.error('Error loading GraphQL endpoints info', error);
            })
            .finally(() => {
                $scope.loadingEndpointsInfo = false;
            });
    };

    /**
     * Handles the start create endpoint wizard event.
     */
    const onStartCreateEndpointWizard = () => {
        $location.path(endpointUrl.CREATE_ENDPOINT);
    };

    /**
     * Loads the GraphQL endpoints info periodically called by the polling timer.
     * @returns {Promise<void>}
     */
    const reloadEndpointsInfo = () => {
        return GraphqlService.getEndpointsInfo($repositories.getActiveRepository())
            .then(onEndpointsInfoLoaded)
            .catch((error) => {
                toastr.error(getError(error));
                console.error('Error loading GraphQL endpoints info', error);
            })
            .finally(() => {
                if (endpointsInfoLoader) {
                    endpointsInfoLoader = undefined;
                }
            });
    }

    /**
     * Polls the GraphQL endpoints info.
     */
    const pollEndpointsInfo = () => {
        endpointsInfoPollingTimer = $interval(() => {
            if (!endpointsInfoLoader) {
                endpointsInfoLoader = reloadEndpointsInfo();
            }
        }, ENDPOINTS_INFO_POLLING_INTERVAL);
    }

    /**
     * Unsubscribes all watchers.
     */
    const unsubscribeAll = () => {
        endpointsInfoPollingTimer && $interval.cancel(endpointsInfoPollingTimer);
        endpointsInfoPollingTimer = undefined;
        subscriptions.forEach((subscription) => subscription());
    };

    // =========================
    // Subscriptions
    // =========================

    subscriptions.push(GraphqlContextService.subscribe(GraphqlEventName.START_CREATE_ENDPOINT_WIZARD, onStartCreateEndpointWizard));
    subscriptions.push($scope.$watch($scope.getActiveRepositoryObject, getActiveRepositoryObjectHandler));
    $scope.$on('$destroy', unsubscribeAll);

    // =========================
    // Initialization
    // =========================

    const onInit = () => {
        loadEndpointsInfo()
            .then(() => {
                pollEndpointsInfo();
            });
    };
}
