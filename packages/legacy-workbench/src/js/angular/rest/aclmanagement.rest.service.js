angular
    .module('graphdb.framework.rest.aclmanagement.service', [])
    .factory('AclManagementRestService', AclManagementRestService);

AclManagementRestService.$inject = ['$http'];

const REPOSITORIES_ENDPOINT = 'rest/repositories';

function AclManagementRestService($http) {
    return {
        getAcl,
        updateAcl
    };

    /**
     * Fetches the ACL defined for given repository.
     * @param {string} repositoryId The repository id for which the ACL to be fetched.
     * @return {*}
     */
    function getAcl(repositoryId) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/acl`);
    }

    /**
     * Updates the ACL for provided repository by replacing the whole list with the provided one.
     * @param {string} repositoryId The repository id for which the ACL to be updated.
     * @param {string[]} data The ACListModel serialized to JSON.
     * @return {*}
     */
    function updateAcl(repositoryId, data) {
        return $http.put(`${REPOSITORIES_ENDPOINT}/${repositoryId}/acl`, data);
    }
}
