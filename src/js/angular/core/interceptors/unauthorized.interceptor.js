import 'angular/core/services';

angular.module('graphdb.framework.core.interceptors.unauthorized', [
    'ngCookies'
])
    .factory('$unauthorizedInterceptor', ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
        return {
            'responseError': function (response) {
                if (response.status === 401) {
                    $rootScope.redirectToLogin();
                    return $q.reject(response);
                } else if (response.status === 403) {
                    if ($rootScope.setPermissionDenied($location.path())) {
                        console.log('Permission to page denied. Some errors in the console are normal.'); // eslint-disable-line no-console
                    } else {
                        $rootScope.redirectToLogin();
                    }
                    return $q.reject(response);
                } else if (response.status === 409) {
                    $rootScope.redirectToLogin(true);
                    return $q.reject(response);
                } else {
                    return $q.reject(response);
                }
            }
        };
    }]);


