define(['angular/core/services',
		'angular/core/directives',
		'angular/core/controllers',
		'angular/repositories/controllers',
        'angular/repositories/directives',
        'angular/repositories/services',
		'angular/settings/app',
		'lib/ng-file-upload.min',
		'lib/ng-file-upload-shim.min'],

    function(){

		var repositoriesApp = angular.module(
				'graphdb.framework.repositories',
				['ui.bootstrap',
				 'toastr',
				 'ngCookies',
				 'ngRoute',
				 'graphdb.framework.repositories.controllers',
				 'graphdb.framework.repositories.directives',
				 'graphdb.framework.repositories.services',
				 'graphdb.framework.core.directives',
				 'graphdb.framework.core.controllers',
				 'graphdb.framework.settings']);


		repositoriesApp.config(['$menuItemsProvider', '$routeProvider', function ($menuItemsProvider, $routeProvider) {

		       	$routeProvider.when('/repository', {
			  		templateUrl : 'pages/repositories.html',
			  		controller : 'LocationsAndRepositoriesCtrl',
					title: 'Repositories',
					helpInfo: 'The Repositories view is used to manage repositories and connect to remote locations. '
					            + 'A location represents a local or remote instance of GraphDB. '
					            + 'Only a single location can be active at a given time.'
			  	}).when('/repository/create', {
			  		templateUrl : 'pages/repository.html',
			  		controller : 'AddRepositoryCtrl',
					title: 'Create Repository'
			  	}).when('/repository/edit/:repositoryId', {
			  		templateUrl : 'pages/repository.html',
			  		controller : 'EditRepositoryCtrl',
					title: 'Edit Repository'
			  	});

		       	$menuItemsProvider.addItem({label : 'Setup', href : '#', order : 5, role : 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"});
				$menuItemsProvider.addItem({label : 'Repositories', href : 'repository', order : 1, role: 'ROLE_REPO_MANAGER', parent : 'Setup',
					children: [{
						href: 'repository/create',
						children: []
					}]
				});

		}]);

		return repositoriesApp;

	});
