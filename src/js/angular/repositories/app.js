import 'angular/core/services';
import 'angular/core/directives';
import 'angular/core/controllers';
import 'angular/repositories/controllers';
import 'angular/repositories/directives';
import 'angular/repositories/services';
import 'angular/settings/app';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';

const modules = [
    'ui.bootstrap',
    'toastr',
    'ngCookies',
    'ngRoute',
    'graphdb.framework.repositories.controllers',
    'graphdb.framework.repositories.directives',
    'graphdb.framework.repositories.services',
    'graphdb.framework.core.directives',
    'graphdb.framework.core.controllers',
    'graphdb.framework.settings'
];

angular.module('graphdb.framework.repositories', modules);
