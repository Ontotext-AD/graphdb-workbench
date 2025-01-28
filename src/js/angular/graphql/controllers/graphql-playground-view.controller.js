import {GraphqlPlaygroundConfig} from '../../models/graphql/graphql-playground-config';
import '../../core/services/graphql.service';

const modules = [
    'graphdb.framework.core.services.graphql-service'
];

angular
    .module('graphdb.framework.graphql.controllers.graphql-playground-view', modules)
    .controller('GraphqlPlaygroundViewCtrl', GraphqlPlaygroundViewCtrl);

GraphqlPlaygroundViewCtrl.$inject = ['$scope', '$repositories', 'toastr', 'GraphqlService', 'GraphqlContextService', 'AuthTokenService'];

function GraphqlPlaygroundViewCtrl($scope, $repositories, toastr, GraphqlService, GraphqlContextService, AuthTokenService) {

    // =========================
    // Private variables
    // =========================

    const subscriptions = [];

    // =========================
    // Public variables
    // =========================

    /**
     * Flag indicating if the view finished initialization.
     * @type {boolean}
     */
    $scope.initialized = false;

    /**
     * @type {boolean}
     */
    $scope.loadingEndpoints = false;

    /**
     * @type {SelectMenuOptionsModel|undefined}
     */
    $scope.selectedGraphqlEndpoint = undefined;

    /**
     * @type {SelectMenuOptionsModel[]}
     */
    $scope.graphqlEndpoints = [];

    /**
     * @type {GraphqlPlaygroundConfig}
     */
    $scope.configuration = undefined;

    // =========================
    // Public methods
    // =========================

    /**
     * Indicates if there is an active repository.
     * @return {*}
     */
    $scope.getActiveRepositoryNoError = () => {
        return $repositories.getActiveRepository();
    };

    /**
     * Handles the change of the selected GraphQL endpoint.
     * @param {SelectMenuOptionsModel} selectedEndpoint - The selected endpoint.
     */
    $scope.onGraphqlEndpointChange = (selectedEndpoint) => {
        updateConfiguration(selectedEndpoint);
    };

    // =========================
    // Private methods
    // =========================

    /**
     * Builds the configuration object for the GraphQL Playground.
     * @param {string} endpoint - The selected endpoint.
     * @return {GraphqlPlaygroundConfig} - The configuration object.
     */
    const buildConfig = (endpoint) => {
        const config = {
            endpoint: endpoint
        };
        const authToken = AuthTokenService.getAuthToken();
        if (authToken) {
            config.headers = {
                Authorization: authToken
            };
        }
        return new GraphqlPlaygroundConfig(config);
    };

    /**
     * Resolves the selected endpoint. If there is no selected endpoint, the first one from the list is returned
     * @return {SelectMenuOptionsModel}
     */
    const resolveSelectedEndpoint = () => {
        const selectedEndpoint = GraphqlContextService.getSelectedEndpoint();
        if (selectedEndpoint) {
            const endpointSelectOption = $scope.graphqlEndpoints.find(
                (endpoint) => endpoint.label === selectedEndpoint.endpointId
            );
            if (endpointSelectOption) {
                return endpointSelectOption;
            }
        }
        return $scope.graphqlEndpoints[0];
    };

    /**
     * Initializes the view by setting all needed variables in the scope.
     * @param {SelectMenuOptionsModel[]} endpointsSelectMenuOptions
     */
    const initView = (endpointsSelectMenuOptions) => {
        $scope.graphqlEndpoints = endpointsSelectMenuOptions;
        $scope.selectedGraphqlEndpoint = resolveSelectedEndpoint();
        $scope.configuration = buildConfig($scope.selectedGraphqlEndpoint.value);
    };

    /**
     * Triggers the loading of the GraphQL endpoints for the active repository.
     * @return {Promise<void>}
     */
    const loadEndpoints = () => {
        $scope.loadingEndpoints = true;
        const currentRepository = $repositories.getActiveRepository();
        return GraphqlService.getEndpointsAsSelectMenuOptions(currentRepository)
            .then((endpointsSelectMenuOptions) => {
                if (endpointsSelectMenuOptions.length) {
                    initView(endpointsSelectMenuOptions);
                } else {
                    resetScope();
                }
            })
            .catch((error) => {
                resetScope();
                toastr.error(getError(error));
            })
            .finally(() => {
                $scope.loadingEndpoints = false;
            });
    };

    /**
     * Updates the configuration object with the new endpoint. This must create a new object to trigger the change
     * detection.
     * @param {SelectMenuOptionsModel} endpoint
     */
    const updateConfiguration = (endpoint) => {
        const config = buildConfig(endpoint.value);
        $scope.configuration = new GraphqlPlaygroundConfig(config);
    };

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
     * Resets the scope variables. This is used to clear the view when there are no GraphQL endpoints for example
     */
    const resetScope = () => {
        $scope.selectedGraphqlEndpoint = undefined;
        $scope.graphqlEndpoints = [];
        $scope.configuration = undefined;
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
        loadEndpoints().finally(() => {
            $scope.initialized = true;
        });
    };
}
