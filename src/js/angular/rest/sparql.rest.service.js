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
        addNewSavedQuery,
    };

    function getSavedQueries() {
        return $http.get(SAVED_QUERIES_ENDPOINT);
    }

    function getSavedQuery(savedQueryName, owner) {
        let ownerQuery = '';
        if (owner != null) {
            ownerQuery = `&owner=${encodeURIComponent(owner)}`;
        }
        return $http.get(`${SAVED_QUERIES_ENDPOINT}?name=${encodeURIComponent(savedQueryName)}${ownerQuery}`);
    }

    function addKnownPrefixes(prefixes) {
        return $http.post(`${SPARQL_ENDPOINT}/addKnownPrefixes`, prefixes);
    }

    function editSavedQuery(query) {
        return $http.put(SAVED_QUERIES_ENDPOINT, query);
    }

    function deleteSavedQuery(savedQueryName) {
        return $http.delete(`${SAVED_QUERIES_ENDPOINT}?name=${encodeURIComponent(savedQueryName)}`);
    }

    function addNewSavedQuery(query) {
        return $http.post(SAVED_QUERIES_ENDPOINT, query);
    }
}
