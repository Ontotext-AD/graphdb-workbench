import 'angular/core/services';
import 'angular/core/services/openid-auth.service.js';
import 'angular/rest/security.rest.service';
import {UserRole} from 'angular/utils/user-utils';

angular.module('graphdb.framework.core.services.jwtauth', [
    'toastr',
    'graphdb.framework.rest.security.service',
    'graphdb.framework.core.services.openIDService'
])
    .service('$jwtAuth', ['$http', 'toastr', '$location', '$rootScope', 'SecurityRestService', '$openIDAuth', '$translate', '$q', 'AuthTokenService', 'LSKeys', 'LocalStorageAdapter',
        function ($http, toastr, $location, $rootScope, SecurityRestService, $openIDAuth, $translate, $q, AuthTokenService, LSKeys, LocalStorageAdapter) {
            const jwtAuth = this;

            $rootScope.deniedPermissions = {};
            $rootScope.setPermissionDenied = function (path) {
                if (path === '/login' || !jwtAuth.isAuthenticated()) {
                    return false;
                }
                $rootScope.deniedPermissions[path] = true;
                return true;
            };
            $rootScope.hasPermission = function () {
                const path = $location.path();
                return !$rootScope.deniedPermissions[path];
            };

            this.updateReturnUrl = () => {
                if ($location.url().indexOf('/login') !== 0) {
                    $rootScope.returnToUrl = $location.url();
                }
            };

            /**
             * Redirects to the login page.
             *
             * @param {boolean} expired If true a toast message about expired login will be shown.
             *                          In some cases this will be autodetected.
             * @param {boolean} noaccess If true a toast message about no access/config error will be shown.
             *                           This overrides 'expired'.
             * @return {Promise<unknown>}
             */
            $rootScope.redirectToLogin = function (expired, noaccess) {
                if (jwtAuth.authTokenIsType('Bearer')) {
                    // OpenID login may be detected as expired either on initial validation
                    // when we get expired = true or indirectly via 401, setting expired = true
                    // handles the second case.
                    expired = true;
                }
                jwtAuth.clearAuthenticationInternal();
                // remember where we were so we can return there
                jwtAuth.updateReturnUrl();

                $location.path('/login');
                if (noaccess) {
                    $location.search('noaccess');
                } else if (expired) {
                    $location.search('expired');
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
            $rootScope.hasExternalAuthUser = function () {
                return jwtAuth.hasExternalAuthUser();
            };

            this.securityEnabled = true;
            this.freeAccess = false;
            this.hasOverrideAuth = false;
            this.externalAuthUser = false;
            this.securityInitialized = false;

            const that = this;

            /**
             * Determines the currently authenticated user from the backend's point-of-view
             * by sending a request to the dedicated API endpoint using the current authentication
             * header. If GraphDB cannot recognize the authentication, this method will fallback
             * to free access (if enabled) or redirect to the login page. It will emit 'securityInit'.
             *
             * @param {boolean} noFreeAccessFallback If true does not fallback to free access.
             * @param {boolean} justLoggedIn Indicates that the user just logged in.
             */
            this.getAuthenticatedUserFromBackend = function(noFreeAccessFallback, justLoggedIn) {
                SecurityRestService.getAuthenticatedUser().
                success(function(data, status, headers) {
                    const token = AuthTokenService.getAuthToken();
                    if (token && token.startsWith('GDB')) {
                        // There is a previous authentication via JWT, it's still valid
                        // so refresh the principal
                        that.externalAuthUser = false;
                        that.principal = data;
                        $rootScope.$broadcast('securityInit', that.securityEnabled, true, that.freeAccess);
                        // console.log('previous JWT authentication ok');
                    } else if (that.openIDEnabled && token && token.startsWith('Bearer')) {
                        // The auth was obtained from OpenID, we need to authenticate with the returned user
                        that.authenticate(data, token);
                    } else {
                        // There is no previous authentication but we got a principal via
                        // an external authentication mechanism (e.g. Kerberos)
                        that.externalAuthUser = true;
                        that.authenticate(data, ''); // this will emit securityInit
                        // console.log('external authentication ok');
                    }
                }).error(function () {
                    if (noFreeAccessFallback || !that.freeAccess) {
                        $rootScope.redirectToLogin(false, justLoggedIn);
                    } else {
                        that.securityInitialized = true;
                        if (!that.hasExplicitAuthentication()) {
                            that.clearAuthentication();
                            // console.log('free access fallback');
                        }
                    }
                });
            };

            this.initSecurity = function () {
                this.securityInitialized = false;

                SecurityRestService.getSecurityConfig().then(function (res) {
                    that.securityEnabled = res.data.enabled;
                    that.externalAuth = res.data.hasExternalAuth;
                    that.authImplementation = res.data.authImplementation;
                    that.openIDEnabled = res.data.openIdEnabled;
                    that.passwordLoginEnabled = res.data.passwordLoginEnabled;

                    if (that.securityEnabled) {
                        const freeAccessData = res.data.freeAccess;
                        that.freeAccess = freeAccessData.enabled;
                        if (that.freeAccess) {
                            that.freeAccessPrincipal = {
                                authorities: freeAccessData.authorities,
                                appSettings: freeAccessData.appSettings
                            };
                        }
                        if (that.openIDEnabled) {
                            that.openIDConfig = res.data.methodSettings.openid;
                            // Remove the parameters from the url
                            that.gdbUrl = $location.absUrl().replace($location.url().substr(1), '');
                            $openIDAuth.initOpenId(that.openIDConfig,
                                that.gdbUrl,
                                function (justLoggedIn) {
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
                                    that.getAuthenticatedUserFromBackend(true, justLoggedIn);
                                }, function () {
                                    console.log('oidc: not logged or login error');
                                    if (that.authTokenIsType('Bearer')) {
                                        // Possibly previous login with OpenID but token is no longer valid,
                                        // redirect to login and warn user about expired token.
                                        setTimeout(() => {
                                            $rootScope.redirectToLogin(true);
                                        }, 0);
                                    } else {
                                        // Logged in via non-OpenID or not logged in at all
                                        that.getAuthenticatedUserFromBackend();
                                    }
                                });
                        } else {
                            that.getAuthenticatedUserFromBackend();
                        }
                    } else {
                        AuthTokenService.clearAuthToken();
                        const overrideAuthData = res.data.overrideAuth;
                        that.hasOverrideAuth = overrideAuthData.enabled;
                        if (that.hasOverrideAuth) {
                            that.principal = {
                                username: 'overrideauth',
                                authorities: overrideAuthData.authorities,
                                appSettings: overrideAuthData.appSettings
                            };
                            $rootScope.$broadcast('securityInit', that.securityEnabled, true, that.hasOverrideAuth);

                        } else {
                            return SecurityRestService.getAdminUser().then(function (res) {
                                that.principal = {username: 'admin', appSettings: res.data.appSettings, authorities: res.data.grantedAuthorities};
                                $rootScope.$broadcast('securityInit', that.securityEnabled, true, that.hasOverrideAuth);
                            });
                        }
                    }
                });
            };

            this.initSecurity();

            this.reinitializeSecurity = function () {
                if (!this.securityInitialized) {
                    this.initSecurity();
                }
            };

            this.isSecurityEnabled = function () {
                return this.securityEnabled;
            };

            this.hasExternalAuth = function () {
                return this.externalAuth;
            };

            this.getAuthImplementation = function () {
                return this.authImplementation;
            };

            this.isFreeAccessEnabled = function () {
                return this.freeAccess;
            };

            this.isDefaultAuthEnabled = function () {
                return this.hasOverrideAuth && this.principal && this.principal.username === 'overrideauth';
            };

            this.authTokenIsType = function (type) {
                const token = AuthTokenService.getAuthToken();
                return token && token.startsWith(type);
            };

            this.loginOpenID = function () {
                // FIX: This causes the workbench to always return to this.gdbUrl after login, which breaks the logic for multitab login
                $openIDAuth.login(this.openIDConfig, this.gdbUrl);
            };

            this.toggleSecurity = function (enabled) {
                if (enabled !== this.securityEnabled) {
                    return SecurityRestService.toggleSecurity(enabled).then(function () {
                        toastr.success($translate.instant('jwt.auth.security.status', {status: ($translate.instant(enabled ? 'enabled.status' : 'disabled.status'))}));
                        AuthTokenService.clearAuthToken();
                        that.initSecurity();
                        that.securityEnabled = enabled;
                    }, function (err) {
                        toastr.error(err.data, $translate.instant('common.error'));
                    });
                }
                return Promise.resolve();
            };

            this.toggleFreeAccess = function (enabled, authorities, appSettings, updateFreeAccess) {
                if (enabled !== this.freeAccess || updateFreeAccess) {
                    this.freeAccess = enabled;
                    if (enabled) {
                        this.freeAccessPrincipal = {authorities: authorities, appSettings: appSettings};
                    } else {
                        this.freeAccessPrincipal = undefined;
                    }
                    SecurityRestService.setFreeAccess({
                        enabled: enabled ? 'true' : 'false',
                        authorities: authorities,
                        appSettings: appSettings
                    }).then(function () {
                        if (updateFreeAccess) {
                            toastr.success($translate.instant('jwt.auth.free.access.updated.msg'));
                        } else {
                            toastr.success($translate.instant('jwt.auth.free.access.status', {status: ($translate.instant(enabled ? 'enabled.status' : 'disabled.status'))}));
                        }
                    }, function (err) {
                        toastr.error(err.data.error.message, $translate.instant('common.error'));
                    });
                    $rootScope.$broadcast('securityInit', this.securityEnabled, this.hasExplicitAuthentication(), this.freeAccess);
                }
            };

            this.authenticate = function (data, authHeaderValue) {
                return new Promise((resolve) => {
                    if (authHeaderValue) {
                        AuthTokenService.setAuthToken(authHeaderValue);
                        this.externalAuthUser = false;
                    } else {
                        AuthTokenService.clearAuthToken();
                    }

                    this.principal = data;
                    $rootScope.deniedPermissions = {};
                    this.securityInitialized = true;

                    const selectedRepo = {
                        id: LocalStorageAdapter.get(LSKeys.REPOSITORY_ID) || '',
                        location: LocalStorageAdapter.get(LSKeys.REPOSITORY_LOCATION) || ''
                    };

                    if (!jwtAuth.canReadRepo(selectedRepo)) {
                        // if the current repo is unreadable by the currently logged-in user (or free access user)
                        // we unset the repository
                        LocalStorageAdapter.remove(LSKeys.REPOSITORY_ID);
                        LocalStorageAdapter.remove(LSKeys.REPOSITORY_LOCATION);
                        // reset denied permissions (different repo, different rights)
                        $rootScope.deniedPermissions = {};
                    }

                    $rootScope.$broadcast('securityInit', this.securityEnabled, that.hasExplicitAuthentication(), this.freeAccess);
                    setTimeout(() => {
                        resolve(true);
                    });
                });
            };

            this.authenticateOpenID = function(authHeader) {
                AuthTokenService.clearAuthToken();
                if (authHeader) {
                    AuthTokenService.setAuthToken(authHeader);
                    this.externalAuthUser = false;
                }
            };

            this.hasExternalAuthUser = function () {
                return this.externalAuthUser;
            };

            this.hasExplicitAuthentication = function () {
                const token = AuthTokenService.getAuthToken();
                return token != null || this.externalAuthUser;
            };

            // Returns a promise of the principal object if already fetched or a promise which resolves after security initialization
            this.getPrincipal = function () {
                if (this.principal) {
                    return Promise.resolve(this.principal);
                }
                const deferred = $q.defer();
                $rootScope.$on('securityInit', () => {
                    deferred.resolve(this.principal);
                });
                return deferred.promise;
            };

            this.clearAuthenticationInternal = function () {
                $openIDAuth.softLogout();
                this.principal = this.freeAccessPrincipal;
                AuthTokenService.clearAuthToken();
            };

            this.clearAuthentication = function () {
                this.clearAuthenticationInternal();
                $rootScope.$broadcast('securityInit', this.securityEnabled, false, this.freeAccess);
            };

            this.isAuthenticated = function () {
                return !this.securityEnabled || this.hasExplicitAuthentication();
            };

            this.hasPermission = function () {
            };

            this.hasRole = function (role) {
                if (role !== undefined && (this.securityEnabled || this.hasOverrideAuth)) {
                    if ('string' === typeof role) {
                        role = [role];
                    }
                    const hasPrincipal = !_.isEmpty(this.principal);
                    if (!hasPrincipal) {
                        return false;
                    }
                    if (role[0] === 'IS_AUTHENTICATED_FULLY') {
                        return hasPrincipal;
                    } else {
                        return _.intersection(role, this.principal.authorities).length > 0;
                    }
                } else {
                    return true;
                }
            };

            this.isAdmin = function () {
                return this.hasRole(UserRole.ROLE_ADMIN);
            };

            this.isRepoManager = function () {
                return this.hasRole(UserRole.ROLE_REPO_MANAGER);
            };

            this.hasRoleMonitor = function () {
                return this.hasRole(UserRole.ROLE_MONITORING);
            };

            this.checkForWrite = function (menuRole, repo) {
                if ('WRITE_REPO' === menuRole) {
                    return this.canWriteRepo(repo);
                }
                return this.hasRole(menuRole);
            };

            this.hasAdminRole = function () {
                return this.isAdmin() || this.isRepoManager();
            };

            this.canWriteRepo = function (repo) {
                if (!repo) {
                    return false;
                }
                // Adding remote secured location could be done only with admin credentials,
                // that's why we do no check for rights
                if (this.securityEnabled || this.hasOverrideAuth) {
                    if (_.isEmpty(this.principal)) {
                        return false;
                    } else if (this.hasAdminRole()) {
                        return true;
                    }
                    return this.checkRights(repo, 'WRITE');
                } else {
                    return true;
                }
            };

            this.canReadRepo = function (repo) {
                if (!repo) {
                    return false;
                }
                // Adding remote secured location could be done only with admin credentials,
                // that's why we do no check for rights
                if (this.securityEnabled) {
                    if (_.isEmpty(this.principal)) {
                        return false;
                    } else if (this.hasAdminRole()) {
                        return true;
                    }
                    return this.checkRights(repo, 'READ');
                } else {
                    return true;
                }
            };

            this.checkRights = function (repo, action) {
                if (repo) {
                    for (let i = 0; i < this.principal.authorities.length; i++) {
                        const authRole = this.principal.authorities[i];
                        const parts = authRole.split('_', 2);
                        const repoPart = authRole.slice(parts[0].length + parts[1].length + 2);
                        const repoId = repo.location ? `${repo.id}@${repo.location}` : repo.id;
                        if (parts[0] === action && (repoId === repoPart || repo.id !== 'SYSTEM' && repoPart === '*')) {
                            return true;
                        }
                    }
                }
                return false;
            };


            this.updateUserData = (data) => SecurityRestService.updateUserData(data);
        }]);
