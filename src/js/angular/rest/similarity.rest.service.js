angular
    .module('graphdb.framework.rest.similarity.service', [])
    .factory('SimilarityRestService', SimilarityRestService);

SimilarityRestService.$inject = ['$http', '$repositories'];

const SIMILARITY_ENABLED = 'select ?o where {\n' +
    '?s <http://www.ontotext.com/owlim/system#listplugins> ?o .\n' +
    'filter(str(?s) = \'similarity\')\n' +
    '} ';

const ENABLE_SIMILARITY = 'INSERT DATA { <u:a> <http://www.ontotext.com/owlim/system#startplugin> \'similarity\' .}';

const SIMILARITY_ENDPOINT = 'rest/similarity';

function SimilarityRestService($http, $repositories) {

    return {
        getIndexes,
        getSearchQueries,
        rebuildIndex,
        deleteIndex,
        createIndex,
        getSamples,
        checkPluginEnabled,
        enableSimilarityPlugin
    };

    function getIndexes() {
        return $http.get(SIMILARITY_ENDPOINT);
    }

    function getSamples() {
        return $http.get(`${SIMILARITY_ENDPOINT}/samples`);
    }

    function getSearchQueries() {
        return $http.get(`${SIMILARITY_ENDPOINT}/config`);
    }

    function createIndex(method, name, options, selectQuery, searchQuery, analogicalQuery, stopList, infer, sameAs, type, analyzer) {
        return $http({
                method,
                url: `/${SIMILARITY_ENDPOINT}`,
                noCancelOnRouteChange: true,
                data: {
                    name,
                    options,
                    selectQuery,
                    stopList,
                    infer,
                    sameAs,
                    type,
                    analyzer,
                    searchQuery,
                    analogicalQuery
                }
            }
        );
    }

    function rebuildIndex(index) {
        return createIndex('PUT', index.name, index.options, index.selectQuery, index.searchQuery, index.analogicalQuery, index.stopList, index.infer, index.sameAs, index.type);
    }

    function deleteIndex(index) {
        return $http.delete(`${SIMILARITY_ENDPOINT}?name=${index.name}`);
    }

    function checkPluginEnabled() {
        return $.ajax({
            method: 'GET',
            url: `repositories/${$repositories.getActiveRepository()}`,
            data: {
                query: SIMILARITY_ENABLED
            }
        });
    }

    function enableSimilarityPlugin() {
        return $.ajax({
            method: 'POST',
            url: `repositories/${$repositories.getActiveRepository()}/statements`,
            data: {
                update: ENABLE_SIMILARITY
            }
        });
    }
}
