import {mapGraphsConfigResponseToModel} from "./mappers/graphs-config-mapper";

angular
    .module('graphdb.framework.rest.graphconfig.service', [])
    .factory('GraphConfigRestService', GraphConfigRestService);

const EXPLORE_GRAPH_ENDPOINT = 'rest/explore-graph';
const EXPLORE_GRAPH_CONFIG_ENDPOINT = `${EXPLORE_GRAPH_ENDPOINT}/config`;

GraphConfigRestService.$inject = ['$http'];

function GraphConfigRestService($http) {
    return {
        getGraphConfigs,
        getGraphConfigSamples,
        loadGraphForConfig,
        getConfig,
        createGraphConfig,
        updateGraphConfig,
        deleteGraphConfig,
        validateQuery
    };

    function getGraphConfigs() {
        return $http.get(EXPLORE_GRAPH_CONFIG_ENDPOINT);
    }

    function getGraphConfigSamples() {
        return $http.get(`${EXPLORE_GRAPH_ENDPOINT}/samples`);
    }

    function loadGraphForConfig(config, includeInferred, linksLimit, startQuerySameAs) {
        return $http.get(`${EXPLORE_GRAPH_CONFIG_ENDPOINT}/graph/${encodeURIComponent(config.id)}?includeInferred=${includeInferred}&linksLimit=${linksLimit}&sameAsState=${startQuerySameAs}`);
    }

    function getConfig(id) {
        return $http.get(`${EXPLORE_GRAPH_CONFIG_ENDPOINT}/${encodeURIComponent(id)}`)
            .then((response) => mapGraphsConfigResponseToModel(response.data));
    }

    /**
     * Creates a new graph config.
     * @param {GraphsConfig} config
     * @return {Promise} A Promise which resolves with the result of the saved graph config.
     */
    function createGraphConfig(config) {
        return $http.post(EXPLORE_GRAPH_CONFIG_ENDPOINT, config);
    }

    /**
     * Updates an existing graph config.
     * @param {GraphsConfig} config
     * @return {Promise} A Promise which resolves with the result of the updated graph config.
     */
    function updateGraphConfig(config) {
        console.log('rest update', config);
        return $http.put(`${EXPLORE_GRAPH_CONFIG_ENDPOINT}/${encodeURIComponent(config.id)}`, config);
    }

    function deleteGraphConfig(config) {
        return $http.delete(`${EXPLORE_GRAPH_CONFIG_ENDPOINT}/${encodeURIComponent(config.id)}`);
    }

    function validateQuery(query, queryType, params, all, oneOf) {
        return $http({
            method: 'POST',
            url: `${EXPLORE_GRAPH_ENDPOINT}/validate`,
            data: {
                query,
                queryType,
                params,
                all,
                oneOf
            }
        });
    }
}
