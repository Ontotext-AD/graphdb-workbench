import 'angular/rest/security.rest.service';
import {fromUserModelMapper, toUserModelMapper} from "../../security/services/user-mapper";

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
    const login = (username, password) => {
        return SecurityRestService.login(username, password)
            .then(({data, status, headers}) => {
                return {
                    data: toUserModelMapper(data, 'authorities'),
                    status,
                    headers,
                };
            });
    };
    /**
     * Retrieves a user by username from the backend.
     * The full response is mapped to convert its data property to a UI model.
     *
     * @param {string} username The username of the user.
     * @return {Promise<UserModel>} A promise that resolves to the full response with a mapped user model.
     */
    const getUser = (username) => {
        return SecurityRestService.getUser(username)
            .then((response) => toUserModelMapper(response.data));
    };

    /**
     * Retrieves the authenticated user from the backend.
     * The full response is mapped so that the `data` property contains a UserModel.
     *
     * @return {Promise<UserModel>} A promise that resolves to the full response with the authenticated user.
     */
    const getAuthenticatedUser = () => {
        return SecurityRestService.getAuthenticatedUser()
            .then((response) => toUserModelMapper(response.data, 'authorities'));
    };

    /**
     * Retrieves the admin user from the backend.
     * The full response is mapped so that the `data` property contains a UserModel.
     *
     * @return {Promise<Object>} A promise that resolves to the full response with the admin user.
     */
    const getAdminUser = () => {
        return SecurityRestService.getAdminUser()
            .then((response) => toUserModelMapper(response.data));
    };

    /**
     * Retrieves all users from the backend.
     * The full response is mapped so that the `data` property contains an array of UserModel objects.
     *
     * @return {Promise<UserModel[]>} A promise that resolves to the full response with the list of users.
     */
    const getUsers = () => {
        return SecurityRestService.getUsers()
            .then((response) => toUserModelMapper(response.data));
    };

    /**
     * Creates a new user in the backend.
     * The provided data is mapped from the UI model to the backend model before sending.
     *
     * @param {Object} data The UI user model data to create.
     * @return {Promise<Object>} A promise that resolves when the user is created.
     */
    const createUser = (data) => {
        return SecurityRestService.createUser(fromUserModelMapper(data));
    };

    /**
     * Updates an existing user in the backend.
     * The provided UI model data is mapped to the backend format.
     *
     * @param {Object} data The UI user model data to update.
     * @return {Promise<Object>} A promise that resolves when the user is updated.
     */
    const updateUser = (data) => {
        return SecurityRestService.updateUser(fromUserModelMapper(data));
    };

    /**
     * Updates user settings data in the backend using the SecurityRestService.
     * @param {UpdateUserPayload} payload The payload to update the user data.
     * @return {Promise<*>}
     */
    const updateUserData = (payload) => {
        return SecurityRestService.updateUserData(payload);
    };

    /**
     * Deletes a user from the backend.
     *
     * @param {string} username The username of the user to delete.
     * @return {Promise<Object>} A promise that resolves when the user is deleted.
     */
    const deleteUser = (username) => {
        return SecurityRestService.deleteUser(username);
    };

    /**
     * Retrieves free access settings from the backend.
     *
     * @return {Promise<Object>} A promise that resolves to the free access data.
     */
    const getFreeAccess = () => {
        return SecurityRestService.getFreeAccess()
            .then((response) => toUserModelMapper(response.data, 'authorities'));
    };

    /**
     * Sets free access settings in the backend.
     *
     * @param {Object} data The free access data to set.
     * @return {Promise<Object>} A promise that resolves when the free access data is set.
     */
    const setFreeAccess = (data) => {
        return SecurityRestService.setFreeAccess(fromUserModelMapper(data, 'authorities'));
    };

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
        login,
        getUser,
        getAuthenticatedUser,
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
    };
}
