define(['angular/core/services',
        'angular/core/directives',
        'angular/repositories/services',
        'angular/namespaces/controllers',
        'angular/namespaces/directives',
        'webjars/angular-xeditable/0.1.8/js/xeditable.min'
        ],

    function(){

		var namespaceslApp = angular.module(
				'graphdb.framework.namespaces',
				['LocalStorageModule',
				 'xeditable',
				 'ngAnimate',
				 'ngRoute',
				 'toastr',
				 'graphdb.framework.namespaces.controllers',
				 'graphdb.framework.namespaces.directives',
				 'graphdb.framework.repositories.services',
				 'graphdb.framework.core.directives'])

		namespaceslApp.config(['$routeProvider', '$menuItemsProvider', function($routeProvider, $menuItemsProvider) {
		   	$routeProvider.when('/namespaces', {
		  		templateUrl : 'pages/namespaces.html',
		  		controller : 'NamespacesCtrl',
				title: 'Namespaces',
				helpInfo: 'The Namespaces view provides an overview of all namespaces used in your data. '
				            + 'Here you can add, remove and modify them. '
		  	});


	       	$menuItemsProvider.addItem({label : 'Setup', href : '#', order : 5, role : 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"});
			$menuItemsProvider.addItem({label : 'Namespaces', href : 'namespaces', order : 30, parent : 'Setup'});

	    }])

	    namespaceslApp.run(['editableOptions', function(editableOptions) {
	        editableOptions.theme = 'bs3';
	    }]);

		return namespaceslApp;

	});
