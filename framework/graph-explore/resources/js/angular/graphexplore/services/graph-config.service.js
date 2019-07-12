define([], function() {

    angular
      .module('graphdb.framework.graphexplore.services.graphconfig', [])
      .factory('GraphConfigService', GraphConfigService);

    GraphConfigService.$inject = ['$http', '$repositories'];

    function GraphConfigService($http, $repositories) {
        return {
            getGraphConfigs: getGraphConfigs,
            getGraphConfigSamples: getGraphConfigSamples,
            loadGraphForConfig: loadGraphForConfig,
            getConfig: getConfig,
            createGraphConfig: createGraphConfig,
            updateGraphConfig: updateGraphConfig,
            deleteGraphConfig: deleteGraphConfig,
            validateQuery: validateQuery
        };

        function getGraphConfigs() {
            return $http.get('rest/explore-graph/config');
        }

        function getGraphConfigSamples() {
            return $http.get('rest/explore-graph/samples');
        }

        function loadGraphForConfig(config, includeInferred, linksLimit, startQuerySameAs) {
            return $http.get('rest/explore-graph/config/graph/' + encodeURIComponent(config.id) + '?'
                + 'includeInferred=' + includeInferred + '&' + 'linksLimit=' + linksLimit + '&' + 'sameAsState=' + startQuerySameAs);
        }

        function getConfig(id) {
            return $http.get('rest/explore-graph/config/' + encodeURIComponent(id));
        }

        function createGraphConfig(config) {
            return $http.post('rest/explore-graph/config', config);
        }

        function updateGraphConfig(config) {
            return $http.put('rest/explore-graph/config/' + encodeURIComponent(config.id), config);
        }

        function deleteGraphConfig(config) {
            return $http.delete('rest/explore-graph/config/' + encodeURIComponent(config.id));
        }

        function validateQuery(query, queryType, params, all, oneOf) {
            return $http({
               method: 'POST',
               url: 'rest/explore-graph/validate',
               data: {
                   query: query,
                   queryType: queryType,
                   params: params,
                   all: all,
                   oneOf: oneOf
               }
           });
        }


    }

})