import 'angular/core/services';
import 'angular/core/directives';
import 'angular/core/controllers';
import 'angular/repositories/controllers';
import 'angular/repositories/ontop-repo.directive';
import 'angular/repositories/fedx-repo.directive';
import 'angular/core/services/repositories.service';
import 'angular/settings/app';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';

const modules = [
    'ui.bootstrap',
    'toastr',
    'ngCookies',
    'ngRoute',
    'graphdb.framework.repositories.controllers',
    'graphdb.framework.repositories.ontop-repo.directive',
    'graphdb.framework.repositories.fedx-repo.directive',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives',
    'graphdb.framework.core.controllers',
    'graphdb.framework.settings'
];

angular.module('graphdb.framework.repositories', modules);
