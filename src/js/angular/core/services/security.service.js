import 'angular/rest/ttyg.rest.service';
import 'angular/rest/security.rest.service';

const modules = ['graphdb.framework.rest.security.service'];

angular
    .module('graphdb.framework.core.services.security-service', modules)
    .factory('SecurityService', SecurityService);

SecurityService.$inject = ['SecurityRestService'];

function SecurityService(SecurityRestService) {
    const getUser = (username) => {
        return SecurityRestService.getUser(username);
    }

    const getAuthenticatedUser = () => {
        return SecurityRestService.getAuthenticatedUser();
    }

    const getAdminUser = () => {
        return SecurityRestService.getAdminUser();
    }

    const getUsers = () => {
        return SecurityRestService.getUsers();
    }

    const createUser = (data) => {
        return SecurityRestService.createUser(data);
    }

    const updateUser = (data) => {
        return SecurityRestService.updateUser(data);
    }

    /**
     * Updates user data in the backend using the SecurityRestService.
     * @param {UpdateUserPayload} payload The payload to update the user data.
     * @return {Promise<*>}
     */
    const updateUserData = (payload) => {
        return SecurityRestService.updateUserData(payload);
    };

    const deleteUser = (username) => {
        return SecurityRestService.deleteUser(username);
    }

    const getFreeAccess = () => {
        return SecurityRestService.getFreeAccess();
    }

    const setFreeAccess = (data) => {
        return SecurityRestService.setFreeAccess(data);
    }

    const getSecurityConfig = () => {
        return SecurityRestService.getSecurityConfig();
    }

    const toggleSecurity = (enable) => {
        return SecurityRestService.toggleSecurity(enable);
    }

    const getRoles = () => {
        return SecurityRestService.getRoles();
    }

    const getRolesMapping = (params) => {
        return SecurityRestService.getRolesMapping(params);
    }

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
}
