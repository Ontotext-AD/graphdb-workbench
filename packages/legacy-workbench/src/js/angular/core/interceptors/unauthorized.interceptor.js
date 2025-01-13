import 'angular/core/services';
import {ServiceProvider, SecurityContextService} from '@ontotext/workbench-api';

angular.module('graphdb.framework.core.interceptors.unauthorized', [
    'ngCookies'
])
    .factory('$unauthorizedInterceptor', ['$q', '$location', '$rootScope', '$translate',
        function($q, $location, $rootScope, $translate) {
            return {
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
                      const pageUrl = $location.path();
                      if ($rootScope.setPermissionDenied(pageUrl)) {
                            console.log($translate.instant('unauthorized.console.warning')); // eslint-disable-line no-console
                            const securityContext = ServiceProvider.get(SecurityContextService);
                            const restrictedPages = securityContext.getRestrictedPages();
                            restrictedPages.setPageRestriction(pageUrl);
                            securityContext.updateRestrictedPages(restrictedPages);
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


