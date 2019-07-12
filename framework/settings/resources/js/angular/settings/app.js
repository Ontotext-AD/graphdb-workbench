define(['angular/core/services',
        'angular/core/directives',
        'angular/settings/services',
        'angular/settings/controllers',
        'angular/security/services',
        'ng-file-upload.min',
        'ng-file-upload-shim.min'],

    function () {

		angular.module('graphdb.framework.settings',[
		    'toastr',
		    'ui.bootstrap',
		    'graphdb.framework.settings.services',
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
                    helpInfo: "The GraphDB License Information view allows you to check the details of your current license. "
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

		run.$inject = ['$rootScope', '$location', '$cookieStore'];
        function run($rootScope, $location, $cookieStore) {
            $rootScope.$on('$locationChangeStart', function (event, next, current) {
                if ($rootScope.isLicenseHardcoded && $location.url() === "/license/register") {
                    $location.path("license");
                }
            });
        }
});
