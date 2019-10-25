import 'angular/core/services';
import 'angular/core/directives';
import 'angular/import/controllers';
import 'angular/import/directives';
import 'angular/repositories/services';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';

const modules = [
    'toastr',
    'ngRoute',
    'ngFileUpload',
    'ui.bootstrap',
    'graphdb.framework.impex.import.directives',
    'graphdb.framework.impex.import.controllers',
    'graphdb.framework.repositories.services',
    'graphdb.framework.core.directives'
];

angular.module('graphdb.framework.impex.import', modules);
