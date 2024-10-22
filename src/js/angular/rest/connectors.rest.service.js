angular
    .module('graphdb.framework.rest.connectors.service', [])
    .factory('ConnectorsRestService', ConnectorsRestService);

ConnectorsRestService.$inject = ['$http'];

const CONNECTORS_ENDPOINT = 'rest/connectors';

function ConnectorsRestService($http) {

    return {
        getConnectors,
        initConnector,
        hasConnector,
        checkConnector
    };

    /**
     * Fetches all connectors for the repository with id <code>repositoryId</code> and location <code>repositoryLocation</code>.
     * If the repository ID and repository location are not provided, the values persisted in local storage will be used {@see authentication.interceptor.js}.
     *
     * @param {string | undefined} repositoryId - The repository id.
     * @param {string | undefined} repositoryLocation - The repository location.
     * @return {*} The similarity indexes for the specified repository.
     */
    function getConnectors(repositoryId, repositoryLocation) {
        if (repositoryId) {
            return $http.get(CONNECTORS_ENDPOINT, {
                headers: {
                    'X-GraphDB-Repository': repositoryId,
                    'X-GraphDB-Repository-Location': repositoryLocation
                }
            });
        }
        return $http.get(CONNECTORS_ENDPOINT);
    }

    function initConnector(prefix) {
        return $http.get(`${CONNECTORS_ENDPOINT}/options?prefix=${prefix}`);
    }

    /**
     * Fetches all connectors of a specific type defined by the prefix for the repository with id <code>repositoryId</code>
     * and location <code>repositoryLocation</code>. If the repository ID and repository location are not provided, the currently selected repository will be used.
     * @param {string} prefix
     * @param {string | undefined} repositoryId - The repository id.
     * @param {string | undefined} repositoryLocation - The repository location.
     * @return {Promise<ConnectorListModel>}
     */
    function hasConnector(prefix, repositoryId, repositoryLocation) {
        if (repositoryId) {
            return $http.get(`${CONNECTORS_ENDPOINT}/existing?prefix=${prefix}`, {
                headers: {
                    'X-GraphDB-Repository': repositoryId,
                    'X-GraphDB-Repository-Location': repositoryLocation
                }
            });
        }
        return $http.get(`${CONNECTORS_ENDPOINT}/existing?prefix=${prefix}`);
    }

    function checkConnector(data) {
        return $http.post(`${CONNECTORS_ENDPOINT}/check`, data, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    }
}
