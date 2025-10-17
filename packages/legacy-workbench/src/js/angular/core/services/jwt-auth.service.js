import 'angular/core/services';
import 'angular/core/services/openid-auth.service.js';
import 'angular/core/services/security.service';
import {UserRole} from 'angular/utils/user-utils';
import {
    AuthenticatedUserMapper,
    AuthenticationService,
    AuthorizationService,
    MapperProvider,
    OntoToastrService,
    RepositoryStorageService,
    SecurityContextService,
    service,
    ServiceProvider,
} from '@ontotext/workbench-api';

angular.module('graphdb.framework.core.services.jwtauth', [
    'toastr',
    'graphdb.framework.core.services.security-service',
    'graphdb.framework.core.services.openIDService',
])
    .service('$jwtAuth', ['$http', '$location', '$rootScope', 'SecurityService', '$translate', '$q', '$route', 'AuthTokenService',
        /* eslint-disable no-invalid-this */
        function($http, $location, $rootScope, SecurityService, $translate, $q, $route, AuthTokenService) {
            const toastrService = ServiceProvider.get(OntoToastrService);
            const jwtAuth = this;
            const authorizationService = service(AuthorizationService);
            const authenticationService = service(AuthenticationService);
            const securityContextService = ServiceProvider.get(SecurityContextService);

            $rootScope.hasPermission = function() {
                const path = $location.path();
                const restrictedPages = securityContextService.getRestrictedPages();

                return restrictedPages.isRestricted(path);
            };

            this.updateReturnUrl = () => {
                if ($location.url().indexOf('/login') !== 0) {
                    $rootScope.returnToUrl = $location.url();
                } else {
                    $rootScope.returnToUrl = '';
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
            $rootScope.redirectToLogin = function(expired, noaccess) {
                if ($location.path().includes('/login')) {
                    // just resolve if path is already the login page
                    return Promise.resolve();
                }
                if (jwtAuth.authTokenIsType('Bearer')) {
                    // OpenID login may be detected as expired either on initial validation
                    // when we get expired = true or indirectly via 401, setting expired = true
                    // handles the second case.
                    expired = true;
                }
                jwtAuth.clearAuthenticationInternal();
                // remember where we were so we can return there
                jwtAuth.updateReturnUrl();

                const params = {};
                if ($rootScope.returnToUrl) {
                    params.r = encodeURIComponent($rootScope.returnToUrl);
                }

                if (noaccess) {
                    params.noaccess = true;
                }

                if (expired) {
                    params.expired = true;
                }

                $location
                    .path('/login')
                    .search(params);

                // Countering race condition. When the unauthorized interceptor catches error 401 or 409, then we must make
                // sure that a request is made to access the login page before proceeding with the rejection of the
                // original request. Otherwise the login page is not accessible in the context of spring security.
                return new Promise((resolve) => {
                    setTimeout(() => {
                        // Run digest cycle to update the location
                        $rootScope.$apply();
                        resolve(true);
                    }, 100);
                });
            };
            $rootScope.hasExternalAuthUser = function() {
                return jwtAuth.hasExternalAuthUser();
            };

            this.securityEnabled = true;
            this.hasOverrideAuth = false;
            this.externalAuthUser = false;
            this.securityInitialized = false;

            const that = this;

            const getActiveRepositoryObjectFromStorage = function() {
                return ServiceProvider.get(RepositoryStorageService).getRepositoryReference();
            };

            const isGDBorOpenIDToken = function() {
                const token = AuthTokenService.getAuthToken();
                return token && (token.startsWith('GDB') || that.openIDEnabled && token.startsWith('Bearer'));
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
                if (isGDBorOpenIDToken()) {
                    return;
                }

                // FIXME: Remove after verification that it is not needed for Kerberos or X509 authentication
                SecurityService.getAuthenticatedUser().then(function(data) {
                    securityContextService.updateAuthenticatedUser(
                        MapperProvider.get(AuthenticatedUserMapper).mapToModel(data),
                    );
                    // There is no previous authentication but we got a principal via
                    // an external authentication mechanism (e.g. Kerberos)
                    that.externalAuthUser = true;
                    that.broadcastSecurityInit();
                }).catch(function() {
                    if (noFreeAccessFallback || !authorizationService.hasFreeAccess()) {
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

            this.initSecurity = function() {
                this.securityInitialized = false;

                SecurityService.getSecurityConfig().then(function(res) {
                    that.securityEnabled = res.data.enabled;
                    that.externalAuth = res.data.hasExternalAuth;
                    that.authImplementation = res.data.authImplementation;
                    that.openIDEnabled = res.data.openIdEnabled;
                    that.passwordLoginEnabled = res.data.passwordLoginEnabled;

                    if (that.securityEnabled) {
                        that.openIDConfig = res.data.methodSettings.openid;

                        that.getAuthenticatedUserFromBackend();
                        that.broadcastSecurityInit(that.securityEnabled, that.hasExplicitAuthentication());
                    } else {
                        AuthTokenService.clearAuthToken();
                        const overrideAuthData = res.data.overrideAuth;
                        that.hasOverrideAuth = overrideAuthData.enabled;
                        if (that.hasOverrideAuth) {
                            // TODO: When security is disabled, there is an option to set a default user authorities through configuration and use it instead of admin
                            // that.principal = {
                            //     username: 'overrideauth',
                            //     authorities: overrideAuthData.authorities,
                            //     appSettings: overrideAuthData.appSettings,
                            // };
                            that.broadcastSecurityInit(that.securityEnabled, true, that.hasOverrideAuth);
                        } else {
                            that.broadcastSecurityInit(that.securityEnabled, true, that.hasOverrideAuth);
                        }
                    }
                });
            };

            this.reinitializeSecurity = function() {
                if (!this.securityInitialized) {
                    this.initSecurity();
                }
            };

            this.isSecurityEnabled = function() {
                return this.securityEnabled;
            };

            this.hasExternalAuth = function() {
                return this.externalAuth;
            };

            this.getAuthImplementation = function() {
                return this.authImplementation;
            };

            this.isFreeAccessEnabled = function() {
                return authorizationService.hasFreeAccess();
                // return this.freeAccess;
            };

            this.isDefaultAuthEnabled = function() {
                return this.hasOverrideAuth && this.principal && this.principal.username === 'overrideauth';
            };

            this.authTokenIsType = function(type) {
                const token = AuthTokenService.getAuthToken();
                return token && token.startsWith(type);
            };

            this.toggleSecurity = function(enabled) {
                if (enabled !== this.securityEnabled) {
                    return SecurityService.toggleSecurity(enabled)
                        .then(function() {
                            toastrService.success($translate.instant('jwt.auth.security.status', {status: ($translate.instant(enabled ? 'enabled.status' : 'disabled.status'))}));
                            AuthTokenService.clearAuthToken();
                            that.initSecurity();
                            that.securityEnabled = enabled;
                        })
                        .catch(function(err) {
                            toastrService.error(err.data, $translate.instant('common.error'));
                        });
                }
                return Promise.resolve();
            };

            this.hasExternalAuthUser = function() {
                return this.externalAuthUser;
            };

            this.hasExplicitAuthentication = function() {
                const token = AuthTokenService.getAuthToken();
                return (token !== null && token !== undefined) || this.externalAuthUser;
            };

            // Returns a promise of the principal object if already fetched or a promise which resolves after security initialization
            this.getPrincipal = function() {
                const authenticatedUser = authorizationService.getAuthenticatedUser();
                if (authenticatedUser) {
                    return Promise.resolve(authenticatedUser);
                }
                const deferred = $q.defer();
                $rootScope.$on('securityInit', () => {
                    deferred.resolve(authenticatedUser);
                });
                return deferred.promise;
            };

            this.clearAuthenticationInternal = function() {
                // this.principal = this.freeAccessPrincipal;
                AuthTokenService.clearAuthToken();
            };

            this.clearAuthentication = function() {
                this.clearAuthenticationInternal();
                this.broadcastSecurityInit();
            };

            this.isAuthenticated = function() {
                return authenticationService.isAuthenticated();
                // return !this.securityEnabled || this.hasExplicitAuthentication();
            };

            this.hasPermission = function() {
            };

            this.hasRole = function(role) {
                return authorizationService.hasRole(role);
                // if (role !== undefined && (this.securityEnabled || this.hasOverrideAuth)) {
                //     if ('string' === typeof role) {
                //         role = [role];
                //     }
                //     const hasPrincipal = !_.isEmpty(this.principal);
                //     if (!hasPrincipal) {
                //         return false;
                //     }
                //     if (role[0] === 'IS_AUTHENTICATED_FULLY') {
                //         return hasPrincipal;
                //     } else {
                //         return _.intersection(role, this.principal.authorities).length > 0;
                //     }
                // } else {
                //     return true;
                // }
            };

            // Check if the user has the necessary authority to access the route
            this.hasAuthority = function() {
                return authorizationService.hasAuthority();
                // // If there is no current active route, return false – access cannot be determined
                // if (!$route.current) {
                //     return false;
                // }
                //
                // // If the user has an admin role, they always have access
                // if (this.hasAdminRole()) {
                //     return true;
                // }
                //
                // // If the current route doesn't define "allowAuthorities", assume there are no restrictions
                // if (!$route.current.allowAuthorities) {
                //     return true;
                // }
                //
                // // If there is no selected repository, there are no auth restrictions
                // if (getActiveRepositoryObjectFromStorage().id === '') {
                //     return true;
                // }
                //
                // // If there is no principal defined, assume is admin and return true
                // if (!this.principal) {
                //     return true;
                // }
                //
                // // If there are allowed authorities defined for the current route
                // if ($route.current.allowAuthorities.length > 0) {
                //     const auth = resolveAuthorities($route.current.allowAuthorities);
                //     // Check if any of the allowed authorities match one of the principal's authorities
                //     return auth.some((allowAuth) => this.principal.authorities.indexOf(allowAuth) > -1);
                // }
                // // If none of the above conditions apply, return true by default
                // return true;
            };

            // Function to resolve a list of authority strings by replacing the "{repoId}" placeholder
            // with both the specific repository ID and a wildcard for all repositories.
            // eslint-disable-next-line no-unused-vars
            const resolveAuthorities = (authoritiesList) => {
                // If no authorities list is provided, return undefined.
                if (!authoritiesList) {
                    return;
                }

                // Get the selected repository's ID from the current context.
                const repo = getActiveRepositoryObjectFromStorage();
                // If there is no selected repository ID, return the original authorities list.
                if (!repo) {
                    return authoritiesList;
                }

                // Replace the "{repoId}" placeholder with the actual repository ID for specific access.
                const authListForCurrentRepo = authoritiesList.map((authority) => authority.replace('{repoId}', repo.id));
                // Replace the "{repoId}" placeholder with a wildcard '*' to denote access to any repository.
                const authListForAllRepos = authoritiesList.map((authority) => authority.replace('{repoId}', '*'));

                // Combine both lists into a single array and return.
                return [...authListForCurrentRepo, ...authListForAllRepos];
            };


            this.isAdmin = function() {
                return authorizationService.isAdmin();
                // return this.hasRole(UserRole.ROLE_ADMIN);
            };

            this.isRepoManager = function() {
                return authorizationService.isRepoManager();
                // return this.hasRole(UserRole.ROLE_REPO_MANAGER);
            };

            this.hasRoleMonitor = function() {
                return this.hasRole(UserRole.ROLE_MONITORING);
            };

            this.checkForWrite = function(menuRole, repo) {
                // Used to build the menu
                if ('WRITE_REPO' === menuRole) {
                    return this.canWriteRepo(repo);
                }
                return this.hasRole(menuRole);
            };

            this.hasAdminRole = function() {
                return this.isAdmin() || this.isRepoManager();
            };

            this.canWriteRepo = function(repo) {
                return authorizationService.canWriteRepo(repo);
                // if (!repo) {
                //     return false;
                // }
                // Adding remote secured location could be done only with admin credentials,
                // that's why we do no check for rights
                // if (this.securityEnabled || this.hasOverrideAuth) {
                //     if (_.isEmpty(this.principal)) {
                //         return false;
                //     } else if (this.hasAdminRole()) {
                //         return true;
                //     }
                //     return this.checkRights(repo, 'WRITE');
                // } else {
                //     return true;
                // }
            };

            this.canReadRepo = function(repo) {
                return authorizationService.canReadRepo(repo);
                // if (!repo || repo.id === '') {
                //     return false;
                // }
                // // Adding remote secured location could be done only with admin credentials,
                // // that's why we do no check for rights
                // if (this.securityEnabled) {
                //     if (_.isEmpty(this.principal)) {
                //         return false;
                //     } else if (this.hasAdminRole()) {
                //         return true;
                //     }
                //     return this.checkRights(repo, 'READ');
                // } else {
                //     return true;
                // }
            };


            // this.checkRights = function (repo, action) {
            //     // privately used
            //     if (!repo) {
            //         return false;
            //     }
            //
            //     if (repo.id === 'SYSTEM') {
            //         return false;
            //     }
            //
            //     return this.hasBaseRights(action, repo);
            // };

            this.hasBaseRights = function(action, repo) {
                const authorizationService = service(AuthorizationService);
                return authorizationService.hasBaseRights(action, repo);
                // FIXME: Keep for reference
                // const repoId = repo.location ? `${repo.id}@${repo.location}` : repo.id;
                // const overCurrentRepo = `${action}_REPO_${repoId}`;
                // const overAllRepos = `${action}_REPO_*`;
                //
                // return (
                //     this.principal.authorities.indexOf(overCurrentRepo) > -1 ||
                //     this.principal.authorities.indexOf(overAllRepos) > -1
                // );
            };

            this.hasGraphqlRightsOverCurrentRepo = function() {
                const activeRepo = getActiveRepositoryObjectFromStorage();
                return this.hasGraphqlReadRights(activeRepo) || this.hasGraphqlWriteRights(activeRepo);
            };

            this.hasGraphqlWriteRights = function(repo) {
                if (!repo || repo.id === '') {
                    return false;
                }
                return this.hasGraphqlAuthority('WRITE', repo);
            };

            this.hasGraphqlReadRights = function(repo) {
                return authorizationService.canReadGqlRepo(repo);
                // if (!repo || repo.id === '') {
                //     return false;
                // }
                // return this.hasGraphqlAuthority('READ', repo);
            };

            this.hasGraphqlAuthority = function(action, repo) {
                return authorizationService.canWriteGqlRepo(action, repo);
                // if (!this.principal) {
                //     return false;
                // }
                // const repoId = repo.location ? `${repo.id}@${repo.location}` : repo.id;
                // const overCurrentRepoGraphql = `${action}_REPO_${repoId}:GRAPHQL`;
                // const overAllReposGraphql = `${action}_REPO_*:GRAPHQL`;
                //
                // return (
                //     this.principal.authorities.indexOf(overCurrentRepoGraphql) > -1 ||
                //     this.principal.authorities.indexOf(overAllReposGraphql) > -1
                // );
            };

            this.updateUserData = (data) => SecurityService.updateUserData(data);

            this.broadcastSecurityInit = (securityEnabled, userLoggedIn) => {
                const isSecurityEnabled = authenticationService.isSecurityEnabled();
                const isUserLoggedIn = authenticationService.isLoggedIn();
                const isFreeAccessEnabled = authorizationService.hasFreeAccess();
                $rootScope.$broadcast('securityInit', isSecurityEnabled, isUserLoggedIn, isFreeAccessEnabled);
            };

            this.initSecurity();
        }]);
