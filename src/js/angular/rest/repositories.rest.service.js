angular
    .module('graphdb.framework.rest.repositories.service', [])
    .factory('RepositoriesRestService', RepositoriesRestService);

RepositoriesRestService.$inject = ['$http'];

function RepositoriesRestService($http) {
    return {
        getRepositories: getRepositories,
        getRepository: getRepository,
        // createRepository: createRepository,
        deleteRepository: deleteRepository,
        // editRepository: editRepository,
        getRepositoryConfiguration: getRepositoryConfiguration
    };

    function getRepository(repositoryid) {
        return $http.get('rest/repositories/' + repositoryid);
    }

    function getRepositories() {
        return $http.get('rest/repositories');
    }

    function deleteRepository(repositoryId) {
        return $http.delete('rest/repositories/' + repositoryId);
    }

    function getRepositoryConfiguration(repositoryType) {
        return $http.get('rest/repositories/defaultConfig/' + repositoryType);
    }
}
