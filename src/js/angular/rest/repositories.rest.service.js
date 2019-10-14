angular
    .module('graphdb.framework.rest.repositories.service', [])
    .factory('RepositoriesRestService', RepositoriesRestService);

RepositoriesRestService.$inject = ['$http'];

const REPOSITORIES_ENDPOINT = 'rest/repositories';

function RepositoriesRestService($http) {
    return {
        getRepositories,
        getRepository,
        deleteRepository,
        getRepositoryConfiguration
    };

    function getRepository(repositoryid) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryid}`);
    }

    function getRepositories() {
        return $http.get(REPOSITORIES_ENDPOINT);
    }

    function deleteRepository(repositoryId) {
        return $http.delete(`${REPOSITORIES_ENDPOINT}/${repositoryId}`);
    }

    function getRepositoryConfiguration(repositoryType) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/defaultConfig/${repositoryType}`);
    }
}
