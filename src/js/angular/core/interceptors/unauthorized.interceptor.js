import 'angular/core/services';

angular.module('graphdb.framework.core.interceptors.unauthorized', [
    'ngCookies'
])
    .factory('$unauthorizedInterceptor', ['$q', '$location', '$rootScope', '$translate', 'AuthTokenService',
        function($q, $location, $rootScope, $translate, AuthTokenService) {
            return {
                'request': function(config) {
                    const headers = config.headers || {};
                    // Angular doesn't send this header by default, and we need it to detect XHR requests
                    // so that we don't advertise Basic auth with them.
                    headers['X-Requested-With'] = 'XMLHttpRequest';
                    headers.Authorization = AuthTokenService.getAuthToken();
                    config.headers = headers;
                    return config;
                },
                'responseError': function(response) {
                    let redirect = false;

                    if (response.status === 401) {
                        if (response.config.url.indexOf('rest/security/authenticated-user') < 0 && !$rootScope.hasExternalAuthUser()) {
                            // Redirect to login page only if this isn't the endpoint that checks
                            // the externally logged user and when no external authentication is available.
                            // This check is essential for making free access and external auth working.
                            redirect = true;
                        }
                    } else if (response.status === 403) {
                        if ($rootScope.setPermissionDenied($location.path())) {
                            console.log($translate.instant('unauthorized.console.warning')); // eslint-disable-line no-console
                        } else {
                            redirect = true;
                        }
                    }

                    if (redirect) {
                        return Promise.resolve($rootScope.redirectToLogin())
                            .then(() => {
                                return $q.reject(response);
                            });
                    } else {
                        return $q.reject(response);
                    }
                }
            };
        }]);


