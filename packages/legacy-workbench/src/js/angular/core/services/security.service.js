import 'angular/rest/security.rest.service';

const modules = ['graphdb.framework.rest.security.service'];

/**
 * @ngdoc service
 * @name SecurityService
 * @description
 * Provides methods to interact with the security backend, including user management,
 * authentication, and security configuration.
 */
angular
    .module('graphdb.framework.core.services.security-service', modules)
    .factory('SecurityService', SecurityService);

SecurityService.$inject = ['SecurityRestService'];

/**
 * @ngdoc function
 * @name SecurityService
 * @param {Object} SecurityRestService The REST service for security operations.
 * @returns {Promise<{data: UserModel, status: number, headers: function}>} A promise resolving to an object with `data`, `status`, and `headers`.
 */
function SecurityService(SecurityRestService) {
    /**
     * Retrieves the security configuration from the backend.
     *
     * @return {Promise<Object>} A promise that resolves to the security configuration data.
     */
    const getSecurityConfig = () => {
        return SecurityRestService.getSecurityConfig();
    };

    /**
     * Toggles security in the backend.
     *
     * @param {boolean} enable Flag indicating whether to enable or disable security.
     * @return {Promise<Object>} A promise that resolves when the security setting is toggled.
     */
    const toggleSecurity = (enable) => {
        return SecurityRestService.toggleSecurity(enable);
    };

    /**
     * Retrieves the roles from the backend.
     *
     * @return {Promise<Object>} A promise that resolves to the roles data.
     */
    const getRoles = () => {
        return SecurityRestService.getRoles();
    };

    /**
     * Retrieves the roles mapping from the backend.
     *
     * @param {Object} params Parameters to filter or adjust the roles mapping.
     * @return {Promise<Object>} A promise that resolves to the roles mapping data.
     */
    const getRolesMapping = (params) => {
        return SecurityRestService.getRolesMapping(params);
    };

    return {
        getSecurityConfig,
        toggleSecurity,
        getRoles,
        getRolesMapping,
    };
}
