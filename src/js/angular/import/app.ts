import * as angular from 'angular';
import 'angular/core/services';
import 'angular/core/directives';
import 'angular/import/controllers/import-view.controller';
import 'angular/import/directives/validate-uri.directive';
import 'angular/import/directives/import-progress-indicator.directive';
import 'angular/import/directives/import-resource-tree.directive';
import 'angular/core/services/repositories.service';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';

const modules = [
    'toastr',
    'ngRoute',
    'ngFileUpload',
    'ui.bootstrap',
    'graphdb.framework.impex.import.directives',
    'graphdb.framework.impex.import.controllers',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.import.directives.validate-uri',
    'graphdb.framework.import.directives.import-progress-indicator',
    'graphdb.framework.import.directives.import-resource-tree'
];

angular.module('graphdb.framework.impex.import', modules);
