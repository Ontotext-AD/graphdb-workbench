import {mapAclRulesResponse} from "./mappers/aclmanagement-mapper";

angular
    .module('graphdb.framework.rest.aclmanagement.service', [])
    .factory('AclManagementRestService', AclManagementRestService);

AclManagementRestService.$inject = ['$http'];

const REPOSITORIES_ENDPOINT = 'rest/repositories';

function AclManagementRestService($http) {
    return {
        getRules,
        updateRules
    };

    function getRules(repositoryId) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/acl`);
    }

    function updateRules(repositoryId, config) {
        return $http.put(`${REPOSITORIES_ENDPOINT}/${repositoryId}/acl`, config);
    }
}
