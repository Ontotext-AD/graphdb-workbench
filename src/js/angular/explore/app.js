import 'angular/core/services';
import 'angular/core/directives';
import 'angular/explore/statements.service';
import 'angular/explore/controllers';
import 'angular/explore/directives';
import 'angular-xeditable/dist/js/xeditable.min';
import 'lib/angucomplete-alt/angucomplete-alt-onto.min';

const modules = [
    'ngRoute',
    'toastr',
    'xeditable',
    'angucomplete-alt-onto',
    'graphdb.framework.explore.services',
    'graphdb.framework.explore.controllers',
    'graphdb.framework.explore.directives'
];

const exploreApp = angular.module('graphdb.framework.explore', modules);

exploreApp.config(['$routeProvider', '$menuItemsProvider', function ($routeProvider, $menuItemsProvider) {
    $routeProvider.when('/resource', {
        templateUrl: 'pages/explore.html',
        controller: 'ExploreCtrl',
        title: 'Resource'
    }).when('/resource/edit', {
        templateUrl: 'pages/edit.html',
        controller: 'EditResourceCtrl',
        title: 'Resource'
    }).when('/resource/:any*', {
        templateUrl: 'pages/explore.html',
        controller: 'ExploreCtrl',
        title: 'Resource'
    });

    $menuItemsProvider.addItem({
        label: 'Explore',
        href: '#',
        order: 1,
        role: 'IS_AUTHENTICATED_FULLY',
        icon: "icon-data"
    });
}]);
