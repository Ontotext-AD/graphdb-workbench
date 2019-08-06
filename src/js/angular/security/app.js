import 'angular/core/services';
import 'angular/core/directives';
import 'angular/security/controllers';
import 'angular/security/services';
import 'angular/security/directives';

const modules = [
    'toastr',
    'ui.bootstrap',
    'ngRoute',
    'graphdb.framework.security.controllers',
    'graphdb.framework.security.directives',
    'graphdb.framework.security.services'
];

const securityApp = angular.module('graphdb.framework.security', modules);

securityApp.config(['$routeProvider', '$locationProvider', '$menuItemsProvider', '$httpProvider',
    function ($routeProvider, $locationProvider, $menuItemsProvider, $httpProvider) {

        $httpProvider.interceptors.push('$unauthorizedInterceptor');

        $routeProvider.when('/users', {
            templateUrl: 'js/angular/security/templates/users.html',
            controller: 'UsersCtrl',
            title: 'Users and Access',
            helpInfo: 'The Users and Access view is used to manage the users and their access to the GraphDB repositories. '
            + 'You can also enable or disable the security of the entire Workbench. '
            + 'When disabled, everyone has full access to the repositories and the admin functionality. '
        }).when('/user/create', {
            templateUrl: 'js/angular/security/templates/user.html',
            controller: 'AddUserCtrl',
            title: 'Create new user'
        }).when('/login', {
            templateUrl: 'pages/login.html',
            controller: 'LoginCtrl',
            title: 'Login'
        }).when('/user/:userId', {
            templateUrl: 'js/angular/security/templates/user.html',
            controller: 'EditUserCtrl',
            title: 'Edit user'
        }).when('/settings', {
            templateUrl: 'js/angular/security/templates/user.html',
            controller: 'ChangeUserPasswordSettingsCtrl',
            title: 'Settings'
        }).when('/accessdenied', {
            templateUrl: 'pages/accessdenied.html',
            title: 'Access Denied'
        }).when('/rolesmappings', {
            templateUrl: 'js/angular/security/templates/roles.html',
            controller: 'RolesMappingController',
            title: 'Roles per Request Mapping'
        });

        $menuItemsProvider.addItem({label: 'Setup', href: '#', order: 5, role: 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"});
        $menuItemsProvider.addItem({
            label: 'Users and Access', href: 'users', order: 2, parent: 'Setup', role: 'ROLE_ADMIN',
            children: [{
                href: 'user/create',
                children: []
            }]
        });
        $menuItemsProvider.addItem({label: 'My Settings', href: 'settings', order: 6, parent: 'Setup', role: 'ROLE_USER'});

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    }]);
