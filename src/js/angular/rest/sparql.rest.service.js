angular
    .module('graphdb.framework.rest.sparql.service', [])
    .factory('SparqlRestService', SparqlRestService);

SparqlRestService.$inject = ['$http', '$repositories'];

const SAVED_QUERIES_ENDPOINT = 'rest/sparql/saved-queries';
const REPOSITORIES_ENDPOINT = 'repositories/';

function SparqlRestService($http, $repositories) {
    return {
        getRepositorySize,
        getRepositoryNamespaces,
        getSavedQueries,
        getSavedQuery,
        addKnownPrefixes,
        editSavedQuery,
        deleteSavedQuery,
        addNewSavedQuery,
        abortQueryByAlias
    };

    function getRepositorySize() {
        return $http.get(`${REPOSITORIES_ENDPOINT}${$repositories.getActiveRepository()}/size`);
    }

    function getRepositoryNamespaces() {
        return $http.get(`${REPOSITORIES_ENDPOINT}${$repositories.getActiveRepository()}/namespaces`);
    }

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
        return $http.post('rest/sparql/addKnownPrefixes', prefixes);
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

    function abortQueryByAlias(alias) {
        return $http.delete(`rest/monitor/query?queryAlias=${encodeURIComponent(alias)}`);
    }
}
