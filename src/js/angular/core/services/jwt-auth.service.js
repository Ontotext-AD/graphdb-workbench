import 'angular/core/services';
import 'angular/rest/security.rest.service';

angular.module('graphdb.framework.core.services.jwtauth', [
    'ngCookies',
    'toastr',
    'graphdb.framework.rest.security.service'
])
    .service('$jwtAuth', ['$http', '$cookies', '$cookieStore', 'toastr', '$location', '$rootScope', 'SecurityRestService',
        function ($http, $cookies, $cookieStore, toastr, $location, $rootScope, SecurityRestService) {
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
                if (expired && jwtAuth.getAuthToken()) {
                    toastr.error('Your authentication token has expired. Please login again.');
                    jwtAuth.clearAuthentication();
                }

                if ($location.url().indexOf('/login') !== 0) {
                    // remember where we were so we can return there
                    $rootScope.returnToUrl = $location.url();
                }
                $location.path('/login');
            };

            this.principalCookieName = 'com.ontotext.graphdb.principal' + $location.port();
            this.authCookieName = 'com.ontotext.graphdb.auth' + $location.port();

            this.securityEnabled = true;
            this.freeAccess = false;
            this.hasOverrideAuth = false;

            const that = this;

            this.clearCookies = function () {
                delete $cookies[that.authCookieName];
                $cookieStore.remove(that.principalCookieName);
            };

            this.initSecurity = function () {
                this.auth = $cookies[this.authCookieName];
                this.principal = $cookieStore.get(this.principalCookieName);

                SecurityRestService.getSecurityConfig().then(function (res) {
                    that.securityEnabled = res.data.enabled;
                    that.externalAuth = res.data.hasExternalAuth;
                    that.authImplementation = res.data.authImplementation;

                    if (that.securityEnabled) {
                        const freeAccessData = res.data.freeAccess;
                        that.freeAccess = freeAccessData.enabled;
                        if (that.freeAccess) {
                            that.freeAccessPrincipal = {authorities: freeAccessData.authorities, appSettings: freeAccessData.appSettings};
                            if (that.auth === undefined) {
                                that.principal = that.freeAccessPrincipal;

                            }
                            $rootScope.$broadcast('securityInit', that.securityEnabled, that.auth !== undefined, that.freeAccess);
                        } else {
                            // update the user principal only when there is one
                            if (that.principal) {
                                SecurityRestService.getUser(that.principal.username).then(function (res) {
                                    that.principal.appSettings = res.data.appSettings;
                                    // Don't update the authorities for the time being as those returned by this API
                                    // aren't expanded. User will need to logout and login again to get updated authorities.
                                    // that.principal.authorities = res.data.grantedAuthorities;
                                    $rootScope.$broadcast('securityInit', that.securityEnabled, that.auth !== undefined, that.freeAccess);
                                });
                            } else {
                                // we should always broadcast securityInit
                                $rootScope.$broadcast('securityInit', that.securityEnabled, that.auth !== undefined, that.freeAccess);
                            }
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
                            $rootScope.$broadcast('securityInit', that.securityEnabled, that.auth !== undefined, that.hasOverrideAuth);

                        } else {
                            SecurityRestService.getAdminUser().then(function (res) {
                                that.principal = {username: 'admin', appSettings: res.data.appSettings, authorities: res.data.grantedAuthorities}
                                $rootScope.$broadcast('securityInit', that.securityEnabled, that.auth !== undefined, that.hasOverrideAuth);
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
                    $rootScope.$broadcast('securityInit', this.securityEnabled, this.auth !== undefined, this.freeAccess);
                }
            };

            this.setAuthHeaders = function () {
                $http.defaults.headers.common['Authorization'] = this.auth;
                $.ajaxSetup()['headers'] = $.ajaxSetup()['headers'] || {};
                $.ajaxSetup()['headers']['Authorization'] = this.auth;
            };
            this.setAuthHeaders();

            this.authenticate = function (data, headers) {
                this.auth = headers('Authorization');
                this.principal = data;
                $cookies[this.authCookieName] = this.auth;
                $cookieStore.put(this.principalCookieName, this.principal);
                this.setAuthHeaders();
                $rootScope.deniedPermissions = {};
                $rootScope.$broadcast('securityInit', this.securityEnabled, this.auth !== undefined, this.freeAccess);
            };

            this.getPrincipal = function () {
                return this.principal;
            };

            this.clearAuthentication = function () {
                this.auth = undefined;
                this.principal = this.freeAccessPrincipal;
                this.clearCookies();
                this.setAuthHeaders();
                $rootScope.$broadcast('securityInit', this.securityEnabled, this.auth !== undefined, this.freeAccess);
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

            this.checkForWrite = function (menuRole, location, repo) {
                if ('WRITE_REPO' === menuRole) {
                    return this.canWriteRepo(location, repo);
                }
                return this.hasRole(menuRole);
            };

            this.hasAdminRole = function () {
                return this.hasRole('ROLE_ADMIN') || this.hasRole('ROLE_REPO_MANAGER');
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
