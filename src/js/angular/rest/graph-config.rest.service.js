angular
    .module('graphdb.framework.rest.graphconfig.service', [])
    .factory('GraphConfigRestService', GraphConfigRestService);

const EXPLORE_GRAPH_ENDPOINT = 'rest/explore-graph/';
const EXPLORE_GRAPH_CONFIG_ENDPOINT = `${EXPLORE_GRAPH_ENDPOINT}config`;

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
        return $http.get(`${EXPLORE_GRAPH_ENDPOINT}samples`);
    }

    function loadGraphForConfig(config, includeInferred, linksLimit, startQuerySameAs) {
        return $http.get(`${EXPLORE_GRAPH_CONFIG_ENDPOINT}/graph/${encodeURIComponent(config.id)}?includeInferred=${includeInferred}&linksLimit=${linksLimit}&sameAsState=${startQuerySameAs}`);
    }

    function getConfig(id) {
        return $http.get(`${EXPLORE_GRAPH_CONFIG_ENDPOINT}/${encodeURIComponent(id)}`);
    }

    function createGraphConfig(config) {
        return $http.post(EXPLORE_GRAPH_CONFIG_ENDPOINT, config);
    }

    function updateGraphConfig(config) {
        return $http.put(`${EXPLORE_GRAPH_CONFIG_ENDPOINT}/${encodeURIComponent(config.id)}`, config);
    }

    function deleteGraphConfig(config) {
        return $http.delete(`${EXPLORE_GRAPH_CONFIG_ENDPOINT}/${encodeURIComponent(config.id)}`);
    }

    function validateQuery(query, queryType, params, all, oneOf) {
        return $http({
            method: 'POST',
            url: `${EXPLORE_GRAPH_ENDPOINT}validate`,
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
