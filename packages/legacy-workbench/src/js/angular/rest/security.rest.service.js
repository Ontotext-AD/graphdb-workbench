angular
    .module('graphdb.framework.rest.security.service', [])
    .factory('SecurityRestService', SecurityRestService);

SecurityRestService.$inject = ['$http'];

const SECURITY_ENDPOINT = 'rest/security';
const ROLES_ENDPOINT = 'rest/roles';

function SecurityRestService($http) {
    return {
        getSecurityConfig,
        toggleSecurity,
        getRoles,
        getRolesMapping,
    };
    function getSecurityConfig() {
        return $http.get(`${SECURITY_ENDPOINT}/all`);
    }

    function toggleSecurity(enable) {
        return $http.post(SECURITY_ENDPOINT, enable ? 'true' : 'false');
    }

    function getRoles() {
        return $http.get(ROLES_ENDPOINT);
    }

    function getRolesMapping(params) {
        return $http.get(`${ROLES_ENDPOINT}/mapping`, {params});
    }
}
