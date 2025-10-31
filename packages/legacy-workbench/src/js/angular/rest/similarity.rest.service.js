angular
    .module('graphdb.framework.rest.similarity.service', [])
    .factory('SimilarityRestService', SimilarityRestService);

SimilarityRestService.$inject = ['$http', '$repositories'];

const SIMILARITY_ENDPOINT = 'rest/similarity';

function SimilarityRestService($http) {
    return {
        getIndexes,
        getSimilarityIndexesWithVectorFields,
        getSearchQueries,
        rebuildIndex,
        deleteIndex,
        createIndex,
        getSamples,
        getQuery,
        saveSearchQuery,
    };

    /**
     * Fetches the similarity indexes for the repository with id <code>repositoryId</code> and location <code>repositoryLocation</code>.
     * If the repository ID and repository location are not provided, the currently selected repository will be used.
     *
     * @param {string | undefined} repositoryId - The repository id.
     * @param {string | undefined} repositoryLocation - The repository location.
     * @return {*} The similarity indexes for the specified repository.
     */
    function getIndexes(repositoryId, repositoryLocation) {
        if (repositoryId) {
            return $http.get(SIMILARITY_ENDPOINT, {
                headers: {
                    'X-GraphDB-Repository': repositoryId,
                    'X-GraphDB-Repository-Location': repositoryLocation,
                },
            });
        }
        return $http.get(SIMILARITY_ENDPOINT);
    }

    /**
     * Fetches the similarity indexes with vector fields for a given repository.
     * @param {string} repositoryId - The repository for which to fetch similarity indexes.
     * @return {Promise<Record<string, string[]>>} The similarity indexes for the specified repository in format
     * <pre>
     * {
     *   "elasticsearch:otkg-vector": ["docText1", "docText2"],
     *   "elasticsearch:otkg-vector-new": ["docText1"],
     *   "similarity": ["test", "test1"]
     * }
     * </pre>
     */
    function getSimilarityIndexesWithVectorFields(repositoryId) {
        return $http.get(`${SIMILARITY_ENDPOINT}/${repositoryId}/indexes`);
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
                    analogicalQuery,
                },
            },
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
                    analyzer: data.indexAnalyzer,
                },
            });
    }

    function saveSearchQuery(data) {
        return $http({
            method: 'put',
            url: 'rest/similarity/search-query',
            data,
        });
    }
}
