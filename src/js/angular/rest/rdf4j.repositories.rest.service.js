angular
    .module('graphdb.framework.rest.rdf4j.repositories.service', [])
    .factory('RDF4JRepositoriesRestService', RDF4JRepositoriesRestService);

RDF4JRepositoriesRestService.$inject = ['$http', '$repositories'];

const REPOSITORIES_ENDPOINT = 'repositories';

function RDF4JRepositoriesRestService($http, $repositories) {
    return {
        getNamespaces,
        getRepositoryNamespaces,
        updateNamespacePrefix,
        deleteNamespacePrefix
    };

    function getNamespaces(repositoryId) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/namespaces`);
    }

    function getRepositoryNamespaces() {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${$repositories.getActiveRepository()}/namespaces`);
    }

    function updateNamespacePrefix(repositoryId, namespace, prefix) {
        return $http({
            url: `${REPOSITORIES_ENDPOINT}/${repositoryId}/namespaces/${prefix}`,
            method: 'PUT',
            data: namespace
        })
    }

    function deleteNamespacePrefix(repositoryId, prefix) {
        return $http({
            url: `${REPOSITORIES_ENDPOINT}/${repositoryId}/namespaces/${prefix}`,
            method: 'DELETE'
        })
    }
}
