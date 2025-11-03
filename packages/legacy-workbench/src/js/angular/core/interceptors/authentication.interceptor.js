import 'angular/core/services';
import {AuthRequestInterceptor} from '@ontotext/workbench-api';

angular.module('graphdb.framework.core.interceptors.authentication', [])
    .factory('$authenticationInterceptor', authorizationInterceptor);

function authorizationInterceptor() {
    return {
        'request': function(config) {
            const authRequestInterceptor = new AuthRequestInterceptor();
            if (!authRequestInterceptor.shouldProcess({url: config.url})) {
                return config;
            }
            const headers = config.headers || {};
            authRequestInterceptor.populateHeaders(headers);
            config.headers = headers;
            return config;
        },
    };
};
