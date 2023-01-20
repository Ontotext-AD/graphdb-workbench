angular
    .module('graphdb.framework.rest.sparql.service', [])
    .factory('SparqlRestService', SparqlRestService);

SparqlRestService.$inject = ['$http'];

const SPARQL_ENDPOINT = 'rest/sparql';
const SAVED_QUERIES_ENDPOINT = `${SPARQL_ENDPOINT}/saved-queries`;

function SparqlRestService($http) {
    return {
        getSavedQueries,
        getSavedQuery,
        addKnownPrefixes,
        editSavedQuery,
        deleteSavedQuery,
        addNewSavedQuery
    };

    function getSavedQuery(savedQueryName, owner) {
        let ownerQuery = '';
        if (owner != null) {
            ownerQuery = `&owner=${encodeURIComponent(owner)}`;
        }
        return $http.get(`${SAVED_QUERIES_ENDPOINT}?name=${encodeURIComponent(savedQueryName)}${ownerQuery}`);
    }

    /**
     * Fetch saved queries.
     * @return {Promise} a promise which resolves with the saved queries list result in format
     * <code>
     * [
     *   {
     *       // the name of the query
     *       name: string;
     *       // the query itself
     *       body: string;
     *       // the query creator
     *       owner: string;
     *       // if the query is public or private
     *       shared: boolean;
     *   }
     * ]
     * </code>
     */
    function getSavedQueries() {
        return $http.get(SAVED_QUERIES_ENDPOINT);
    }

    /**
     * Creates a new saved query.
     *
     * @param {object} payload A payload object in format
     * <code>
     *  {
     *      body: string,
     *      name: string,
     *      shared: boolean
     *  }
     * </code>
     * @return {Promise} a promise which resolves with the result from the save query request or an error message.
     */
    function addNewSavedQuery(payload) {
        return $http.post(SAVED_QUERIES_ENDPOINT, payload);
    }

    /**
     * Updates an existing saved query.
     *
     * @param {object} payload A payload object in format
     * <code>
     *  {
     *      body: string,
     *      name: string,
     *      shared: boolean
     *  }
     * </code>
     * @return {Promise} a promise which resolves with the result from the save query request or an error message.
     */
    function editSavedQuery(payload) {
        return $http.put(SAVED_QUERIES_ENDPOINT, payload);
    }

    /**
     * Deletes an existing saved query.
     *
     * @param {string} savedQueryName The name of the query which should be deleted.
     * @return {Promise} a promise which resolves with the result from the delete query request or an error message.
     */
    function deleteSavedQuery(savedQueryName) {
        return $http.delete(`${SAVED_QUERIES_ENDPOINT}?name=${encodeURIComponent(savedQueryName)}`);
    }

    function addKnownPrefixes(prefixes) {
        return $http.post(`${SPARQL_ENDPOINT}/add-known-prefixes`, prefixes);
    }
}
