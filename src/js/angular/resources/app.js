define(['angular/core/services',
        'angular/core/directives',
        'angular/resources/controllers',
        'angular/resources/directives',
        'angular/repositories/services',
        'lib/nvd3/angular-nvd3'],
    function(){

	var resourceMonitoringApp = angular.module('graphdb.framework.jmx.resources',
									['toastr',
								 	'ui.bootstrap',
								 	'nvd3',
								 	'graphdb.framework.jmx.resources.controllers',
								 	'graphdb.framework.jmx.resources.directives',
									 'graphdb.framework.repositories.services',
									 'graphdb.framework.core.directives']);

 	resourceMonitoringApp.config(['$menuItemsProvider', '$routeProvider', function ($menuItemsProvider, $routeProvider) {

			   	$routeProvider.when('/monitor/resources', {
			  		templateUrl : 'pages/monitor/resources.html',
			  		controller : 'ResourcesCtrl',
					title: 'Resource monitoring',
					helpInfo: 'The Resource monitoring view shows the usage of various system resources, '
					            + 'such as memory and CPU, for the currently active location.'
			  	})

			  	$menuItemsProvider.addItem({label : 'Monitor', href : '#', order : 4, role : 'ROLE_REPO_MANAGER', icon: "icon-monitoring"});
				$menuItemsProvider.addItem({label : 'Resources', href : 'monitor/resources', order : 2, parent : 'Monitor'});

		}]);

	 return resourceMonitoringApp;
});
