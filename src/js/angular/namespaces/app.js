import 'angular/core/services';
import 'angular/core/directives';
import 'angular/repositories/services';
import 'angular/namespaces/controllers';
import 'angular/namespaces/directives';
import 'angular-xeditable/dist/js/xeditable.min';

const modules = [
    'LocalStorageModule',
    'xeditable',
    'ngAnimate',
    'ngRoute',
    'toastr',
    'graphdb.framework.namespaces.controllers',
    'graphdb.framework.namespaces.directives',
    'graphdb.framework.repositories.services',
    'graphdb.framework.core.directives'
];

const namespacesApp = angular.module('graphdb.framework.namespaces', modules);

namespacesApp.run(['editableOptions', function (editableOptions) {
    editableOptions.theme = 'bs3';
}]);
