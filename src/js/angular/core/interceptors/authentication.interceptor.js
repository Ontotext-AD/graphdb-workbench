import 'angular/core/services';

angular.module('graphdb.framework.core.interceptors.authentication', [
    'ngCookies'
])
    .factory('$authenticationInterceptor', ['AuthTokenService', 'LocalStorageAdapter', 'LSKeys',
        function(AuthTokenService, LocalStorageAdapter, LSKeys) {
            return {
                'request': function(config) {
                    const headers = config.headers || {};
                    // Angular doesn't send this header by default, and we need it to detect XHR requests
                    // so that we don't advertise Basic auth with them.
                    headers['X-Requested-With'] = 'XMLHttpRequest';
                    headers.Authorization = AuthTokenService.getAuthToken();

                    const repositoryId = LocalStorageAdapter.get(LSKeys.REPOSITORY_ID);
                    const repositoryLocation = LocalStorageAdapter.get(LSKeys.REPOSITORY_LOCATION);

                    headers['X-GraphDB-Repository'] = repositoryId ? repositoryId : undefined;
                    headers['X-GraphDB-Repository-Location'] = repositoryLocation ? repositoryLocation : undefined;

                    config.headers = headers;
                    return config;
                }
            };
        }]);


