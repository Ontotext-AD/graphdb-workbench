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
        createRepository,
        editRepository,
        getRepositoryConfiguration,
        getSize,
        getPrefix
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

    function createRepository(config) {
        return $http.post(REPOSITORIES_ENDPOINT, config);
    }

    function editRepository(repositoryId, config) {
        return $http.put(`${REPOSITORIES_ENDPOINT}/${repositoryId}`, config);
    }

    function getRepositoryConfiguration(repositoryType) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/defaultConfig/${repositoryType}`);
    }

    function getSize(repositoryId) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/size`);
    }

    function getPrefix(repositoryId, params) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/${repositoryId}/prefix`, null, { params })
    }
}
