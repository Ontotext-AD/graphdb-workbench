import '../../core/services/graphql.service';
import '../services/graphql-context.service';

const modules = [
    'graphdb.framework.core.services.graphql-service',
    'graphdb.framework.graphql.services.graphql-context'
];

angular
    .module('graphdb.framework.graphql.controllers.graphql-endpoint-management-view', modules)
    .controller('GraphqlEndpointManagementViewCtrl', GraphqlEndpointManagementViewCtrl);

GraphqlEndpointManagementViewCtrl.$inject = ['$scope', '$location', '$repositories', 'toastr', 'GraphqlService', 'GraphqlContextService', 'AuthTokenService'];

function GraphqlEndpointManagementViewCtrl($scope, $location, $repositories, toastr, GraphqlService, GraphqlContextService, AuthTokenService) {

    // =========================
    // Private variables
    // =========================

    const subscriptions = [];

    // =========================
    // Public variables
    // =========================

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
        $location.path('/graphql/playground');
    };

    /**
     * Filters the endpoints by the given term.
     * @param {string} filterTerm The term to filter by.
     */
    $scope.onEndpointsFilter = (filterTerm) => {
        $scope.filterTerm = filterTerm.toLowerCase();
        $scope.endpointsInfoList.filter(filterTerm);
    };

    $scope.createEndpoint = () => {
        // TODO: implement endpoint creation
    };

    $scope.importSchema = () => {
        // TODO: implement schema import
    };

    $scope.onExportSchema = (endpoint) => {
        // TODO: implement schema export
    };

    $scope.onConfigureEndpoint = (endpoint) => {
        // TODO: implement endpoint configuration
    };

    $scope.onDeleteEndpoint = (endpoint) => {
        // TODO: implement endpoint deletion
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
     * Loads the GraphQL endpoints info.
     */
    const loadEndpointsInfo = () => {
        $scope.loadingEndpointsInfo = true;
        GraphqlService.getEndpointsInfo($repositories.getActiveRepository())
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
     * Unsubscribes all watchers.
     */
    const unsubscribeAll = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    // =========================
    // Subscriptions
    // =========================

    subscriptions.push($scope.$watch($scope.getActiveRepositoryObject, getActiveRepositoryObjectHandler));
    $scope.$on('$destroy', unsubscribeAll);

    // =========================
    // Initialization
    // =========================

    const onInit = () => {
        loadEndpointsInfo();
    };
}
