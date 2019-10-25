import 'angular/core/services';
import 'angular/core/directives';
import 'angular/rest/license.rest.service';
import 'angular/settings/controllers';
import 'angular/core/interceptors/unauthorized.interceptor';
import 'angular/core/services/jwt-auth.service';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';

angular.module('graphdb.framework.settings', [
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.rest.license.service',
    'graphdb.framework.settings.controllers',
    'graphdb.framework.core.interceptors.unauthorized',
    'graphdb.framework.core.services.jwtauth'
])
    .config(config)
    .run(run);

config.$inject = ['$httpProvider', '$routeProvider'];

function config($httpProvider) {
    $httpProvider.interceptors.push('$unauthorizedInterceptor');
}

run.$inject = ['$rootScope', '$location'];

function run($rootScope, $location) {
    $rootScope.$on('$locationChangeStart', function () {
        if ($rootScope.isLicenseHardcoded && $location.url() === '/license/register') {
            $location.path('license');
        }
    });
}
