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
        getRepositoryTurtleConfig,
    };

    function getRepository(repoInfo) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repoInfo.id}`, {
            params: {
                location: repoInfo.location,
            },
        });
    }

    function getRepositoryModel(repoInfo) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repoInfo.id}`, {
            params: {
                location: repoInfo.location,
            },
        }).then((response) => {
            return repositoryConfigMapper(response.data);
        });
    }

    function getRepositories(location) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/all`, {
            params: {
                location: location,
            },
            // Added so that location changes would not cancel the request
            noCancelOnRouteChange: true,
        });
    }

    function getRepositoriesFromKnownLocation(location) {
        return $http.get(`${REPOSITORIES_ENDPOINT}?location=${location}`);
    }

    function deleteRepository(repo) {
        return $http.delete(`${REPOSITORIES_ENDPOINT}/${repo.id}`, {
            params: {
                location: repo.location,
            },
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
                location: repo.location,
            },
        });
    }

    function getRepositoryConfiguration(repositoryType) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/default-config/${repositoryType}`);
    }

    function getSize(repository) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repository.id}/size`, {
            params: {
                location: repository.location,
            },
        });
    }

    function getPrefix(repositoryId, params) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/${repositoryId}/prefix`, null, {params});
    }

    function getCluster() {
        return $http.get(`${REPOSITORIES_ENDPOINT}/cluster`);
    }

    /**
     * Retrieves the content of a repository file.
     *
     * @param {string} file The location of the repository file.
     * @param {RepositoryReference|undefined} repositoryReference The repository reference, if available.
     * @returns {Promise<*>} A promise that resolves with the repository file content.
     */
    function getRepositoryFileContent(file, repositoryReference) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/file`, {
            params: {
                fileLocation: file,
                repositoryID: repositoryReference?.id,
                location: repositoryReference?.location,
            }});
    }

    /**
     * Updates the content of a repository file at the specified location.
     *
     * @param {string} fileLocation The location of the repository file.
     * @param {string} content The updated file content.
     * @param {RepositoryReference|undefined} repositoryReference The repository reference, if available.
     * @returns {Promise<*>} A promise that resolves when the repository file has been updated.
     */
    function updateRepositoryFileContent(fileLocation, content, repositoryReference) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/file/update`, JSON.stringify(content), {
            params: {
                fileLocation: fileLocation,
                repositoryID: repositoryReference?.id,
                location: repositoryReference?.location,
            },
        });
    }

    function validateOntopPropertiesConnection(repositoryInfo) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/ontop/test-connection`, repositoryInfo.params.propertiesFile, {
            params: {
                location: repositoryInfo.location,
            },
        });
    }

    function getSupportedDriversData(repositoryInfo) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/ontop/drivers`, {
            params: {
                location: repositoryInfo.location,
            },
        });
    }

    /**
     * Updates the Ontop properties file at the specified location.
     *
     * @param {string} fileLocation The location of the properties file.
     * @param {*} content The updated JDBC connection properties.
     * @param {RepositoryReference|undefined} repositoryReference The repository reference, if available.
     * @param {string} driverType The database driver type.
     * @returns {Promise<*>} A promise that resolves when the properties file has been updated.
     */
    function updatePropertiesFile(fileLocation, content, repositoryReference, driverType) {
        return $http.post(`${REPOSITORIES_ENDPOINT}/ontop/jdbc-properties`,
            JSON.stringify(content),
            {
                params: {
                    fileLocation,
                    repositoryID: repositoryReference?.id,
                    location: repositoryReference?.location,
                    driverType,
                },
            });
    }

    /**
     * Loads the Ontop properties from the specified file.
     *
     * @param {string} fileLocation The location of the properties file.
     * @param {RepositoryReference|undefined} repositoryReference The repository reference, if available.
     * @param {string} driverType The database driver type.
     * @returns {*} The Ontop properties, such as the driver class and hostname.
     */
    function loadPropertiesFile(fileLocation, repositoryReference, driverType) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/ontop/jdbc-properties`, {
            params: {
                fileLocation,
                repositoryID: repositoryReference?.id,
                location: repositoryReference?.location,
                driverType,
            },
        });
    }

    function getRepositoryTurtleConfig(repository) {
        return $http.get('rest/repositories/' + repository.id, {
            headers: {
                'Accept': 'text/turtle;version=1.2',
            },
        });
    }
}
