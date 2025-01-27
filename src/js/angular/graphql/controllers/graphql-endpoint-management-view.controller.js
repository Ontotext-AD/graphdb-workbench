import '../../core/services/graphql.service';

const modules = [
    'graphdb.framework.core.services.graphql-service'
];

angular
    .module('graphdb.framework.graphql.controllers.graphql-endpoint-management-view', modules)
    .controller('GraphqlEndpointManagementViewCtrl', GraphqlEndpointManagementViewCtrl);

GraphqlEndpointManagementViewCtrl.$inject = ['$scope', '$location', '$repositories', 'toastr', 'GraphqlService', 'AuthTokenService'];

function GraphqlEndpointManagementViewCtrl($scope, $location, $repositories, toastr, GraphqlService, AuthTokenService) {

    // =========================
    // Private variables
    // =========================

    const subscriptions = [];

    // =========================
    // Public variables
    // =========================

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

    // =========================
    // Public methods
    // =========================

    $scope.exploreEndpoint = (endpoint) => {
        // TODO: put the selected endpoint in the context
        $location.path('/graphql/playground');
    };

    $scope.onEndpointsFilter = (term) => {
        // TODO: implement filtering
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
                toastr.error('Error loading GraphQL endpoints info', 'Error');
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
