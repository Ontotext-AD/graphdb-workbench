define([], function () {

        angular
            .module('graphdb.framework.similarity.services', [])
            .factory('SimilarityService', SimilarityService);

        SimilarityService.$inject = ['$http', '$repositories'];

        var SIMILARITY_ENABLED = "select ?o where {\n" +
                                     "?s <http://www.ontotext.com/owlim/system#listplugins> ?o .\n" +
                                     "filter(str(?s) = 'similarity')\n" +
                                  "} ";

        var ENABLE_SIMILARITY = "INSERT DATA { <u:a> <http://www.ontotext.com/owlim/system#startplugin> 'similarity' .}";

        function SimilarityService($http, $repositories) {

            return {
                getIndexes: getIndexes,
                getSearchQueries: getSearchQueries,
                rebuildIndex: rebuildIndex,
                deleteIndex: deleteIndex,
                createIndex: createIndex,
                getSamples: getSamples,
                checkPluginEnabled: checkPluginEnabled,
                enableSimilarityPlugin: enableSimilarityPlugin

            };

            function getIndexes() {
                return $http.get('rest/similarity');
            }

            function getSamples() {
                return $http.get('rest/similarity/samples');
            }
            function getSearchQueries() {
                return $http.get('rest/similarity/config');
            }

            function createIndex(method, name, options, selectQuery, searchQuery, analogicalQuery, stopList, inference, sameAs, indexType, analyzer) {
                return $http({
                    method: method,
                    url: "/rest/similarity",
                    noCancelOnRouteChange: true,
                    data: {
                        name: name,
                        options: options,
                        selectQuery: selectQuery,
                        stopList: stopList,
                        infer: inference,
                        sameAs: sameAs,
                        type: indexType,
                        analyzer: analyzer,
                        searchQuery: searchQuery,
                        analogicalQuery: analogicalQuery
                    }
                }
            )
            }

            function rebuildIndex(index) {
                return createIndex('PUT', index.name, index.options, index.selectQuery, index.searchQuery, index.analogicalQuery, index.stopList, index.infer, index.sameAs, index.type);
            }

            function deleteIndex(index) {
                return $http.delete('rest/similarity?name=' + index.name);
            }

            function checkPluginEnabled() {
                return $.ajax({
                    method: 'GET',
                    url: 'repositories/' + $repositories.getActiveRepository(),
                    data: {
                        query: SIMILARITY_ENABLED,
                    },
                });
            }

            function enableSimilarityPlugin() {
                return $.ajax({
                    method: 'POST',
                    url: 'repositories/' + $repositories.getActiveRepository() + "/statements",
                    data: {
                        update: ENABLE_SIMILARITY
                    }
                })
            }

        }

    }
);