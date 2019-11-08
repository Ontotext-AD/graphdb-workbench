import 'angular/core/services';
import 'angular/core/directives';
import 'angular/security/controllers';
import 'angular/core/interceptors/unauthorized.interceptor';
import 'angular/core/services/jwt-auth.service';

const modules = [
    'toastr',
    'ui.bootstrap',
    'ngRoute',
    'graphdb.framework.security.controllers',
    'graphdb.framework.core.interceptors.unauthorized',
    'graphdb.framework.core.services.jwtauth'
];

const securityApp = angular.module('graphdb.framework.security', modules);

securityApp.config(['$locationProvider', '$httpProvider',
    function ($locationProvider, $httpProvider) {
        $httpProvider.interceptors.push('$unauthorizedInterceptor');

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    }
]);
