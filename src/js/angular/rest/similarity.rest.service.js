angular
    .module('graphdb.framework.rest.similarity.service', [])
    .factory('SimilarityRestService', SimilarityRestService);

SimilarityRestService.$inject = ['$http', '$repositories'];

const SIMILARITY_ENDPOINT = 'rest/similarity';

function SimilarityRestService($http) {

    return {
        getIndexes,
        getSearchQueries,
        rebuildIndex,
        deleteIndex,
        createIndex,
        getSamples,
        getQuery,
        saveSearchQuery
    };

    /**
     * Fetches the similarity indexes for the repository with id <code>repositoryId</code> and location <code>repositoryLocation</code>.
     * If the repository ID and repository location are not provided, the values persisted in local storage will be used {@see authentication.interceptor.js}.
     *
     * @param {string} repositoryId - (optional) The repository id.
     * @param {string} repositoryLocation - (optional) The repository location.
     * @return {*} The similarity indexes for the specified repository.
     */
    function getIndexes(repositoryId, repositoryLocation) {
        if (repositoryId) {
            return $http.get(SIMILARITY_ENDPOINT, {
                headers: {
                    'X-GraphDB-Repository': repositoryId,
                    'X-GraphDB-Repository-Location': repositoryLocation
                }
            });
        }
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
                url: `${SIMILARITY_ENDPOINT}`,
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

    function getQuery(data) {
        return $http.get('rest/similarity/query',
            {
                params: {
                    name: data.indexName,
                    options: data.indexOptions,
                    stopList: data.indexStopList,
                    selectQuery: data.query,
                    infer: data.queryInference,
                    sameAs: data.querySameAs,
                    type: data.viewType,
                    analyzer: data.indexAnalyzer
                }
            });
    }

    function saveSearchQuery(data) {
        return $http({
            method: 'put',
            url: 'rest/similarity/search-query',
            data
        });
    }
}
