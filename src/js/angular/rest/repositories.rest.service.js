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
        getPrefix,
        getCluster,
        getRepositoryFileContent,
        updateRepositoryFileContent,
        validateOntopPropertiesConnection,
        restartRepository,
        getSupportedDriversData,
        updatePropertiesFile,
        loadPropertiesFile,
        getRepositoriesFromKnownLocation
    };

    function getRepository(repoInfo) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repoInfo.id}`, {
            params: {
                location: repoInfo.location
            }
        });
    }

    function getRepositories() {
        return $http.get(`${REPOSITORIES_ENDPOINT}/all`);
    }

    function getRepositoriesFromKnownLocation(location) {
        return $http.get(`${REPOSITORIES_ENDPOINT}?location=${location}`);
    }

    function deleteRepository(repo) {
        return $http.delete(`${REPOSITORIES_ENDPOINT}/${repo.id}`, {
            params: {
                location: repo.location
            }
        });
    }

    function createRepository(config) {
        return $http.post(REPOSITORIES_ENDPOINT, config);
    }

    function editRepository(repositoryId, config) {
        return $http.put(`${REPOSITORIES_ENDPOINT}/${repositoryId}`, config);
    }

    function restartRepository(repo) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/${repo.id}/restart`, null, {
            params: {
                location: repo.location
            }
        });
    }

    function getRepositoryConfiguration(repositoryType) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/defaultConfig/${repositoryType}`);
    }

    function getSize(repository) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repository.id}/size`, {
            params: {
                location: repository.location
            }
        });
    }

    function getPrefix(repositoryId, params) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/${repositoryId}/prefix`, null, { params })
    }

    function getCluster() {
        return $http.get(`${REPOSITORIES_ENDPOINT}/cluster`);
    }

    function getRepositoryFileContent(file) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/getFileContent`, {params: {fileLocation: file}});
    }

    function updateRepositoryFileContent(fileLocation, content) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/updateFile`, JSON.stringify(content), {params: {fileLocation: fileLocation}});
    }

    function validateOntopPropertiesConnection(ontopProperties) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/ontop/test-connection`, ontopProperties);
    }

    function getSupportedDriversData() {
        return $http.get(`${REPOSITORIES_ENDPOINT}/ontop/drivers`);
    }

    function updatePropertiesFile(fileLocation, content) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/ontop/jdbc-properties`,
            JSON.stringify(content), {params: {fileLocation: fileLocation}});
    }

    function loadPropertiesFile(file) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/ontop/jdbc-properties`, {params: {fileLocation: file}});
    }
}
