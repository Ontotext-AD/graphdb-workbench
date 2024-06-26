import 'angular/core/services';
import 'angular/core/directives';
import 'angular/core/services/repositories.service';
import 'angular/namespaces/controllers';
import 'angular/namespaces/directives';
import 'angular/core/directives/paginations';
import 'angular-xeditable/dist/js/xeditable.min';

const modules = [
    'LocalStorageModule',
    'xeditable',
    'ngAnimate',
    'ngRoute',
    'toastr',
    'graphdb.framework.namespaces.controllers',
    'graphdb.framework.namespaces.directives',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives',
    'graphdb.framework.core.directives.paginations'
];

const namespacesApp = angular.module('graphdb.framework.namespaces', modules);

namespacesApp.run(['editableOptions', function (editableOptions) {
    editableOptions.theme = 'bs3';
}]);
