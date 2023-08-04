angular
    .module('graphdb.framework.rest.repositories.service', [])
    .factory('RepositoriesRestService', RepositoriesRestService);

RepositoriesRestService.$inject = ['$http'];

const REPOSITORIES_ENDPOINT = 'rest/repositories';

function RepositoriesRestService($http) {
    return {
        downloadAs,
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

    /**
     * Downloads sparql results as a file in given format provided by the accept header parameter.
     * @param {Repository} repoInfo
     * @param {*} data
     * @param {string} acceptHeader
     * @return {Promise<any>}
     */
    function downloadAs(repoInfo, data, acceptHeader) {
        const properties = Object.entries(data)
            .filter(([property, value]) => value !== undefined)
            .map(([property, value]) => `${property}=${value}`);
        const payloadString = properties.join('&');
        return $http({
            method: 'POST',
            url: `/repositories/${repoInfo.id}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Accept': acceptHeader
            },
            data: payloadString,
            responseType: "blob"
        }).then(function (res) {
            const data = res.data;
            const headers = res.headers();
            const contentDisposition = headers['content-disposition'];
            let filename = contentDisposition.split('filename=')[1];
            filename = filename.substring(0, filename.length);
            return {data, filename};
        });
    }

    function getRepository(repoInfo) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repoInfo.id}`, {
            params: {
                location: repoInfo.location
            }
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
        return $http.post(`${REPOSITORIES_ENDPOINT}/${repositoryId}/prefix`, null, {params});
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
}
