import 'angular/core/services';
import 'angular/core/directives';
import 'angular/rest/license.rest.service';
import 'angular/settings/controllers';
import 'angular/security/services';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';

angular.module('graphdb.framework.settings', [
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.rest.license.service',
    'graphdb.framework.settings.controllers',
    'graphdb.framework.security.services'
])
    .config(config)
    .run(run);

config.$inject = ['$httpProvider', '$routeProvider'];

function config($httpProvider, $routeProvider) {
    $httpProvider.interceptors.push('$unauthorizedInterceptor');

    $routeProvider
        .when('/license/register', {
            templateUrl: 'pages/registerLicenseInfo.html',
            controller: 'RegisterLicenseCtrl',
            title: 'Register GraphDB License',
            helpInfo: 'The Register GraphDB License view is where you register your GraphDB. '
            + 'Upload the generated binary or simply copy the license key in the designated text area.'
        })
        .when('/license', {
            templateUrl: 'pages/licenseInfo.html',
            controller: 'LicenseCtrl',
            title: 'Current license for this location',
            helpInfo: 'The GraphDB License Information view allows you to check the details of your current license. '
        })
        .when('/alert-samples', {
            templateUrl: 'pages/alert-samples.html'
        })
        .when('/toast-samples', {
            templateUrl: 'pages/toast-samples.html'
        })
        .when('/loader-samples', {
            templateUrl: 'pages/loader-samples.html'
        })
        .when('/loader-test', {
            controller: 'LoaderSamplesCtrl',
            templateUrl: 'pages/loader-test.html'
        });
}

run.$inject = ['$rootScope', '$location'];

function run($rootScope, $location) {
    $rootScope.$on('$locationChangeStart', function () {
        if ($rootScope.isLicenseHardcoded && $location.url() === '/license/register') {
            $location.path('license');
        }
    });
}
