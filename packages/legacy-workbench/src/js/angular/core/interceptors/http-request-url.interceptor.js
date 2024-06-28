import 'angular/core/services';

angular.module('graphdb.framework.core.interceptors.http-request-url', [
    'ngCookies'
]).factory('$httpRequestURLInterceptor', [function() {
    return {
        request: function(config) {
            const currentHost = 'http://localhost:9001/';

            if (!config.url.startsWith(currentHost) && !config.url.startsWith("http:") && !config.url.startsWith("https:")) {
                config.url = currentHost + config.url;
            }
            // console.log("-----------------------" + config.url + "-----------------------");
            // console.log('-------------------------' + JSON.stringify(config) + '--------------------------------------')
            return config;
        }
    };
}]);


