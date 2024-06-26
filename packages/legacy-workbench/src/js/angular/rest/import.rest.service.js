angular
    .module('graphdb.framework.rest.import.service', [])
    .factory('ImportRestService', ImportRestService);

ImportRestService.$inject = ['$http'];

const BASE_ENDPOINT = 'rest/repositories';

function ImportRestService($http) {
    return {
        getDefaultSettings,
        getUploadedFiles,
        getServerFiles,
        importServerFiles,
        importTextSnippet,
        updateTextSnippet,
        importFromUrl,
        updateFromUrl,
        stopImport,
        resetServerFileStatus,
        resetUserDataStatus
    };

    /**
     * Fetches the list of uploaded files.
     * @param {string} repositoryId - The repository id
     * @return {*}
     */
    function getUploadedFiles(repositoryId) {
        return $http.get(`${BASE_ENDPOINT}/${repositoryId}/import/upload`);
    }

    /**
     * Fetches the list of server files available in the mounted folder.
     * @param {string} repositoryId - The repository id
     * @return {*}
     */
    function getServerFiles(repositoryId) {
        return $http.get(`${BASE_ENDPOINT}/${repositoryId}/import/server`);
    }

    /**
     * Imports the data from the server files.
     * @param {string} repositoryId - The repository id
     * @param {object} data - The settings data to be sent to the server
     * @return {*}
     */
    function importServerFiles(repositoryId, data) {
        return $http.post(`${BASE_ENDPOINT}/${repositoryId}/import/server`, data);
    }

    /**
     * Imports the data from the given text snippet.
     * @param {string} repositoryId - The repository id
     * @param {string} data - The text snippet to be imported
     * @return {*}
     */
    function importTextSnippet(repositoryId, data) {
        return $http.post(`${BASE_ENDPOINT}/${repositoryId}/import/upload/text`, data);
    }

    /**
     * Updates the data from the given text snippet.
     * @param {string} repositoryId - The repository id
     * @param {string} data - The text snippet to be updated
     * @return {*}
     */
    function updateTextSnippet(repositoryId, data) {
        return $http.post(`${BASE_ENDPOINT}/${repositoryId}/import/upload/update/text`, data);
    }

    /**
     * Imports the data from the given URL.
     * @param {string} repositoryId - The repository id
     * @param {object} data - The settings data to be sent to the server
     * @return {*}
     */
    function importFromUrl(repositoryId, data) {
        return $http.post(`${BASE_ENDPOINT}/${repositoryId}/import/upload/url`, data);
    }

    /**
     * Updates the data from the given URL.
     * @param {string} repositoryId - The repository id
     * @param {object} data - The settings data to be sent to the server
     * @return {*}
     */
    function updateFromUrl(repositoryId, data) {
        return $http.post(`${BASE_ENDPOINT}/${repositoryId}/import/upload/update/url`, data);
    }

    /**
     * Stops the import process.
     * @param {string} repositoryId - The repository id
     * @param {{name: string, type: string}} params - The parameters to be sent to the server
     * @return {*}
     */
    function stopImport(repositoryId, params) {
        return $http.delete(`${BASE_ENDPOINT}/${repositoryId}/import/upload`, {params});
    }

    /**
     * Resets server files status.
     * @param {string} repositoryId - The repository id
     * @param {object} data - The settings data to be sent to the server
     * @param {boolean} remove - Remove the files from the server
     * @return {*}
     */
    function resetServerFileStatus(repositoryId, data, remove = true) {
        return $http({
            method: 'DELETE',
            url: `${BASE_ENDPOINT}/${repositoryId}/import/server/status`,
            params: {remove: remove},
            data,
            headers: {'Content-type': 'application/json;charset=utf-8'}
        });
    }

    /**
     * Resets user data status.
     * @param {string} repositoryId - The repository id
     * @param {object} data - The settings data to be sent to the server
     * @param {boolean} remove - Remove the files from the server
     * @return {*}
     */
    function resetUserDataStatus(repositoryId, data, remove = true) {
        return $http({
            method: 'DELETE',
            url: `${BASE_ENDPOINT}/${repositoryId}/import/upload/status`,
            params: {remove: remove},
            data,
            headers: {'Content-type': 'application/json;charset=utf-8'}
        });
    }

    /**
     * Fetches the default settings for the import process.
     * @param {string} repositoryId - The repository id
     * @return {*}
     */
    function getDefaultSettings(repositoryId) {
        return $http.get(`${BASE_ENDPOINT}/${repositoryId}/import/settings/default`);
    }
}
