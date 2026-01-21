import 'angular/core/services';
import {UnauthenticatedInterceptor, UnauthorizedInterceptor} from '@ontotext/workbench-api';
import {LoggerProvider} from '../services/logger-provider';

const logger = LoggerProvider.logger;

angular.module('graphdb.framework.core.interceptors.unauthorized', [])
    .factory('$unauthorizedInterceptor', ['$q', '$rootScope', '$translate', '$location',
        function($q, $rootScope, $translate, $location) {
            const unauthenticatedInterceptor = new UnauthenticatedInterceptor();
            const unauthorizedInterceptor = new UnauthorizedInterceptor();

            return {
                'responseError': function(response) {
                    let redirect = false;

                    if (response.status === 401) {
                        if (unauthenticatedInterceptor.shouldRedirectToLogin(response.config.url)) {
                            redirect = true;
                        }
                    } else if (response.status === 403) {
                        const pageUrl = $location.path();

                        logger.info($translate.instant('unauthorized.console.warning'));
                        unauthorizedInterceptor.updateRestrictionsForPage(pageUrl);
                        if (unauthorizedInterceptor.shouldRedirectToLogin()) {
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
                },
            };
        }]);


