import {GraphqlPlaygroundConfig} from '../../models/graphql/graphql-playground-config';
import '../../core/services/graphql.service';
import 'angular/core/directives/graphql-playground/graphql-playground.directive';
import {
    GraphqlPlaygroundDirectiveUtil
} from "../../core/directives/graphql-playground/graphql-playground-directive.util";

const modules = [
    'graphdb.framework.core.services.graphql-service',
    'graphdb.framework.core.directives.graphql-playground'
];

angular
    .module('graphdb.framework.graphql.controllers.graphql-playground-view', modules)
    .controller('GraphqlPlaygroundViewCtrl', GraphqlPlaygroundViewCtrl);

GraphqlPlaygroundViewCtrl.$inject = ['$scope', '$location', '$repositories', '$languageService', 'toastr', 'GraphqlService', 'GraphqlContextService', 'AuthTokenService'];

function GraphqlPlaygroundViewCtrl($scope, $location, $repositories, $languageService, toastr, GraphqlService, GraphqlContextService, AuthTokenService) {

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
        let endpointUrl = endpoint.replace(/^\//, '');
        const config = {
            endpoint: endpointUrl,
            selectedLanguage: $languageService.getLanguage()
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
     * Finds the default endpoint from the list of endpoints.
     * @param {SelectMenuOptionsModel[]} endpoints - The list of endpoints.
     * @returns {SelectMenuOptionsModel|undefined}
     */
    const findDefaultEndpoint = (endpoints) => {
        return endpoints.find((endpoint) => endpoint.data.default);
    };

    /**
     * Finds an endpoint by label.
     * @param {SelectMenuOptionsModel[]} endpoints - The list of endpoints.
     * @param label - The label of the endpoint. The label is same as the endpointId.
     * @returns {SelectMenuOptionsModel|undefined}
     */
    const findEndpointByLabel = (endpoints, label) => {
        return endpoints.find((endpoint) => endpoint.label === label);
    };

    /**
     * Resolves the selected endpoint. The priority of which endpoint should be selected is as follows:
     * 1. If there is a query parameter with the endpoint id. This is used when the user opens the page with a direct url.
     * 2. If there is a selected endpoint in the graphql context. This is used when the user navigates from some other
     * view which stores the selected endpoint in the context in advance.
     * 3. If there is an endpoint which is set as default.
     * 4. In none of the above is true, then first one from the list is selected.
     * @return {SelectMenuOptionsModel}
     */
    const resolveSelectedEndpoint = () => {
        const queryParams = $location.search();
        const endpointIdFromUrl = queryParams.endpointId;
        if (endpointIdFromUrl) {
            const endpointSelectOption = findEndpointByLabel($scope.graphqlEndpoints, endpointIdFromUrl);
            if (endpointSelectOption) {
                return endpointSelectOption;
            }
        }

        const selectedEndpoint = GraphqlContextService.getSelectedEndpoint();
        if (selectedEndpoint) {
            const endpointSelectOption = findEndpointByLabel($scope.graphqlEndpoints, selectedEndpoint.endpointId);
            if (endpointSelectOption) {
                return endpointSelectOption;
            }
        }

        const defaultEndpoint = findDefaultEndpoint($scope.graphqlEndpoints);
        if (defaultEndpoint) {
            return defaultEndpoint;
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
     * Handles language change events and updates the GraphQL Playground component's language.
     *
     * @param {Event} event - The event triggered by the language change.
     * @param {Object} args - The arguments containing language details.
     * @param {string} args.locale - The new locale to be set for the GraphQL Playground.
     */
    const getLanguageChangeHandler = (event, args) => {
        GraphqlPlaygroundDirectiveUtil.getGraphqlPlaygroundComponentAsync("#graphql-playground")
            .then((graphqlPlayground) => {
                graphqlPlayground.setLanguage(args.locale);
            })
    }

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
    subscriptions.push($scope.$on('language-changed', getLanguageChangeHandler));
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
