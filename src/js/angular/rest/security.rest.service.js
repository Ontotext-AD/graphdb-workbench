angular
    .module('graphdb.framework.rest.security.service', [])
    .factory('SecurityRestService', SecurityRestService);

SecurityRestService.$inject = ['$http'];

function SecurityRestService($http) {
    return {
        getUser,
        getAdminUser,
        getUsers,
        createUser,
        updateUser,
        updateUserData,
        deleteUser,
        toggleFreeAccess,
        setFreeAccess,
        getSecurityConfig,
        toggleSecurity
    };

    function getUser(username) {
        return $http.get('rest/security/user/' + encodeURIComponent(username));
    }

    function getAdminUser() {
        return $http.get('rest/security/user/admin');
    }

    function getUsers() {
        return $http.get('rest/security/user');
    }

    function createUser(data) {
        return $http({
            method: 'POST',
            url: 'rest/security/user/' + encodeURIComponent(data.username),
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
            url: 'rest/security/user/' + encodeURIComponent(data.username),
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
            url: 'rest/security/user/' + encodeURIComponent(data.username),
            headers: {
                'X-GraphDB-Password': data.pass
            },
            data: {
                appSettings: data.appSettings
            }
        });
    }

    function deleteUser(username) {
        return $http.delete('rest/security/user/' + encodeURIComponent(username));
    }

    function toggleFreeAccess() {
        return $http.get('rest/security/freeaccess');
    }

    function setFreeAccess(data) {
        return $http.post('rest/security/freeaccess', data);
    }

    function getSecurityConfig() {
        return $http.get('rest/security/all');
    }

    function toggleSecurity(enable) {
        return $http.post('rest/security', enable ? 'true' : 'false');
    }
}
