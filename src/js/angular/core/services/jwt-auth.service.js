import 'angular/core/services';
import 'angular/core/services/openid-auth.service.js';
import 'angular/rest/security.rest.service';
import {UserRole} from 'angular/utils/user-utils';

angular.module('graphdb.framework.core.services.jwtauth', [
    'ngCookies',
    'toastr',
    'graphdb.framework.rest.security.service',
    'graphdb.framework.core.services.openIDService'
])
    .service('$jwtAuth', ['$http', '$cookies', '$cookieStore', 'toastr', '$location', '$rootScope', 'SecurityRestService', '$openIDAuth',
        function ($http, $cookies, $cookieStore, toastr, $location, $rootScope, SecurityRestService, $openIDAuth) {
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

            $rootScope.redirectToLogin = function (expired) {
                if (jwtAuth.auth && jwtAuth.auth.startsWith('Bearer')) {
                    toastr.error('Missing or stale OAuth Token.');
                    jwtAuth.clearAuthentication();
                }
                if (expired && jwtAuth.getAuthToken()) {
                    toastr.error('Your authentication token has expired. Please login again.');
                    jwtAuth.clearAuthentication();
                }

                if ($location.url().indexOf('/login') !== 0) {
                    // remember where we were so we can return there
                    $rootScope.returnToUrl = $location.url();
                }

                // Countering race condition. When the unauthorized interceptor catches error 401 or 409, then we must make
                // sure that a request is made to access the login page before proceeding with the rejection of the
                // original request. Otherwise the login page is not accessible in the context of spring security.
                $location.path('/login');
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(true);
                    }, 100);
                });
            };
            $rootScope.hasExternalAuthUser = function () {
                return jwtAuth.hasExternalAuthUser();
            };

            this.principalCookieName = 'com.ontotext.graphdb.principal' + $location.port();
            this.authCookieName = 'com.ontotext.graphdb.auth' + $location.port();

            this.securityEnabled = true;
            this.freeAccess = false;
            this.hasOverrideAuth = false;
            this.externalAuthUser = false;
            this.securityInitialized = false;

            const that = this;

            this.clearCookies = function () {
                delete $cookies[that.authCookieName];
                $cookieStore.remove(that.principalCookieName);
            };

            this.getAuthenticatedUserFromBackend = function() {
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
                        $location.url('/');
                    } else {
                        // There is no previous authentication but we got a principal via
                        // an external authentication mechanism (e.g. Kerberos)
                        that.externalAuthUser = true;
                        that.authenticate(data, headers('Authorization')); // this will emit securityInit
                        // console.log('external authentication ok');
                    }
                }).finally(function() {
                    // Strictly speaking we should try this in the error() callback but
                    // for some reason it doesn't get called.
                    that.securityInitialized = true;
                    if (!that.hasExplicitAuthentication()) {
                        that.principal = that.freeAccessPrincipal;
                        $rootScope.$broadcast('securityInit', that.securityEnabled, false, that.freeAccess);
                        // console.log('free access fallback');
                    }
                });
            }

            this.initSecurity = function () {
                this.auth = $cookies[this.authCookieName];
                this.principal = $cookieStore.get(this.principalCookieName);

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
                            that.openIDClientID = res.data.methodSettings.openid.clientId;
                            that.openIDAuthFlow = res.data.methodSettings.openid.authFlow;
                            that.authorizeParameters = res.data.methodSettings.openid.authorizeParameters;

                            that.openIDreturnToUrl = $location.absUrl().replace($location.url().substr(1), '');
                            $openIDAuth.initOpenId(that.openIDClientID,
                                res.data.methodSettings.openid.clientSecret,
                                res.data.methodSettings.openid.issuer,
                                res.data.methodSettings.openid.tokenType,
                                that.openIDreturnToUrl,
                                that.openIDAuthFlow,
                                function() {
                                    if ($openIDAuth.checkCredentials(that.openIDClientID)) {
                                        that.auth = $openIDAuth.authHeaderGraphDB();
                                        jwtAuth.setAuthHeaders();
                                    }
                                    that.getAuthenticatedUserFromBackend();
                                });

                            } else {
                                that.getAuthenticatedUserFromBackend();
                            }



                    } else {
                        that.clearCookies();
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
                            SecurityRestService.getAdminUser().then(function (res) {
                                that.principal = {username: 'admin', appSettings: res.data.appSettings, authorities: res.data.grantedAuthorities}
                                $rootScope.$broadcast('securityInit', that.securityEnabled, true, that.hasOverrideAuth);
                            });
                        }
                    }
                });
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

            this.loginOpenID = function () {
                $openIDAuth.login(this.openIDClientID, this.openIDAuthFlow, this.authorizeParameters, this.openIDreturnToUrl);
            };

            this.toggleSecurity = function (enabled) {
                if (enabled !== this.securityEnabled) {
                    this.securityEnabled = enabled;
                    SecurityRestService.toggleSecurity(enabled).then(function () {
                        toastr.success('Security has been ' + (enabled ? 'enabled.' : 'disabled.'));
                        that.clearCookies();
                        that.initSecurity();
                    }, function (err) {
                        toastr.error(err.data.error.message, 'Error');
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
                            toastr.success('Free access settings have been updated.');
                        } else {
                            toastr.success('Free access has been ' + (enabled ? 'enabled.' : 'disabled.'));
                        }
                    }, function (err) {
                        toastr.error(err.data.error.message, 'Error');
                    });
                    $rootScope.$broadcast('securityInit', this.securityEnabled, this.hasExplicitAuthentication(), this.freeAccess);
                }
            };

            this.setAuthHeaders = function () {
                $http.defaults.headers.common['Authorization'] = this.auth;
                // Angular doesn't send this header by default and we need it to detect XHR requests
                // so that we don't advertise Basic auth with them.
                $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
                $.ajaxSetup()['headers'] = $.ajaxSetup()['headers'] || {};
                $.ajaxSetup()['headers']['Authorization'] = this.auth;
                // jQuery seems to send the header by default but it doesn't hurt to be explicit
                $.ajaxSetup()['headers']['X-Requested-With'] = 'XMLHttpRequest';
            };
            this.setAuthHeaders();

            this.authenticate = function (data, authHeaderValue) {
                this.clearCookies();
                if (authHeaderValue) {
                    this.auth = authHeaderValue;
                    $cookies[this.authCookieName] = this.auth;
                    this.externalAuthUser = false;
                }

                this.principal = data;

                $cookieStore.put(this.principalCookieName, this.principal);
                this.setAuthHeaders();
                $rootScope.deniedPermissions = {};
                this.securityInitialized = true;
                $rootScope.$broadcast('securityInit', this.securityEnabled, this.hasExplicitAuthentication(), this.freeAccess);
            };

            this.hasExternalAuthUser = function () {
                return this.externalAuthUser;
            };

            this.hasExplicitAuthentication = function () {
                return this.auth !== undefined || this.externalAuthUser;
            };

            this.getPrincipal = function () {
                return this.principal;
            };

            this.clearAuthentication = function () {
                $openIDAuth.softLogout();
                this.auth = undefined;
                this.principal = this.freeAccessPrincipal;
                this.clearCookies();
                this.setAuthHeaders();
                $rootScope.$broadcast('securityInit', this.securityEnabled, false, this.freeAccess);
            };

            this.isAuthenticated = function () {
                return !this.securityEnabled || this.auth !== undefined;
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

            this.checkForWrite = function (menuRole, location, repo) {
                if ('WRITE_REPO' === menuRole) {
                    return this.canWriteRepo(location, repo);
                }
                return this.hasRole(menuRole);
            };

            this.hasAdminRole = function () {
                return this.isAdmin() || this.hasRole(UserRole.ROLE_REPO_MANAGER);
            };

            this.canWriteRepo = function (location, repo) {
                if (_.isEmpty(location) || _.isEmpty(repo)) {
                    return false;
                }
                if (this.securityEnabled || this.hasOverrideAuth) {
                    if (_.isEmpty(this.principal)) {
                        return false;
                    } else if (this.hasAdminRole()) {
                        return true;
                    }
                    return this.checkRights(location, repo, 'WRITE');
                } else {
                    return true;
                }
            };

            this.canReadRepo = function (location, repo) {
                if (_.isEmpty(location) || _.isEmpty(repo)) {
                    return false;
                }
                if (this.securityEnabled) {
                    if (_.isEmpty(this.principal)) {
                        return false;
                    } else if (this.hasAdminRole()) {
                        return true;
                    }
                    return this.checkRights(location, repo, 'READ');
                } else {
                    return true;
                }
            };

            this.checkRights = function (location, repo, action) {
                for (let i = 0; i < this.principal.authorities.length; i++) {
                    const authRole = this.principal.authorities[i];
                    const parts = authRole.split('_', 2);
                    const repoPart = authRole.slice(parts[0].length + parts[1].length + 2);
                    if (parts[0] === action && (repoPart === repo || repo !== 'SYSTEM' && repoPart === '*')) {
                        return true;
                    }
                }
                return false;
            };
        }]);
