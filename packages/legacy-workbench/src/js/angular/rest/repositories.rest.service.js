import {repositoryConfigMapper} from "./mappers/repositories-mapper";

angular
    .module('graphdb.framework.rest.repositories.service', [])
    .factory('RepositoriesRestService', RepositoriesRestService);

RepositoriesRestService.$inject = ['$http'];

export const REPOSITORIES_ENDPOINT = 'rest/repositories';

function RepositoriesRestService($http) {
    return {
        getRepositories,
        getRepository,
        getRepositoryModel,
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
        getRepositoriesFromKnownLocation,
        getRepositoryTurtleConfig
    };

    function getRepository(repoInfo) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repoInfo.id}`, {
            params: {
                location: repoInfo.location
            }
        });
    }

    function getRepositoryModel(repoInfo) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repoInfo.id}`, {
            params: {
                location: repoInfo.location
            }
        }).then((response) => {
            return repositoryConfigMapper(response.data);
        });
    }

    function getRepositories(location) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/all`, {
            params: {
                location: location
            }
        });
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
        return $http.get(`${REPOSITORIES_ENDPOINT}/default-config/${repositoryType}`);
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
        return $http.get(`${REPOSITORIES_ENDPOINT}/file`, {params: {fileLocation: file}});
    }

    function updateRepositoryFileContent(fileLocation, content, location) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/file/update`, JSON.stringify(content), {
            params: {
                fileLocation: fileLocation,
                location: location
            }
        });
    }

    function validateOntopPropertiesConnection(repositoryInfo) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/ontop/test-connection`, repositoryInfo.params.propertiesFile, {
            params: {
                location: repositoryInfo.location
            }
        });
    }

    function getSupportedDriversData(repositoryInfo) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/ontop/drivers`, {
            params: {
                location: repositoryInfo.location
            }
        });
    }

    function updatePropertiesFile(fileLocation, content, location, driverType) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/ontop/jdbc-properties`,
            JSON.stringify(content),
            {
                params: {
                    fileLocation,
                    location,
                    driverType
                }
            });
    }

    function loadPropertiesFile(fileLocation, location, driverType) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/ontop/jdbc-properties`, {
            params: {
                fileLocation,
                location,
                driverType
            }
        });
    }

    function getRepositoryTurtleConfig(repository) {
        return $http.get('rest/repositories/' + repository.id, {
            headers: {
                'Accept': 'text/turtle'
            }
        });
    }
}
