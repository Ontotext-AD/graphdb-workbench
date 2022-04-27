angular
    .module('graphdb.framework.rest.security.service', [])
    .factory('SecurityRestService', SecurityRestService);

SecurityRestService.$inject = ['$http'];

const SECURITY_ENDPOINT = 'rest/security';
const SECURITY_USER_ENDPOINT = `${SECURITY_ENDPOINT}/user`;
const SECURITY_AUTHENTICATED_ENDPOINT = `${SECURITY_ENDPOINT}/authenticated-user`;
const SECURITY_FREE_ACCESS_ENDPOINT = `${SECURITY_ENDPOINT}/free-access`;
const ROLES_ENDPOINT = 'rest/roles';

function SecurityRestService($http) {
    return {
        getUser,
        getAdminUser,
        getUsers,
        createUser,
        updateUser,
        updateUserData,
        deleteUser,
        getFreeAccess,
        setFreeAccess,
        getSecurityConfig,
        toggleSecurity,
        getRoles,
        getRolesMapping,
        getAuthenticatedUser
    };

    function getUser(username) {
        return $http.get(`${SECURITY_USER_ENDPOINT}/${encodeURIComponent(username)}`);
    }

    function getAuthenticatedUser() {
        return $http.get(`${SECURITY_AUTHENTICATED_ENDPOINT}`);
    }

    function getAdminUser() {
        return $http.get(`${SECURITY_USER_ENDPOINT}/admin`);
    }

    function getUsers() {
        return $http.get(SECURITY_USER_ENDPOINT);
    }

    function createUser(data) {
        return $http({
            method: 'POST',
            url: `${SECURITY_USER_ENDPOINT}/${encodeURIComponent(data.username)}`,
            headers: {
                'X-GraphDB-Password': data.pass
            },
            data: {
                appSettings: data.appSettings,
                grantedAuthorities: data.grantedAuthorities
            }
        });
    }

    function updateUser(data) {
        return $http({
            method: 'PUT',
            url: `${SECURITY_USER_ENDPOINT}/${encodeURIComponent(data.username)}`,
            headers: {
                'X-GraphDB-Password': data.pass
            },
            data: {
                appSettings: data.appSettings,
                grantedAuthorities: data.grantedAuthorities
            }
        });
    }

    function updateUserData(data) {
        return $http({
            method: 'PATCH',
            url: `${SECURITY_USER_ENDPOINT}/${encodeURIComponent(data.username)}`,
            headers: {
                'X-GraphDB-Password': data.pass
            },
            data: {
                appSettings: data.appSettings
            }
        });
    }

    function deleteUser(username) {
        return $http.delete(`${SECURITY_USER_ENDPOINT}/${encodeURIComponent(username)}`);
    }

    function getFreeAccess() {
        return $http.get(SECURITY_FREE_ACCESS_ENDPOINT);
    }

    function setFreeAccess(data) {
        return $http.post(SECURITY_FREE_ACCESS_ENDPOINT, data);
    }

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
