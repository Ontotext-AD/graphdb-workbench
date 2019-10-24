import 'angular/core/services';
import 'angular/core/directives';
import 'angular/security/controllers';
import 'angular/security/services';

const modules = [
    'toastr',
    'ui.bootstrap',
    'ngRoute',
    'graphdb.framework.security.controllers',
    'graphdb.framework.security.services'
];

const securityApp = angular.module('graphdb.framework.security', modules);

securityApp.config(['$locationProvider', '$httpProvider',
    function ($locationProvider, $httpProvider) {
        $httpProvider.interceptors.push('$unauthorizedInterceptor');

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    }
]);
