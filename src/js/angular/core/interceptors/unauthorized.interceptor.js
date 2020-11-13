import 'angular/core/services';

angular.module('graphdb.framework.core.interceptors.unauthorized', [
    'ngCookies'
])
    .factory('$unauthorizedInterceptor', ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
        return {
            'responseError': function (response) {
                let redirect = false;
                let expired = false;

                if (response.status === 401) {
                    if (response.config.url.indexOf('rest/security/authenticatedUser') < 0 && !$rootScope.hasExternalAuthUser()) {
                        // Redirect to login page only if this isn't the endpoint that checks
                        // the externally logged user and when no external authentication is available.
                        // This check is essential for making free access and external auth working.
                        redirect = true;
                    }
                } else if (response.status === 403) {
                    if ($rootScope.setPermissionDenied($location.path())) {
                        console.log('Permission to page denied. Some errors in the console are normal.'); // eslint-disable-line no-console
                    } else {
                        redirect = true;
                    }
                } else if (response.status === 409) {
                    // We get 409 only if a GDB token expired, OpenID needs to be handled differently
                    // as it returns 401.
                    redirect = true;
                    expired = true;
                }

                if (redirect) {
                    return Promise.resolve($rootScope.redirectToLogin(expired))
                        .then(() => {
                            return $q.reject(response);
                        });
                } else {
                    return $q.reject(response);
                }
            }
        };
    }]);


