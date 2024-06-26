import 'angular/core/services';
import 'angular/core/directives';
import 'angular/security/controllers';
import 'angular/core/services/jwt-auth.service';
import 'ng-tags-input/build/ng-tags-input.min';

const modules = [
    'toastr',
    'ui.bootstrap',
    'ngRoute',
    'graphdb.framework.security.controllers',
    'graphdb.framework.core.interceptors.unauthorized',
    'graphdb.framework.core.interceptors.authentication',
    'graphdb.framework.core.services.jwtauth'
];

angular.module('graphdb.framework.security', modules);
