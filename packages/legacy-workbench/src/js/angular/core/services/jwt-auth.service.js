import 'angular/core/services';
import 'angular/core/services/security.service';
import {
    AuthenticationService,
    AuthenticationStorageService,
    AuthorizationService,
    OntoToastrService,
    SecurityContextService,
    service,
} from '@ontotext/workbench-api';

angular.module('graphdb.framework.core.services.jwtauth', [
    'toastr',
    'graphdb.framework.core.services.security-service',
])
    .service('$jwtAuth', ['$http', '$location', '$rootScope', 'SecurityService', '$translate', '$q', '$route',
        /* eslint-disable no-invalid-this */
        function($http, $location, $rootScope, SecurityService, $translate, $q, $route) {
            const jwtAuth = this;

            const toastrService = service(OntoToastrService);
            const authorizationService = service(AuthorizationService);
            const authenticationService = service(AuthenticationService);
            const securityContextService = service(SecurityContextService);
            const authStorageService = service(AuthenticationStorageService);

            $rootScope.hasPermission = function() {
                const path = $location.path();
                const restrictedPages = securityContextService.getRestrictedPages();

                return !restrictedPages.isRestricted(path);
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

            this.securityEnabled = true;
            this.hasOverrideAuth = false;
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
                that.externalAuthUser = authenticationService.isExternalUser();
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
                    } else {
                        authStorageService.clearAuthToken();
                        const overrideAuthData = res.data.overrideAuth;
                        that.hasOverrideAuth = overrideAuthData.enabled;
                    }
                });
            };

            this.hasExternalAuth = function() {
                return this.externalAuth;
            };

            this.getAuthImplementation = function() {
                return this.authImplementation;
            };

            this.isFreeAccessEnabled = function() {
                return authorizationService.hasFreeAccess();
            };

            this.isDefaultAuthEnabled = function() {
                return this.hasOverrideAuth && this.principal && this.principal.username === 'overrideauth';
            };

            this.authTokenIsType = function(type) {
                const token = authStorageService.getAuthToken().getValue();
                return token && token.startsWith(type);
            };

            this.toggleSecurity = function(enabled) {
                if (enabled !== this.securityEnabled) {
                    return SecurityService.toggleSecurity(enabled)
                        .then(function() {
                            toastrService.success($translate.instant('jwt.auth.security.status', {status: ($translate.instant(enabled ? 'enabled.status' : 'disabled.status'))}));
                            authStorageService.clearAuthToken();
                            that.initSecurity();
                            that.securityEnabled = enabled;
                        })
                        .catch(function(err) {
                            toastrService.error(err.data, $translate.instant('common.error'));
                        });
                }
                return Promise.resolve();
            };

            this.clearAuthenticationInternal = function() {
                authStorageService.clearAuthToken();
            };

            this.clearAuthentication = function() {
                this.clearAuthenticationInternal();
            };

            this.hasPermission = function() {
            };

            this.hasBaseRights = function(action, repo) {
                const authorizationService = service(AuthorizationService);
                return authorizationService.hasBaseRights(action, repo);
            };

            this.hasGraphqlAuthority = function(action, repo) {
                return authorizationService.canWriteGqlRepo(repo);
            };

            this.initSecurity();
        }]);
