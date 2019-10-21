import 'angular/core/services';
import 'angular/core/directives';
import 'angular/security/controllers';
import 'angular/security/services';
import 'angular/security/directives';

const modules = [
    'toastr',
    'ui.bootstrap',
    'ngRoute',
    'graphdb.framework.security.controllers',
    'graphdb.framework.security.directives',
    'graphdb.framework.security.services'
];

const securityApp = angular.module('graphdb.framework.security', modules);

securityApp.config(['$routeProvider', '$locationProvider', '$menuItemsProvider', '$httpProvider',
    function ($routeProvider, $locationProvider, $menuItemsProvider, $httpProvider) {
        $httpProvider.interceptors.push('$unauthorizedInterceptor');

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    }
]);
