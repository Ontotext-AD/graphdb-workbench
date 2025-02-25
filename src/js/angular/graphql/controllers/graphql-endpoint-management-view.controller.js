import '../../core/services/graphql.service';
import '../services/graphql-context.service';
import './graphql-endpoint-configuration-modal.controller';
import './import-endpoint-definition-modal.controller';
import {GraphqlEventName} from "../services/graphql-context.service";
import {endpointUrl} from "../models/endpoints";
import {resolvePlaygroundUrlWithEndpoint} from "../services/endpoint-utils";
import {saveAs} from 'lib/FileSaver-patch';
import {GraphqlEndpointInfo} from "../../models/graphql/graphql-endpoints-info";

const modules = [
    'graphdb.framework.core.services.graphql-service',
    'graphdb.framework.graphql.services.graphql-context',
    'graphdb.framework.graphql.controllers.graphql-endpoint-configuration-modal',
    'graphdb.framework.graphql.controllers.import-endpoint-definition-modal'
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
     * The selected default endpoint. There can be only one default endpoint.
     * @type {GraphqlEndpointInfo|undefined}
     */
    $scope.selectedDefaultEndpoint = undefined;

    /**
     * Flag showing if an operation is in progress.
     * @type {boolean}
     */
    $scope.operationInProgress = false;

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

    /**
     * A flag indicating if the endpoint active state is being changed.
     * @type {boolean}
     */
    $scope.changingEndpointActiveState = false;

    // =========================
    // Public methods
    // =========================

    /**
     * Sets the given endpoint as the default one for the active repository.
     * @param {GraphqlEndpointInfo} endpointInfo The endpoint to set as default.
     */
    $scope.setEndpointAsDefault = (endpointInfo) => {
        let previousDefaultEndpoint;
        if ($scope.selectedDefaultEndpoint) {
            previousDefaultEndpoint = $scope.selectedDefaultEndpoint;
            $scope.selectedDefaultEndpoint.default = false;
        }
        $scope.selectedDefaultEndpoint = endpointInfo;
        endpointInfo.default = true;
        $scope.operationInProgress = true;
        const updateEndpointRequest = endpointInfo.toUpdateEndpointRequest($scope.endpointConfigurationSettings);
        GraphqlService.editEndpointConfiguration($repositories.getActiveRepository(), endpointInfo.endpointId, updateEndpointRequest.getUpdateDefaultEndpointRequest())
            .then((endpointInfo) => {
                toastr.success(
                    $translate.instant('graphql.endpoints_management.table.actions.set_as_default.success',
                        {endpointId: endpointInfo.endpointId})
                );
                $scope.endpointsInfoList.updateEndpoint(endpointInfo);
            })
            .catch((error) => {
                // something went wrong while setting the default endpoint so we need to revert the changes
                endpointInfo.default = true;
                if (previousDefaultEndpoint) {
                    $scope.selectedDefaultEndpoint.default = false;
                    $scope.selectedDefaultEndpoint = previousDefaultEndpoint;
                    $scope.selectedDefaultEndpoint.default = true;
                } else {
                    $scope.selectedDefaultEndpoint = undefined;
                }
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
     * @param {GraphqlEndpointInfo} endpointInfo The endpoint to explore.
     */
    $scope.onExploreEndpoint = (endpointInfo) => {
        const url = resolvePlaygroundUrlWithEndpoint(endpointInfo.endpointId);
        $location.url(url);
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

    /**
     * Toggles the active state of the given endpoint.
     * @param {GraphqlEndpointInfo} endpointInfo The endpoint to toggle the active state for.
     */
    $scope.toggleEndpointActiveState = (endpointInfo) => {
        $scope.changingEndpointActiveState = true;
        const newActiveState = !endpointInfo.active;
        const updateEndpointRequest = endpointInfo.toUpdateEndpointRequest($scope.endpointConfigurationSettings);
        GraphqlService.editEndpointConfiguration($repositories.getActiveRepository(), endpointInfo.endpointId, updateEndpointRequest.getUpdateEndpointActiveStateRequest())
            .then((updatedEndpoint) => {
                const operationKey = newActiveState ? 'activated' : 'deactivated';
                toastr.success(
                    $translate.instant(
                        `graphql.endpoints_management.table.actions.toggle_active_state.${operationKey}.success`,
                        {endpointId: updatedEndpoint.endpointId}
                    )
                );
                // Update the endpoint in place in the list. This will trigger the UI update and the user can see the
                // change immediately, e.g. the updatedAt field will be updated.
                $scope.endpointsInfoList.updateEndpoint(updatedEndpoint);
            })
            .catch((error) => {
                // something went wrong, revert the active state
                endpointInfo.active = !newActiveState;
                toastr.error(getError(error));
                console.error('Error updating endpoint active state', error);
            })
            .finally(() => {
                $scope.changingEndpointActiveState = false;
            });
    }

    /**
     * Opens the import endpoint definition modal from where the user can import endpoint definitions.
     * @returns {*} The modal instance.
     */
    $scope.importSchema = () => {
        return $uibModal.open({
            templateUrl: 'js/angular/graphql/templates/modal/import-endpoint-definition-modal.html',
            controller: 'ImportEndpointDefinitionModalController',
            windowClass: 'import-endpoint-definition-modal',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: () => {
                    return {
                        repositoryId: $repositories.getActiveRepository()
                    };
                }
            }
        }).result;
    };

    /**
     * Exports the GraphQL schema for the given endpoint.
     * @param {GraphqlEndpointInfo} endpointInfo The endpoint to export the schema for.
     */
    $scope.onExportSchema = (endpointInfo) => {
        GraphqlService.exportEndpointDefinition($repositories.getActiveRepository(), endpointInfo.endpointId)
            .then(({data, filename}) => {
                saveAs(data, filename);
            })
            .catch((error) => {
                toastr.error(getError(error));
                console.error('Error exporting GraphQL endpoint definition', error);
            });
    };

    /**
     * Handles the configure endpoint event triggered by the endpoint configuration action.
     * @param {GraphqlEndpointInfo} endpointConfiguration The endpoint configuration model.
     * @returns {*} The modal instance.
     */
    $scope.onConfigureEndpoint = (endpointConfiguration) => {
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
                        repositoryId: $repositories.getActiveRepository(),
                        endpointConfiguration: endpointConfiguration
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

    /**
     * Handles the show endpoint report event triggered by the endpoint report action.
     * @param {GraphqlEndpointInfo} endpointInfo The endpoint info model.
     * @returns {*}
     */
    $scope.onShowEndpointReport = (endpointInfo) => {
        GraphqlService.getEndpointConfigurationReport($repositories.getActiveRepository(), endpointInfo.endpointId)
            .then((endpointConfiguration) => {
                showReportModal(endpointConfiguration.getReport(endpointInfo.endpointId));
            })
            .catch((error) => {
                toastr.error(getError(error));
                console.error('Error loading GraphQL endpoint configuration', error);
            });
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
     * Shows the endpoint generation failure report.
     * @param {EndpointGenerationReport} endpointGenerationReport The endpoint configuration model.
     * @returns {*}
     */
    const showReportModal = (endpointGenerationReport) => {
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
                        endpointReport: endpointGenerationReport
                    };
                }
            }
        }).result;
    }

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
     * Handles the loaded GraphQL endpoints info.
     * @param {GraphqlEndpointsInfoList} endpointsInfoList
     */
    const onEndpointsInfoLoaded = (endpointsInfoList) => {
        $scope.endpointsInfoList = endpointsInfoList;
        if ($scope.endpointsInfoList && $scope.endpointsInfoList.endpoints.length > 0) {
            $scope.hasEndpoints = true;
            // Find out the default endpoint. If there is no default endpoint in the list, then create a new one dummy
            // one to be used for binding the UI.
            $scope.selectedDefaultEndpoint = $scope.endpointsInfoList.findDefaultEndpoint() || new GraphqlEndpointInfo();
        }
    }

    /**
     * Loads the GraphQL endpoints info.
     * @param {boolean} showLoader If the global loader should be displayed.
     * @returns {Promise<void>}
     */
    const loadEndpointsInfo = (showLoader) => {
        $scope.loadingEndpointsInfo = showLoader === true;
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
        loadEndpointsInfo(true)
            .then(() => {
                pollEndpointsInfo();
            });
    };
}
