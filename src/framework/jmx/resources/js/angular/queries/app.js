define(['angular/core/services',
        'angular/core/directives',
        'angular/queries/controllers',
        'angular/queries/directives'],
    function(){

		var queriesMonitoringApp = angular.module('graphdb.framework.jmx.queries',
				['toastr',
				 'ui.bootstrap',
				 'graphdb.framework.jmx.queries.controllers',
				 'graphdb.framework.jmx.queries.directives',
				 'graphdb.framework.core.directives']);

		queriesMonitoringApp.config(['$menuItemsProvider', '$routeProvider', function ($menuItemsProvider, $routeProvider) {

			   	$routeProvider.when('/monitor/queries', {
			  		templateUrl : 'pages/monitor/queries.html',
			  		controller : 'QueriesCtrl',
					title: 'Query and Update monitoring',
					helpInfo: 'The Queries and Updates monitoring view shows all running queries or updates in GraphDB. '
					            + 'A query or update can be terminated by pressing the Abort button.'
			  	})

			  	$menuItemsProvider.addItem({label : 'Monitor', href : '#', order : 1, role : 'ROLE_REPO_MANAGER', icon: "icon-monitoring"});
				$menuItemsProvider.addItem({label : 'Queries and Updates', href : 'monitor/queries', order : 1, parent : 'Monitor'});

		}]);

		return queriesMonitoringApp;
});
