define(['angular/core/services',
        'angular/core/directives',
        'angular/explore/services',
        'angular/explore/controllers',
        'angular/explore/directives',
        'lib/angular-xeditable/0.1.8/js/xeditable.min',
        'lib/angucomplete-alt-onto.min'],

    function () {

        var exploreApp = angular.module(
            'graphdb.framework.explore',
            ['ngRoute',
                'toastr',
                'xeditable',
                'angucomplete-alt-onto',
                'graphdb.framework.explore.services',
                'graphdb.framework.explore.controllers',
                'graphdb.framework.explore.directives']);

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

        return exploreApp;

    });
