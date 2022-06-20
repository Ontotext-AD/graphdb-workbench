import 'angular/core/services';
import 'angular/core/services/openid-auth.service.js';
import 'angular/rest/security.rest.service';
import {UserRole} from 'angular/utils/user-utils';

angular.module('graphdb.framework.core.services.jwtauth', [
    'toastr',
    'graphdb.framework.rest.security.service',
    'graphdb.framework.core.services.openIDService'
])
    .service('$jwtAuth', ['$http', 'toastr', '$location', '$rootScope', 'SecurityRestService', '$openIDAuth', '$translate', '$q',
        function ($http, toastr, $location, $rootScope, SecurityRestService, $openIDAuth, $translate, $q) {
            const jwtAuth = this;

            $rootScope.deniedPermissions = {};
            $rootScope.setPermissionDenied = function (path) {
                if (path === '/' || path === '/login' || !jwtAuth.isAuthenticated()) {
                    return false;
                }
                $rootScope.deniedPermissions[path] = true;
                return true;
            };
            $rootScope.hasPermission = function () {
                const path = $location.path();
                return !$rootScope.deniedPermissions[path];
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

                if ($location.url().indexOf('/login') !== 0) {
                    // remember where we were so we can return there
                    $rootScope.returnToUrl = $location.url();
                }

                $location.path('/login');
                if (noaccess) {
                    $location.search('noaccess');
                } else if (expired) {
                    $location.search('expired');
                }
                // Countering race condition. When the unauthorized interceptor catches error 401 or 409, then we must make
                // sure that a request is made to access the login page before proceeding with the rejection of the
                // original request. Otherwise the login page is not accessible in the context of spring security.
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(true);
                    }, 100);
                });
            };
            $rootScope.hasExternalAuthUser = function () {
                return jwtAuth.hasExternalAuthUser();
            };

            this.authStorageName = 'com.ontotext.graphdb.auth';

            this.securityEnabled = true;
            this.freeAccess = false;
            this.hasOverrideAuth = false;
            this.externalAuthUser = false;
            this.securityInitialized = false;

            const that = this;

            this.clearStorage = function () {
                localStorage.removeItem(that.authStorageName);
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
            this.getAuthenticatedUserFromBackend = function(noFreeAccessFallback, justLoggedIn) {
                SecurityRestService.getAuthenticatedUser().
                success(function(data, status, headers) {
                    if (that.auth && that.auth.startsWith('GDB')) {
                        // There is a previous authentication via JWT, it's still valid
                        // so refresh the principal
                        that.externalAuthUser = false;
                        that.principal = data;
                        $rootScope.$broadcast('securityInit', that.securityEnabled, true, that.freeAccess);
                        // console.log('previous JWT authentication ok');
                    } else if (that.openIDEnabled && that.auth && that.auth.startsWith('Bearer')) {
                        // The auth was obtained from OpenID, we need to authenticate with the returned user
                        that.authenticate(data, that.auth);
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

            let securityConfigRequestPromise;
            this.initSecurity = function () {
                this.securityInitialized = false;
                this.auth = localStorage.getItem(this.authStorageName);

                securityConfigRequestPromise = SecurityRestService.getSecurityConfig().then(function (res) {
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
                                    that.auth = $openIDAuth.authHeaderGraphDB();
                                    jwtAuth.setAuthHeaders();
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
                        that.clearStorage();
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
                })
                    .finally(() => securityConfigRequestPromise = null);
            };

            this.initSecurity();


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

            this.getAuthToken = function () {
                return this.auth;
            };

            this.authTokenIsType = function (type) {
                return this.auth && this.auth.startsWith(type);
            };

            this.loginOpenID = function () {
                $openIDAuth.login(this.openIDConfig, this.gdbUrl);
            };

            this.toggleSecurity = function (enabled) {
                if (enabled !== this.securityEnabled) {
                    this.securityEnabled = enabled;
                    SecurityRestService.toggleSecurity(enabled).then(function () {
                        toastr.success($translate.instant('jwt.auth.security.status', {status: ($translate.instant(enabled ? 'enabled.status' : 'disabled.status'))}));
                        that.clearStorage();
                        that.initSecurity();
                    }, function (err) {
                        toastr.error(err.data.error.message, $translate.instant('common.error'));
                    });
                }
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

            this.setAuthHeaders = function () {
                return new Promise(resolve => {
                    const auth = this.auth ? this.auth : undefined;
                    $http.defaults.headers.common['Authorization'] = auth;
                    // Angular doesn't send this header by default and we need it to detect XHR requests
                    // so that we don't advertise Basic auth with them.
                    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
                    $.ajaxSetup()['headers'] = $.ajaxSetup()['headers'] || {};
                    $.ajaxSetup()['headers']['Authorization'] = auth;
                    // jQuery seems to send the header by default but it doesn't hurt to be explicit
                    $.ajaxSetup()['headers']['X-Requested-With'] = 'XMLHttpRequest';
                    setTimeout(() => {
                        resolve(true);
                    })
                });
            };
            this.setAuthHeaders();

            this.authenticate = function (data, authHeaderValue) {
                return new Promise(resolve => {
                    that.clearStorage();
                    if (authHeaderValue) {
                        this.auth = authHeaderValue;
                        localStorage.setItem(that.authStorageName, this.auth);
                        this.externalAuthUser = false;
                    }

                    this.principal = data;
                    $rootScope.deniedPermissions = {};
                    this.securityInitialized = true;

                    // Should guarantee that the authentication headers are set before broadcasting 'securityInit',
                    // to avoid race conditions, because on 'securityInit' in repositories.service is called getRepositories,
                    // which has access="IS_AUTHENTICATED_FULLY" in GDB security-config.xml
                    that.setAuthHeaders()
                        .then(() => {
                            $rootScope.$broadcast('securityInit', this.securityEnabled, that.hasExplicitAuthentication(), this.freeAccess);
                        });
                    setTimeout(() => {
                        resolve(true);
                    })
                });
            };

            this.authenticateOpenID = function(authHeader) {
                this.clearStorage();
                if (authHeader) {
                    this.auth = authHeader;
                    localStorage.setItem(this.authStorageName, this.auth);
                    this.externalAuthUser = false;
                }
            }

            this.hasExternalAuthUser = function () {
                return this.externalAuthUser;
            };

            this.hasExplicitAuthentication = function () {
                return this.auth != null || this.externalAuthUser;
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
                this.auth = null;
                this.principal = this.freeAccessPrincipal;
                this.clearStorage();
                this.setAuthHeaders();
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

            this.checkForWrite = function (menuRole, repo) {
                if ('WRITE_REPO' === menuRole) {
                    return this.canWriteRepo(repo);
                }
                return this.hasRole(menuRole);
            };

            this.hasAdminRole = function () {
                return this.isAdmin() || this.hasRole(UserRole.ROLE_REPO_MANAGER);
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
        }]);
