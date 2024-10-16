import 'angular/core/services';
import 'angular/core/services/openid-auth.service.js';
import 'angular/rest/security.rest.service';
import {UserRole} from 'angular/utils/user-utils';

const LOGIN_PATH = '/login';
const NO_ACCESS = 'noaccess';
const EXPIRED = 'expired';
const TOKEN_TYPE_BEARER = 'Bearer';
const OVERRIDE_AUTH_USERNAME = 'overrideauth';
const ADMIN_USERNAME = 'admin';
const READ_PERMISSION = 'READ';
const WRITE_PERMISSION = 'WRITE';
const TOKEN_TYPE_GDB = 'GDB';
const AUTH_FULLY = 'IS_AUTHENTICATED_FULLY';
const ROLE_SEPARATOR = '_';
const SYSTEM_REPO = 'SYSTEM';
const REPO_WILDCARD = '*';

angular.module('graphdb.framework.core.services.jwtauth', [
    'toastr',
    'graphdb.framework.rest.security.service',
    'graphdb.framework.core.services.openIDService'
])
    .service('$jwtAuth', ['$http', 'toastr', '$location', '$rootScope', 'SecurityRestService', '$openIDAuth', '$translate', '$q', 'AuthTokenService', 'LSKeys', 'LocalStorageAdapter',
        function ($http, toastr, $location, $rootScope, SecurityRestService, $openIDAuth, $translate, $q, AuthTokenService, LSKeys, LocalStorageAdapter) {

            // =========================
            // Public variables
            // =========================
            $rootScope.deniedPermissions = {};

            // =========================
            // Private variables
            // =========================
            let _securityEnabled = true;
            let _externalAuthUser = false;
            let _principal = undefined;
            let _freeAccessPrincipal = undefined;
            let _freeAccess = false;
            let _securityInitialized = false;
            let _hasOverrideAuth = false;
            let _externalAuth = undefined;
            let _authImplementation = undefined;
            let _openIDEnabled = false;
            let _passwordLoginEnabled = undefined;
            let _openIDConfig = undefined;
            let _gdbUrl = undefined;

            // =========================
            // RootScope functions
            // =========================

            /**
             * Sets a permission denied for a given path.
             * @param {string} path The path where the permission is denied.
             * @return {boolean} False if it's the login path or user isn't authenticated.
             */
            $rootScope.setPermissionDenied = (path) => {
                if (path === LOGIN_PATH || !isAuthenticated()) {
                    return false;
                }
                $rootScope.deniedPermissions[path] = true;
                return true;
            };

            /**
             * Checks if permission is granted for the current path.
             * @return {boolean} True if permission is granted.
             */
            $rootScope.hasPermission = () => {
                const path = $location.path();
                return !$rootScope.deniedPermissions[path];
            };

            /**
             * Redirects to the login page.
             * @param {boolean} expired If true a toast message about expired login will be shown.
             * @param {boolean} noaccess If true a toast message about no access/config error will be shown.
             * @return {Promise<unknown>}
             */
            $rootScope.redirectToLogin = (expired, noaccess) => {
                if (_authTokenIsType(TOKEN_TYPE_BEARER)) {
                    // OpenID login may be detected as expired either on initial validation
                    // when we get expired = true or indirectly via 401, setting expired = true
                    // handles the second case.
                    expired = true;
                }
                _clearAuthenticationInternal();
                // remember where we were so we can return there
                updateReturnUrl();

                $location.path(LOGIN_PATH);
                if (noaccess) {
                    $location.search(NO_ACCESS);
                } else if (expired) {
                    $location.search(EXPIRED);
                }
                // Countering race condition. When the unauthorized interceptor catches error 401 or 409, then we must make
                // sure that a request is made to access the login page before proceeding with the rejection of the
                // original request. Otherwise the login page is not accessible in the context of spring security.
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(true);
                    }, 100);
                });
            };

            /**
             * Returns whether the current user has external authentication.
             * @return {boolean} True if the user is authenticated via an external system.
             */
            $rootScope.hasExternalAuthUser = () => hasExternalAuthUser();

            // =========================
            // Public functions
            // =========================
            /**
             * Checks if the current user is authenticated.
             * @return {boolean} True if the user is authenticated.
             */
            const isAuthenticated = () => !_securityEnabled || _hasExplicitAuthentication();

            const _hasExplicitAuthentication = () => {
                const token = AuthTokenService.getAuthToken();
                return token != null || _externalAuthUser;
            };

            const _authTokenIsType = (type) => {
                const token = AuthTokenService.getAuthToken();
                return token && token.startsWith(type);
            };

            const _clearAuthenticationInternal = () => {
                $openIDAuth.softLogout();
                _principal = _freeAccessPrincipal;
                AuthTokenService.clearAuthToken();
            };

            const updateReturnUrl = () => {
                if ($location.url().indexOf(LOGIN_PATH) !== 0) {
                    $rootScope.returnToUrl = $location.url();
                }
            };

            /**
             * Returns whether the current user has external authentication.
             * @return {boolean} True if the user is authenticated via an external system.
             */
            const hasExternalAuthUser = () => _externalAuthUser;

            /**
             * Initializes security by retrieving the security configuration and authenticating the user.
             */
            const _initSecurity = () => {
                _securityInitialized = false;

                SecurityRestService.getSecurityConfig().then((res) => {
                    _securityEnabled = res.data.enabled;
                    _externalAuth = res.data.hasExternalAuth;
                    _authImplementation = res.data.authImplementation;
                    _openIDEnabled = res.data.openIdEnabled;
                    _passwordLoginEnabled = res.data.passwordLoginEnabled;

                    if (_securityEnabled) {
                        const freeAccessData = res.data.freeAccess;
                        _freeAccess = freeAccessData.enabled;
                        if (_freeAccess) {
                            _freeAccessPrincipal = {
                                authorities: freeAccessData.authorities,
                                appSettings: freeAccessData.appSettings
                            };
                        }
                        if (_openIDEnabled) {
                            _openIDConfig = res.data.methodSettings.openid;
                            // Remove the parameters from the url
                            _gdbUrl = $location.absUrl().replace($location.url().substr(1), '');
                            $openIDAuth.initOpenId(_openIDConfig, _gdbUrl, (justLoggedIn) => {
                                // A valid OpenID was obtained just now or previously,
                                // so we set it as the authentication.
                                // This function will be called every time the token is refreshed too,
                                // so keep it clean of other logic.
                                // The variable justLoggedIn will be set to true if this is
                                // a new login that just happened.
                                AuthTokenService.setAuthToken($openIDAuth.authHeaderGraphDB());
                                console.log('oidc: set id/access token as GraphDB auth');
                                // When logging via OpenID we may get a token that doesn't have
                                // rights in GraphDB, this should be considered invalid.
                                _getAuthenticatedUserFromBackend(true, justLoggedIn);
                            }, () => {
                                if (_authTokenIsType(TOKEN_TYPE_BEARER)) {
                                    // Possibly previous login with OpenID but token is no longer valid,
                                    // redirect to login and warn user about expired token.
                                    setTimeout(() => $rootScope.redirectToLogin(true), 0);
                                } else {
                                    // Logged in via non-OpenID or not logged in at all
                                    _getAuthenticatedUserFromBackend();
                                }
                            });
                        } else {
                            _getAuthenticatedUserFromBackend();
                        }
                    } else {
                        AuthTokenService.clearAuthToken();
                        const overrideAuthData = res.data.overrideAuth;
                        _hasOverrideAuth = overrideAuthData.enabled;
                        if (_hasOverrideAuth) {
                            _principal = {
                                username: OVERRIDE_AUTH_USERNAME,
                                authorities: overrideAuthData.authorities,
                                appSettings: overrideAuthData.appSettings
                            };
                            $rootScope.$broadcast('securityInit', _securityEnabled, true, _hasOverrideAuth);
                        } else {
                            return SecurityRestService.getAdminUser().then((res) => {
                                _principal = {
                                    username: ADMIN_USERNAME,
                                    appSettings: res.data.appSettings,
                                    authorities: res.data.grantedAuthorities
                                };
                                $rootScope.$broadcast('securityInit', _securityEnabled, true, _hasOverrideAuth);
                            });
                        }
                    }
                });
            };

            /**
             * Determines the currently authenticated user from the backend's point-of-view
             * by sending a request to the dedicated API endpoint using the current authentication
             * header. If GraphDB cannot recognize the authentication, this method will fallback
             * to free access (if enabled) or redirect to the login page. It will emit 'securityInit'.
             *
             * @param {boolean} noFreeAccessFallback If true does not fallback to free access.
             * @param {boolean} justLoggedIn Indicates that the user just logged in.
             */
            const _getAuthenticatedUserFromBackend = (noFreeAccessFallback, justLoggedIn) => {
                SecurityRestService.getAuthenticatedUser()
                    .then((response) => {
                        const data = response.data;
                        const token = AuthTokenService.getAuthToken();

                        if (token && token.startsWith(TOKEN_TYPE_GDB)) {
                            // There is a previous authentication via JWT, it's still valid
                            // so refresh the principal
                            _externalAuthUser = false;
                            _principal = data;
                            $rootScope.$broadcast('securityInit', _securityEnabled, true, _freeAccess);
                        } else if (_openIDEnabled && token && token.startsWith(TOKEN_TYPE_BEARER)) {
                            // The auth was obtained from OpenID, we need to authenticate with the returned user
                            return authenticate(data, token);
                        } else {
                            // There is no previous authentication, but we got a principal via
                            // an external authentication mechanism (e.g. Kerberos)
                            _externalAuthUser = true;
                            return authenticate(data, '');
                        }
                    })
                    .catch(() => {
                        if (noFreeAccessFallback || !_freeAccess) {
                            $rootScope.redirectToLogin(false, justLoggedIn);
                        } else {
                            _securityInitialized = true;
                            if (!_hasExplicitAuthentication()) {
                                clearAuthentication();
                            }
                        }
                    });
            };

            /**
             * Authenticates the user with the provided data and authentication header value.
             *
             * This method sets the authentication token if provided, clears it if not, and then sets
             * the user's principal data. It also checks if the current repository is readable by the
             * user, removing the repository from local storage if not. The method broadcasts the
             * 'securityInit' event with the updated security state and resolves the promise once complete.
             *
             * @param {object} data - The authenticated user's data.
             * @param {string} authHeaderValue - The authentication token to be set (e.g., JWT or Bearer token).
             * @return {Promise<boolean>} A promise that resolves to true when authentication is complete.
             */
            const authenticate = (data, authHeaderValue) => {
                return new Promise((resolve) => {
                    if (authHeaderValue) {
                        AuthTokenService.setAuthToken(authHeaderValue);
                        _externalAuthUser = false;
                    } else {
                        AuthTokenService.clearAuthToken();
                    }

                    _principal = data;
                    $rootScope.deniedPermissions = {};
                    _securityInitialized = true;

                    const selectedRepo = {
                        id: LocalStorageAdapter.get(LSKeys.REPOSITORY_ID) || '',
                        location: LocalStorageAdapter.get(LSKeys.REPOSITORY_LOCATION) || ''
                    };

                    if (!canReadRepo(selectedRepo)) {
                        // if the current repo is unreadable by the currently logged-in user (or free access user)
                        // we unset the repository
                        LocalStorageAdapter.remove(LSKeys.REPOSITORY_ID);
                        LocalStorageAdapter.remove(LSKeys.REPOSITORY_LOCATION);
                        // reset denied permissions (different repo, different rights)
                        $rootScope.deniedPermissions = {};
                    }

                    $rootScope.$broadcast('securityInit', _securityEnabled, _hasExplicitAuthentication(), _freeAccess);
                    setTimeout(() => resolve(true));
                });
            };

            const clearAuthentication = () => {
                _clearAuthenticationInternal();
                $rootScope.$broadcast('securityInit', _securityEnabled, false, _freeAccess);
            };

            /**
             * Checks whether the user has permission to write to the repository.
             * @param {string} menuRole The menu role to check.
             * @param {object} repo The repository object to check.
             * @return {boolean} True if the user has write permission.
             */
            const checkForWrite = (menuRole, repo) => {
                if (menuRole === WRITE_PERMISSION) {
                    return canWriteRepo(repo);
                }
                return hasRole(menuRole);
            };

            /**
             * Checks if the user has write permissions to a repository.
             * @param {object} repo The repository object to check.
             * @return {boolean} True if the user has write permissions.
             */
            const canWriteRepo = (repo) => {
                if (!repo) {
                    return false;
                }
                // Adding remote secured location could be done only with admin credentials,
                // that's why we do no check for rights
                if (_securityEnabled || _hasOverrideAuth) {
                    if (_.isEmpty(_principal)) {
                        return false;
                    } else if (hasAdminRole()) {
                        return true;
                    }
                    return _checkRights(repo, WRITE_PERMISSION);
                } else {
                    return true;
                }
            };

            const canReadRepo = (repo) => {
                if (!repo) {
                    return false;
                }
                // Adding remote secured location could be done only with admin credentials,
                // that's why we do no check for rights
                if (_securityEnabled) {
                    if (_.isEmpty(_principal)) {
                        return false;
                    } else if (hasAdminRole()) {
                        return true;
                    }
                    return _checkRights(repo, READ_PERMISSION);
                } else {
                    return true;
                }
            };

            const hasAdminRole = () => isAdmin() || _isRepoManager();

            const isAdmin = () => hasRole(UserRole.ROLE_ADMIN);

            const _isRepoManager = () => hasRole(UserRole.ROLE_REPO_MANAGER);

            const hasRole = (role) => {
                if (role && (_securityEnabled || _hasOverrideAuth)) {
                    if (typeof role === 'string') {
                        role = [role];
                    }
                    if (!_.isEmpty(_principal)) {
                        if (role[0] === AUTH_FULLY) {
                            return true;
                        }
                        return _.intersection(role, _principal.authorities).length > 0;
                    }
                }
                return true;
            };

            const _checkRights = (repo, action) => {
                if (repo && _principal) {
                    for (let i = 0; i < _principal.authorities.length; i++) {
                        const authRole = _principal.authorities[i];
                        const parts = authRole.split(ROLE_SEPARATOR, 2);
                        const repoPart = authRole.slice(parts[0].length + parts[1].length + 2);
                        const repoId = repo.location ? `${repo.id}@${repo.location}` : repo.id;
                        if (parts[0] === action && (repoId === repoPart || repo.id !== SYSTEM_REPO && repoPart === REPO_WILDCARD)) {
                            return true;
                        }
                    }
                }
                return false;
            };

            /**
             * Reinitializes security, calling security initialization if it hasn't been completed yet.
             */
            const reinitializeSecurity = () => {
                if (!_securityInitialized) {
                    _initSecurity();
                }
            };

            const isSecurityEnabled = () => _securityEnabled;

            const hasExternalAuth = () => _externalAuth;

            const getAuthImplementation = () => _authImplementation;

            const isFreeAccessEnabled = () => _freeAccess;

            const isDefaultAuthEnabled = () => _hasOverrideAuth && _principal && _principal.username === OVERRIDE_AUTH_USERNAME;

            const loginOpenID = () => {
                // FIX: This causes the workbench to always return to this.gdbUrl after login, which breaks the logic for multitab login
                $openIDAuth.login(_openIDConfig, _gdbUrl);
            };

            /**
             * Toggles security on or off.
             * @param {boolean} enabled Whether security should be enabled.
             */
            const toggleSecurity = (enabled) => {
                if (enabled !== _securityEnabled) {
                    SecurityRestService.toggleSecurity(enabled).then(() => {
                        toastr.success($translate.instant('jwt.auth.security.status', {status: $translate.instant(enabled ? 'enabled.status' : 'disabled.status')}));
                        AuthTokenService.clearAuthToken();
                        _initSecurity();
                        _securityEnabled = enabled;
                    }).catch((err) => {
                        toastr.error(err.data, $translate.instant('common.error'));
                    });
                }
            };

            /**
             * Toggles free access on or off.
             * @param {boolean} enabled Whether free access should be enabled.
             * @param {Array} authorities The authorities to assign for free access.
             * @param {object} appSettings The application settings for free access.
             * @param {boolean} updateFreeAccess Whether free access should be updated.
             */
            const toggleFreeAccess = (enabled, authorities, appSettings, updateFreeAccess) => {
                if (enabled !== _freeAccess || updateFreeAccess) {
                    _freeAccess = enabled;
                    _freeAccessPrincipal = enabled ? {authorities, appSettings} : undefined;
                    SecurityRestService.setFreeAccess({
                        enabled: enabled ? 'true' : 'false',
                        authorities,
                        appSettings
                    }).then(() => {
                        toastr.success($translate.instant('jwt.auth.free.access.status', {status: $translate.instant(enabled ? 'enabled.status' : 'disabled.status')}));
                    }).catch((err) => {
                        toastr.error(err.data.error.message, $translate.instant('common.error'));
                    });
                    $rootScope.$broadcast('securityInit', _securityEnabled, _hasExplicitAuthentication(), _freeAccess);
                }
            };

            /**
             * Returns a promise of the principal object if already fetched or a promise which resolves after security initialization
             * @return {Promise<object>} A promise that resolves with the principal object.
             */
            const getPrincipal = () => {
                if (_principal) {
                    return Promise.resolve(_principal);
                }
                const deferred = $q.defer();
                $rootScope.$on('securityInit', () => {
                    deferred.resolve(_principal);
                });
                return deferred.promise;
            };

            const isSecurityInitialized = () => _securityInitialized;

            const isOpenIDEnabled = () => _openIDEnabled;

            const isPasswordLoginEnabled = () => _passwordLoginEnabled;

            /**
             * Updates the user data on the backend.
             * @param {object} data The user data to be updated.
             * @return {Promise<object>} A promise that resolves after the update is completed.
             */
            const updateUserData = (data) => SecurityRestService.updateUserData(data);

            // =========================
            // Initialization
            // =========================
            _initSecurity();

            return {
                isAuthenticated,
                updateReturnUrl,
                hasExternalAuthUser,
                authenticate,
                clearAuthentication,
                canReadRepo,
                hasAdminRole,
                isAdmin,
                hasRole,
                reinitializeSecurity,
                isSecurityEnabled,
                hasExternalAuth,
                getAuthImplementation,
                isFreeAccessEnabled,
                isDefaultAuthEnabled,
                loginOpenID,
                toggleSecurity,
                toggleFreeAccess,
                getPrincipal,
                checkForWrite,
                canWriteRepo,
                isSecurityInitialized,
                isOpenIDEnabled,
                isPasswordLoginEnabled,
                updateUserData
            };
        }]);
