angular
    .module('graphdb.framework.sparql.services', [])
    .factory('SparqlService', SparqlService);

SparqlService.$inject = ['$http', '$repositories'];

function SparqlService($http, $repositories) {
    return {
        getRepositorySize: getRepositorySize,
        getRepositoryNamespaces: getRepositoryNamespaces,
        getSavedQueries: getSavedQueries,
        getSavedQuery: getSavedQuery,
        addKnownPrefixes: addKnownPrefixes,
        editSavedQuery: editSavedQuery,
        deleteSavedQuery: deleteSavedQuery,
        addNewSavedQuery: addNewSavedQuery,
        abortQueryByAlias: abortQueryByAlias
    };

    function getRepositorySize() {
        return $http.get('repositories/' + $repositories.getActiveRepository() + '/size');
    }

    function getRepositoryNamespaces() {
        return $http.get('repositories/' + $repositories.getActiveRepository() + '/namespaces');
    }

    function getSavedQueries() {
        return $http.get('rest/sparql/saved-queries');
    }

    function getSavedQuery(savedQueryName, owner) {
        var ownerQuery = '';
        if (owner != null) {
            ownerQuery = '&owner=' + encodeURIComponent(owner);
        }
        return $http.get('rest/sparql/saved-queries?name=' + encodeURIComponent(savedQueryName) + ownerQuery);
    }

    function addKnownPrefixes(prefixes) {
        return $http.post('rest/sparql/addKnownPrefixes', prefixes);
    }

    function editSavedQuery(query) {
        return $http.put('rest/sparql/saved-queries', query);
    }

    function deleteSavedQuery(savedQueryName) {
        return $http.delete('rest/sparql/saved-queries?name=' + encodeURIComponent(savedQueryName));
    }

    function addNewSavedQuery(query) {
        return $http.post('rest/sparql/saved-queries', query);
    }

    function abortQueryByAlias(alias) {
        return $http.delete('rest/monitor/query?queryAlias=' + encodeURIComponent(alias));
    }
}
