import 'angular/core/services';
import 'angular/core/services/repository-storage.service';
import 'angular/core/services/openid-auth.service.js';
import 'angular/core/services/security.service';
import {UserRole} from 'angular/utils/user-utils';
import {
  RepositoryStorageService,
  RepositoryContextService,
  ServiceProvider,
  MapperProvider,
  SecurityContextService,
  SecurityConfigMapper,
  AuthenticatedUserMapper
} from "@ontotext/workbench-api";

angular.module('graphdb.framework.core.services.jwtauth', [
    'toastr',
    'graphdb.framework.core.services.repository-storage',
    'graphdb.framework.core.services.security-service',
    'graphdb.framework.core.services.openIDService'
])
    .service('$jwtAuth', ['$http', 'toastr', '$location', '$rootScope', 'SecurityService', '$openIDAuth', '$translate', '$q', '$route', 'RepositoryStorage', 'AuthTokenService',
        function ($http, toastr, $location, $rootScope, SecurityService, $openIDAuth, $translate, $q, $route, RepositoryStorage, AuthTokenService) {
            const jwtAuth = this;

            $rootScope.deniedPermissions = {};
            $rootScope.setPermissionDenied = (path) => {
                if (path === '/login' || !jwtAuth.isAuthenticated()) {
                    return false;
                }
                if(jwtAuth.isAuthenticated() && this.hasGraphqlRightsOverCurrentRepo()) {
                    return true;
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
                SecurityService.getAuthenticatedUser().then(function(data) {
                    ServiceProvider.get(SecurityContextService).updateAuthenticatedUser(
                      MapperProvider.get(AuthenticatedUserMapper).mapToModel(data)
                    );
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
                }).catch(function () {
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

                SecurityService.getSecurityConfig().then(function (res) {
                    ServiceProvider.get(SecurityContextService).updateSecurityConfig(
                      MapperProvider.get(SecurityConfigMapper).mapToModel(res.data)
                    );
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
                            ServiceProvider.get(SecurityContextService).updateAuthenticatedUser(
                              MapperProvider.get(AuthenticatedUserMapper).mapToModel(that.principal)
                            );
                            $rootScope.$broadcast('securityInit', that.securityEnabled, true, that.hasOverrideAuth);

                        } else {
                            return SecurityService.getAdminUser().then(function (res) {
                                that.principal = {username: 'admin', appSettings: res.appSettings, authorities: res.grantedAuthorities, grantedAuthoritiesUiModel: res.grantedAuthoritiesUiModel};
                                ServiceProvider.get(SecurityContextService).updateAuthenticatedUser(
                                  MapperProvider.get(AuthenticatedUserMapper).mapToModel(that.principal)
                                );
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
                    return SecurityService.toggleSecurity(enabled)
                        .then(function () {
                            toastr.success($translate.instant('jwt.auth.security.status', {status: ($translate.instant(enabled ? 'enabled.status' : 'disabled.status'))}));
                            AuthTokenService.clearAuthToken();
                            that.initSecurity();
                            that.securityEnabled = enabled;
                        })
                        .catch(function (err) {
                            toastr.error(err.data, $translate.instant('common.error'));
                        });
                }
                return Promise.resolve();
            };

            this.toggleFreeAccess = function (enabled, authorities, appSettings, updateFreeAccess) {
                if (enabled !== this.freeAccess || updateFreeAccess) {
                    if (enabled) {
                        this.freeAccessPrincipal = {authorities: authorities, appSettings: appSettings};
                    } else {
                        this.freeAccessPrincipal = undefined;
                    }
                    SecurityService.setFreeAccess({
                        enabled: enabled ? 'true' : 'false',
                        authorities: authorities,
                        appSettings: appSettings
                    }).then(() => {
                        this.freeAccess = enabled;
                        if (updateFreeAccess) {
                            toastr.success($translate.instant('jwt.auth.free.access.updated.msg'));
                        } else {
                            toastr.success($translate.instant('jwt.auth.free.access.status', {status: ($translate.instant(enabled ? 'enabled.status' : 'disabled.status'))}));
                        }
                    }).catch((err) => {
                        toastr.error(err.data, $translate.instant('common.error'));
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

                    const repositoryStorageService = ServiceProvider.get(RepositoryStorageService);
                    const repositoryContextService = ServiceProvider.get(RepositoryContextService);

                    const selectedRepo = {
                      id: repositoryStorageService.get(repositoryContextService.SELECTED_REPOSITORY_ID).getValueOrDefault(''),
                      location: repositoryStorageService.get(repositoryContextService.REPOSITORY_LOCATION).getValueOrDefault('')
                    };

                    if (!jwtAuth.canReadRepo(selectedRepo)) {
                        // if the current repo is unreadable by the currently logged-in user (or free access user)
                        // we unset the repository
                        repositoryStorageService.remove(repositoryContextService.SELECTED_REPOSITORY_ID);
                        repositoryStorageService.remove(repositoryContextService.REPOSITORY_LOCATION);
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
                if (this.freeAccessPrincipal) {
                  ServiceProvider.get(SecurityContextService).updateAuthenticatedUser(
                    MapperProvider.get(AuthenticatedUserMapper).mapToModel(this.freeAccessPrincipal)
                  );
                }
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

            // Check if the user has the necessary authority to access the route
            this.hasAuthority = function () {
                // If there is no current active route, return false – access cannot be determined
                if (!$route.current) {
                    return false;
                }

                // If the user has an admin role, they always have access
                if (this.hasAdminRole()) {
                    return true;
                }

                // If the current route doesn't define "allowAuthorities", assume there are no restrictions
                if (!$route.current.allowAuthorities) {
                    return true;
                }

                // If there is no selected repository, there are no auth restrictions
                if (!RepositoryStorage.getActiveRepository()) {
                    return true;
                }

                // If there is no principal defined, assume is admin and return true
                if (!this.principal) {
                    return true;
                }

                // If there are allowed authorities defined for the current route
                if ($route.current.allowAuthorities.length > 0) {
                    const auth = resolveAuthorities($route.current.allowAuthorities);
                    // Check if any of the allowed authorities match one of the principal's authorities
                    return auth.some(allowAuth => this.principal.authorities.indexOf(allowAuth) > -1);
                }

                // If none of the above conditions apply, return true by default
                return true;
            }

            // Function to resolve a list of authority strings by replacing the "{repoId}" placeholder
            // with both the specific repository ID and a wildcard for all repositories.
            const resolveAuthorities = (authoritiesList) => {
                // If no authorities list is provided, return undefined.
                if (!authoritiesList) {
                    return;
                }

                // Get the selected repository's ID from the current context.
                const repoId = RepositoryStorage.getActiveRepository();
                // If there is no selected repository ID, return the original authorities list.
                if (!repoId) {
                    return authoritiesList;
                }

                // Replace the "{repoId}" placeholder with the actual repository ID for specific access.
                const authListForCurrentRepo = authoritiesList.map(authority => authority.replace('{repoId}', repoId));
                // Replace the "{repoId}" placeholder with a wildcard '*' to denote access to any repository.
                const authListForAllRepos = authoritiesList.map(authority => authority.replace('{repoId}', '*'));

                // Combine both lists into a single array and return.
                return [...authListForCurrentRepo, ...authListForAllRepos];
            }



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
                if (!repo || repo.id === '') {
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
                if (!repo) {
                    return false;
                }

                if (repo.id === 'SYSTEM') {
                    return false;
                }

                return this.hasBaseRights(action, repo);
            };

            this.hasBaseRights = function (action, repo) {
                const repoId = repo.location ? `${repo.id}@${repo.location}` : repo.id;
                const overCurrentRepo = `${action}_REPO_${repoId}`;
                const overAllRepos = `${action}_REPO_*`;

                return (
                    this.principal.authorities.indexOf(overCurrentRepo) > -1 ||
                    this.principal.authorities.indexOf(overAllRepos) > -1
                );
            }

            this.hasGraphqlRightsOverCurrentRepo = function () {
                const activeRepo = RepositoryStorage.getActiveRepositoryObject();
                return this.hasGraphqlReadRights(activeRepo) || this.hasGraphqlWriteRights(activeRepo);
            }

            this.hasGraphqlWriteRights = function (repo) {
                if (!repo || repo.id === '') {
                    return false;
                }
                return this.hasGraphqlAuthority('WRITE', repo)
            }

            this.hasGraphqlReadRights = function (repo) {
                if (!repo || repo.id === '') {
                    return false;
                }
                return this.hasGraphqlAuthority('READ', repo)
            }

            this.hasGraphqlAuthority = function (action, repo) {
                if (!this.principal) {
                    return false;
                }
                const repoId = repo.location ? `${repo.id}@${repo.location}` : repo.id;
                const overCurrentRepoGraphql = `${action}_REPO_${repoId}:GRAPHQL`;
                const overAllReposGraphql = `${action}_REPO_*:GRAPHQL`;

                return (
                    this.principal.authorities.indexOf(overCurrentRepoGraphql) > -1 ||
                    this.principal.authorities.indexOf(overAllReposGraphql) > -1
                );
            }

            this.updateUserData = (data) => SecurityService.updateUserData(data);
        }]);
