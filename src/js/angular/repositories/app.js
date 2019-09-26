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

const repositoriesApp = angular.module('graphdb.framework.repositories', modules);

repositoriesApp.config(['$menuItemsProvider', '$routeProvider', function ($menuItemsProvider, $routeProvider) {

    $routeProvider.when('/repository', {
        templateUrl: 'pages/repositories.html',
        controller: 'LocationsAndRepositoriesCtrl',
        title: 'Repositories',
        helpInfo: 'The Repositories view is used to manage repositories and connect to remote locations. '
        + 'A location represents a local or remote instance of GraphDB. '
        + 'Only a single location can be active at a given time.'
    }).when('/repository/create', {
        templateUrl: 'pages/repository.html',
        controller: 'AddRepositoryCtrl',
        title: 'Create Repository'
    }).when('/repository/edit/:repositoryId', {
        templateUrl: 'pages/repository.html',
        controller: 'EditRepositoryCtrl',
        title: 'Edit Repository'
    });

    $menuItemsProvider.addItem({label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"});
    $menuItemsProvider.addItem({
        label: 'Repositories', href: 'repository', order: 1, role: 'ROLE_REPO_MANAGER', parent: 'Setup',
        children: [{
            href: 'repository/create',
            children: []
        }]
    });

}]);

