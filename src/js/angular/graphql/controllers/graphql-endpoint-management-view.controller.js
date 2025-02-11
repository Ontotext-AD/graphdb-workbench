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

GraphqlEndpointManagementViewCtrl.$inject = ['$scope', '$location', '$repositories', '$uibModal', 'ModalService', 'toastr', '$translate', 'GraphqlService', 'GraphqlContextService', 'AuthTokenService'];

function GraphqlEndpointManagementViewCtrl($scope, $location, $repositories, $uibModal, ModalService, toastr, $translate, GraphqlService, GraphqlContextService, AuthTokenService) {

    // =========================
    // Private variables
    // =========================

    const subscriptions = [];

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
     * The selected default endpoint. There can be only one default endpoint.
     * @type {GraphqlEndpointInfo|undefined}
     */
    $scope.selectedDefaultEndpoint = undefined;

    /**
     * Flag showing if an operation is in progress.
     * @type {boolean}
     */
    $scope.operationInProgress = false;

    // =========================
    // Public methods
    // =========================

    /**
     * Sets the given endpoint as the default one for the active repository.
     * @param {GraphqlEndpointInfo} endpoint The endpoint to set as default.
     */
    $scope.setEndpointAsDefault = (endpoint) => {
        const previousDefaultEndpoint = $scope.selectedDefaultEndpoint;
        $scope.selectedDefaultEndpoint.default = false;
        endpoint.default = true;
        $scope.selectedDefaultEndpoint = endpoint;
        $scope.operationInProgress = true;
        GraphqlService.setDefaultEndpoint($repositories.getActiveRepository(), endpoint.endpointId)
            .then(() => {
                toastr.success(
                    $translate.instant('graphql.endpoints_management.table.actions.set_as_default.success',
                        {endpointId: endpoint.endpointId})
                );
                return loadEndpointsInfo(false);
            })
            .catch((error) => {
                // something wen wrong while setting the default endpoint so we need to revert the changes
                $scope.selectedDefaultEndpoint.default = false;
                $scope.selectedDefaultEndpoint = previousDefaultEndpoint;
                $scope.selectedDefaultEndpoint.default = true;
                toastr.error(getError(error));
                console.error('Error setting default endpoint', error);
            })
            .finally(() => {
                $scope.operationInProgress = false;
            });
    };

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

    /**
     * Handles the configure endpoint event by opening the endpoint configuration modal.
     * @param {GraphqlEndpointInfo} endpoint The endpoint to configure.
     * @returns {*}
     */
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
        $scope.operationInProgress = true;
        GraphqlService.deleteEndpoint($repositories.getActiveRepository(), endpoint.endpointId)
            .then(() => {
                toastr.success(
                    $translate.instant('graphql.endpoints_management.table.actions.delete_endpoint.success',
                        {name: endpoint.endpointId}));
                $scope.operationInProgress = false;
                return loadEndpointsInfo(false);
            })
            .catch((error) => {
                toastr.error(getError(error));
                console.error('Error deleting GraphQL endpoint', error);
            })
            .finally(() => {
                $scope.operationInProgress = false;
            });
    }

    /**
     * Loads the GraphQL endpoints info.
     * @param {boolean} showLoader If the global loader should be displayed.
     * @returns {Promise<void>}
     */
    const loadEndpointsInfo = (showLoader) => {
        $scope.loadingEndpointsInfo = showLoader === true;
        return GraphqlService.getEndpointsInfo($repositories.getActiveRepository())
            .then((endpointsInfoList) => {
                $scope.endpointsInfoList = endpointsInfoList;
            })
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
     * Unsubscribes all watchers.
     */
    const unsubscribeAll = () => {
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
        loadEndpointsInfo(true)
            .then(() => {
                if ($scope.endpointsInfoList && $scope.endpointsInfoList.endpoints.length > 0) {
                    $scope.hasEndpoints = true;
                    $scope.selectedDefaultEndpoint = $scope.endpointsInfoList.findDefaultEndpoint();
                }
            });
    };
}
